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
  deleteDoc 
} from 'firebase/firestore';

// Create a new trip
export const createTrip = async (userId, tripData) => {
  try {
    const tripRef = await addDoc(collection(db, 'trips'), {
      ...tripData,
      userId,
      createdAt: new Date().toISOString(),
      expenses: [],
      totalSpent: 0
    });
    return tripRef.id;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};

// Get all trips for a user
export const getUserTrips = async (userId) => {
  try {
    const q = query(collection(db, 'trips'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
};

// Get trip details by ID
export const getTripById = async (tripId) => {
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
};

// Update trip details
export const updateTrip = async (tripId, updateData) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    await updateDoc(tripRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

// Delete a trip
export const deleteTrip = async (tripId) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    await deleteDoc(tripRef);
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

// Get trip statistics
export const getTripStats = async (userId) => {
  try {
    const trips = await getUserTrips(userId);
    return {
      totalTrips: trips.length,
      totalSpent: trips.reduce((total, trip) => total + (trip.totalSpent || 0), 0),
      activeTrips: trips.filter(trip => !trip.isCompleted).length
    };
  } catch (error) {
    console.error('Error getting trip stats:', error);
    throw error;
  }
};