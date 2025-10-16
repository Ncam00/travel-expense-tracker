// Expense splitting and debt calculation service
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Split types
export const SPLIT_TYPES = {
  EQUAL: 'equal',
  CUSTOM: 'custom', 
  PERCENTAGE: 'percentage'
};

// Calculate equal split for expense
export const calculateEqualSplit = (totalAmount, memberIds) => {
  const amountPerPerson = totalAmount / memberIds.length;
  return memberIds.map(userId => ({
    userId,
    amount: Number(amountPerPerson.toFixed(2))
  }));
};

// Calculate custom split for expense
export const calculateCustomSplit = (totalAmount, customSplits) => {
  // Validate that custom splits add up to total
  const splitTotal = customSplits.reduce((sum, split) => sum + split.amount, 0);
  
  if (Math.abs(splitTotal - totalAmount) > 0.01) {
    throw new Error(`Split amounts (${splitTotal}) don't match total (${totalAmount})`);
  }
  
  return customSplits.map(split => ({
    userId: split.userId,
    amount: Number(split.amount.toFixed(2))
  }));
};

// Calculate percentage split for expense
export const calculatePercentageSplit = (totalAmount, percentageSplits) => {
  // Validate that percentages add up to 100%
  const percentageTotal = percentageSplits.reduce((sum, split) => sum + split.percentage, 0);
  
  if (Math.abs(percentageTotal - 100) > 0.01) {
    throw new Error(`Percentages (${percentageTotal}%) don't add up to 100%`);
  }
  
  return percentageSplits.map(split => ({
    userId: split.userId,
    amount: Number(((totalAmount * split.percentage) / 100).toFixed(2)),
    percentage: split.percentage
  }));
};

// Add expense with splitting
export const addSplitExpense = async (expenseData, splitType, splitDetails, paidBy) => {
  try {
    let calculatedSplits;
    
    switch (splitType) {
      case SPLIT_TYPES.EQUAL:
        calculatedSplits = calculateEqualSplit(expenseData.amount, splitDetails.memberIds);
        break;
      case SPLIT_TYPES.CUSTOM:
        calculatedSplits = calculateCustomSplit(expenseData.amount, splitDetails.customSplits);
        break;
      case SPLIT_TYPES.PERCENTAGE:
        calculatedSplits = calculatePercentageSplit(expenseData.amount, splitDetails.percentageSplits);
        break;
      default:
        throw new Error('Invalid split type');
    }
    
    // Create expense with split information
    const expense = {
      ...expenseData,
      splitType,
      splitDetails: calculatedSplits,
      paidBy,
      totalAmount: expenseData.amount,
      isSettled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const expenseRef = await addDoc(collection(db, 'expenses'), expense);
    
    // Update trip balances
    await updateTripBalances(expenseData.tripId);
    
    return {
      id: expenseRef.id,
      ...expense
    };
    
  } catch (error) {
    console.error('Error adding split expense:', error);
    throw error;
  }
};

// Calculate trip balances for all members
export const calculateTripBalances = async (tripId) => {
  try {
    // Get all expenses for trip
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('tripId', '==', tripId)
    );
    const expensesSnapshot = await getDocs(expensesQuery);
    const expenses = expensesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get trip members
    const tripDoc = await getDoc(doc(db, 'trips', tripId));
    const tripData = tripDoc.data();
    const members = tripData.members || [];
    
    // Calculate balances for each member
    const balances = {};
    
    // Initialize balances
    members.forEach(member => {
      balances[member.userId] = {
        userId: member.userId,
        email: member.email,
        totalPaid: 0,
        totalOwed: 0,
        netBalance: 0,
        expenses: []
      };
    });
    
    // Process each expense
    expenses.forEach(expense => {
      const paidBy = expense.paidBy;
      const splits = expense.splitDetails || [];
      
      // Add to total paid for payer
      if (balances[paidBy]) {
        balances[paidBy].totalPaid += expense.totalAmount;
        balances[paidBy].expenses.push({
          id: expense.id,
          type: 'paid',
          amount: expense.totalAmount,
          description: expense.description
        });
      }
      
      // Add to total owed for each split member
      splits.forEach(split => {
        if (balances[split.userId]) {
          balances[split.userId].totalOwed += split.amount;
          balances[split.userId].expenses.push({
            id: expense.id,
            type: 'owed',
            amount: split.amount,
            description: expense.description
          });
        }
      });
    });
    
    // Calculate net balances
    Object.values(balances).forEach(balance => {
      balance.netBalance = balance.totalPaid - balance.totalOwed;
    });
    
    return Object.values(balances);
    
  } catch (error) {
    console.error('Error calculating trip balances:', error);
    throw error;
  }
};

