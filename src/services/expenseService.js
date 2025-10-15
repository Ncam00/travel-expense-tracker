import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

export const expenseService = {
  async addExpense(expenseData) {
    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  async getExpenses(userId) {
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
      console.error('Error getting expenses:', error);
      throw error;
    }
  },

  async updateExpense(expenseId, updatedData) {
    try {
      const expenseRef = doc(db, 'expenses', expenseId);
      await updateDoc(expenseRef, {
        ...updatedData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  async deleteExpense(expenseId) {
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }
};