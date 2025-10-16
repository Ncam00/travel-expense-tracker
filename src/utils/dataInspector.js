import { db } from '../config/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

// Data inspection utilities for testing
export const inspectUserData = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    console.log('🔍 Inspecting data for user:', userId);
    
    // Get trips
    const tripsQuery = query(
      collection(db, 'trips'), 
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const tripsSnapshot = await getDocs(tripsQuery);
    const trips = tripsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get expenses
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const expensesSnapshot = await getDocs(expensesQuery);
    const expenses = expensesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate statistics
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoriesUsed = [...new Set(expenses.map(e => e.category))];
    const locationsVisited = [...new Set(expenses.map(e => e.location?.name).filter(Boolean))];
    const transportModes = [...new Set(expenses.map(e => e.transportMode).filter(Boolean))];

    const report = {
      user: {
        id: userId,
        dataCreatedAt: new Date().toISOString()
      },
      trips: {
        count: trips.length,
        data: trips
      },
      expenses: {
        count: expenses.length,
        totalAmount: totalSpent,
        categories: categoriesUsed,
        locations: locationsVisited,
        transportModes: transportModes,
        data: expenses
      },
      summary: {
        tripsCount: trips.length,
        expensesCount: expenses.length,
        totalSpent: totalSpent.toFixed(2),
        categoriesCount: categoriesUsed.length,
        locationsCount: locationsVisited.length,
        transportModesCount: transportModes.length
      }
    };

    console.log('📊 Data inspection complete:', report.summary);
    return report;

  } catch (error) {
    console.error('❌ Error inspecting user data:', error);
    throw error;
  }
};

// Get detailed trip analysis
export const analyzeTripData = async (tripId) => {
  if (!tripId) {
    throw new Error('Trip ID is required');
  }

  try {
    // Get expenses for this trip
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('tripId', '==', tripId)
    );
    const expensesSnapshot = await getDocs(expensesQuery);
    const expenses = expensesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate trip statistics
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const dailySpending = {};
    const categoryBreakdown = {};
    const locationBreakdown = {};
    const transportBreakdown = {};

    expenses.forEach(expense => {
      const date = expense.date;
      const category = expense.category;
      const location = expense.location?.name || 'Unknown';
      const transport = expense.transportMode || 'unknown';

      // Daily spending
      dailySpending[date] = (dailySpending[date] || 0) + expense.amount;

      // Category breakdown
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + expense.amount;

      // Location breakdown
      locationBreakdown[location] = (locationBreakdown[location] || 0) + expense.amount;

      // Transport breakdown
      transportBreakdown[transport] = (transportBreakdown[transport] || 0) + expense.amount;
    });

    return {
      tripId,
      expenseCount: expenses.length,
      totalSpent,
      averagePerDay: totalSpent / Object.keys(dailySpending).length,
      dailySpending,
      categoryBreakdown,
      locationBreakdown,
      transportBreakdown,
      expenses
    };

  } catch (error) {
    console.error('❌ Error analyzing trip data:', error);
    throw error;
  }
};

// Export summary for debugging
export const exportUserDataSummary = (userDataReport) => {
  const summary = {
    timestamp: new Date().toISOString(),
    user: userDataReport.user,
    summary: userDataReport.summary,
    trips: userDataReport.trips.data.map(trip => ({
      id: trip.id,
      name: trip.name,
      destination: trip.destination,
      budget: trip.totalBudget,
      status: trip.status
    })),
    recentExpenses: userDataReport.expenses.data.slice(0, 10).map(expense => ({
      id: expense.id,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      location: expense.location?.name
    }))
  };

  console.log('📋 User Data Summary:', JSON.stringify(summary, null, 2));
  return summary;
};