// Smart debt settlement algorithm - minimize number of transactions
export const calculateOptimalSettlements = (balances) => {
  try {
    // Separate creditors (positive balance) and debtors (negative balance)
    const creditors = balances
      .filter(b => b.netBalance > 0.01)
      .map(b => ({ ...b, remaining: b.netBalance }))
      .sort((a, b) => b.remaining - a.remaining);
    
    const debtors = balances
      .filter(b => b.netBalance < -0.01)
      .map(b => ({ ...b, remaining: Math.abs(b.netBalance) }))
      .sort((a, b) => b.remaining - a.remaining);
    
    const settlements = [];
    let creditorIndex = 0;
    let debtorIndex = 0;
    
    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex];
      const debtor = debtors[debtorIndex];
      
      // Calculate settlement amount
      const settlementAmount = Math.min(creditor.remaining, debtor.remaining);
      
      if (settlementAmount > 0.01) {
        settlements.push({
          fromUserId: debtor.userId,
          fromEmail: debtor.email,
          toUserId: creditor.userId,
          toEmail: creditor.email,
          amount: Number(settlementAmount.toFixed(2)),
          status: 'pending'
        });
        
        // Update remaining balances
        creditor.remaining -= settlementAmount;
        debtor.remaining -= settlementAmount;
      }
      
      // Move to next person if current one is settled
      if (creditor.remaining <= 0.01) creditorIndex++;
      if (debtor.remaining <= 0.01) debtorIndex++;
    }
    
    return settlements;
    
  } catch (error) {
    console.error('Error calculating settlements:', error);
    throw error;
  }
};

// Update trip balances (called after expense changes)
export const updateTripBalances = async (tripId) => {
  try {
    const balances = await calculateTripBalances(tripId);
    const settlements = calculateOptimalSettlements(balances);
    
    // Update trip with current balances and settlements
    await updateDoc(doc(db, 'trips', tripId), {
      balances,
      settlements,
      lastBalanceUpdate: new Date(),
      updatedAt: new Date()
    });
    
    return { balances, settlements };
    
  } catch (error) {
    console.error('Error updating trip balances:', error);
    throw error;
  }
};

// Mark settlement as completed
export const markSettlementCompleted = async (tripId, fromUserId, toUserId, amount) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripRef);
    const tripData = tripDoc.data();
    
    // Find and update the settlement
    const updatedSettlements = tripData.settlements.map(settlement => {
      if (settlement.fromUserId === fromUserId && 
          settlement.toUserId === toUserId && 
          Math.abs(settlement.amount - amount) < 0.01) {
        return {
          ...settlement,
          status: 'completed',
          settledAt: new Date()
        };
      }
      return settlement;
    });
    
    // Update trip
    await updateDoc(tripRef, {
      settlements: updatedSettlements,
      updatedAt: new Date()
    });
    
    // Recalculate balances after settlement
    await updateTripBalances(tripId);
    
    return { message: 'Settlement marked as completed' };
    
  } catch (error) {
    console.error('Error marking settlement completed:', error);
    throw error;
  }
};

// Get trip financial summary
export const getTripFinancialSummary = async (tripId) => {
  try {
    const tripDoc = await getDoc(doc(db, 'trips', tripId));
    const tripData = tripDoc.data();
    
    const balances = await calculateTripBalances(tripId);
    const settlements = calculateOptimalSettlements(balances);
    
    // Calculate summary statistics
    const totalSpent = balances.reduce((sum, b) => sum + b.totalPaid, 0);
    const totalOwed = balances.reduce((sum, b) => sum + Math.max(0, -b.netBalance), 0);
    const pendingSettlements = settlements.filter(s => s.status === 'pending').length;
    
    return {
      tripId,
      tripName: tripData.name,
      totalBudget: tripData.totalBudget || 0,
      totalSpent,
      remainingBudget: (tripData.totalBudget || 0) - totalSpent,
      totalOwed,
      balances,
      settlements,
      pendingSettlements,
      isFullySettled: pendingSettlements === 0
    };
    
  } catch (error) {
    console.error('Error getting trip financial summary:', error);
    throw error;
  }
};

// Validate split before saving
export const validateExpenseSplit = (totalAmount, splitType, splitData) => {
  try {
    switch (splitType) {
      case SPLIT_TYPES.EQUAL:
        if (!splitData.memberIds || splitData.memberIds.length === 0) {
          throw new Error('Must select at least one member for equal split');
        }
        break;
        
      case SPLIT_TYPES.CUSTOM:
        const customTotal = splitData.customSplits.reduce((sum, split) => sum + split.amount, 0);
        if (Math.abs(customTotal - totalAmount) > 0.01) {
          throw new Error(`Custom split total (${customTotal}) doesn't match expense amount (${totalAmount})`);
        }
        break;
        
      case SPLIT_TYPES.PERCENTAGE:
        const percentageTotal = splitData.percentageSplits.reduce((sum, split) => sum + split.percentage, 0);
        if (Math.abs(percentageTotal - 100) > 0.01) {
          throw new Error(`Percentages must add up to 100% (currently ${percentageTotal}%)`);
        }
        break;
        
      default:
        throw new Error('Invalid split type');
    }
    
    return true;
    
  } catch (error) {
    console.error('Split validation error:', error);
    throw error;
  }
};