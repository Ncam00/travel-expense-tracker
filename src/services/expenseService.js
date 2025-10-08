import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  doc,
  orderBy,
  limit 
} from 'firebase/firestore';

// Add a new expense
export const addExpense = async (userId, expenseData) => {
  try {
    const expenseRef = await addDoc(collection(db, 'expenses'), {
      ...expenseData,
      userId,
      createdAt: new Date().toISOString()
    });
    return expenseRef.id;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

// Get all expenses for a user
export const getUserExpenses = async (userId) => {
  try {
    const q = query(
      collection(db, 'expenses'), 
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

// Get recent expenses
export const getRecentExpenses = async (userId, limitCount = 5) => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching recent expenses:', error);
    throw error;
  }
};

// Delete an expense
export const deleteExpense = async (expenseId) => {
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Update an expense
export const updateExpense = async (expenseId, updateData) => {
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    await updateDoc(expenseRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

// Get expenses by category
export const getExpensesByCategory = async (userId, category) => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('category', '==', category)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching expenses by category:', error);
    throw error;
  }
};