import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

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

export const getUserExpenses = async (userId) => {
  try {
    const q = query(collection(db, 'expenses'), where('userId', '==', userId));
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