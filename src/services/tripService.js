import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc,
  orderBy 
} from 'firebase/firestore';

export const tripService = {
  // Create a new trip
  async addTrip(tripData) {
    try {
      const docRef = await addDoc(collection(db, 'trips'), {
        ...tripData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding trip:', error);
      throw error;
    }
  },

  // Get all trips for a user
  async getTrips(userId) {
    try {
      const q = query(
        collection(db, 'trips'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
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

  // Get trip details by ID
  async getTripById(tripId) {
    try {
      const tripRef = doc(db, 'trips', tripId);
      const tripDoc = await getDoc(tripRef);
      if (!tripDoc.exists()) {
        throw new Error('Trip not found');
      }
      return { id: tripDoc.id, ...tripDoc.data() };
    } catch (error) {
      console.error('Error fetching trip:', error);
      throw error;
    }
  },

  // Update trip details
  async updateTrip(tripId, updatedData) {
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        ...updatedData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  },

  // Delete a trip
  async deleteTrip(tripId) {
    try {
      await deleteDoc(doc(db, 'trips', tripId));
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  }
};