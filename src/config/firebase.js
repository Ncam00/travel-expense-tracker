import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Expense Service
export const expenseService = {
  async addExpense(expenseData) {
    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  async getUserExpenses(userId) {
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

  async updateExpense(expenseId, updateData) {
    try {
      const expenseRef = doc(db, 'expenses', expenseId);
      await updateDoc(expenseRef, {
        ...updateData,
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
  },

  async getTripExpenses(tripId) {
    try {
      const q = query(
        collection(db, 'expenses'),
        where('tripId', '==', tripId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting trip expenses:', error);
      throw error;
    }
  }
};

// Trip Service
export const tripService = {
  async addTrip(tripData) {
    try {
      const docRef = await addDoc(collection(db, 'trips'), {
        ...tripData,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding trip:', error);
      throw error;
    }
  },

  async getUserTrips(userId) {
    try {
      const q = query(
        collection(db, 'trips'),
        where('userId', '==', userId),
        orderBy('startDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting trips:', error);
      throw error;
    }
  },

  async updateTrip(tripId, updateData) {
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        ...updateData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  },

  async deleteTrip(tripId) {
    try {
      await deleteDoc(doc(db, 'trips', tripId));
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  },

  async getTrip(tripId) {
    try {
      const tripRef = doc(db, 'trips', tripId);
      const tripSnap = await getDoc(tripRef);
      
      if (tripSnap.exists()) {
        return { id: tripSnap.id, ...tripSnap.data() };
      } else {
        throw new Error('Trip not found');
      }
    } catch (error) {
      console.error('Error getting trip:', error);
      throw error;
    }
  }
};

export { auth, db };