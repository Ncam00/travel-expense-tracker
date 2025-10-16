// Sample data generator for testing and development
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';

// Sample trip data with more variety and realistic dates
export const sampleTrips = [
  {
    name: "European Adventure",
    destination: "Paris, France",
    startDate: "2024-10-01",
    endDate: "2024-10-15",
    totalBudget: 3500,
    currency: "EUR",
    description: "Two-week adventure through Europe visiting Paris, Amsterdam, and Berlin",
    status: "completed"
  },
  {
    name: "Tokyo Business Trip",
    destination: "Tokyo, Japan", 
    startDate: "2024-11-05",
    endDate: "2024-11-12",
    totalBudget: 2800,
    currency: "USD", // Changed to USD for easier testing
    description: "Business conference and client meetings in Shibuya district",
    status: "completed"
  },
  {
    name: "Bali Retreat",
    destination: "Bali, Indonesia",
    startDate: "2024-12-20",
    endDate: "2025-01-02",
    totalBudget: 2200,
    currency: "USD",
    description: "Relaxing beach vacation and cultural exploration in Ubud and Seminyak",
    status: "active"
  },
  {
    name: "New York Weekend",
    destination: "New York, USA",
    startDate: "2024-09-15",
    endDate: "2024-09-18",
    totalBudget: 1200,
    currency: "USD",
    description: "Quick weekend getaway to the Big Apple - Broadway shows and museums",
    status: "completed"
  },
  {
    name: "Mountain Hiking Adventure",
    destination: "Swiss Alps, Switzerland",
    startDate: "2025-02-10",
    endDate: "2025-02-20",
    totalBudget: 1800,
    currency: "CHF",
    description: "Winter hiking and skiing in the beautiful Swiss Alps",
    status: "planned"
  },
  {
    name: "Southeast Asia Backpacking",
    destination: "Bangkok, Thailand",
    startDate: "2025-03-01",
    endDate: "2025-03-21",
    totalBudget: 1500,
    currency: "USD",
    description: "Budget backpacking through Thailand, Vietnam, and Cambodia",
    status: "planned"
  }
];

// Sample expense data with locations
export const sampleExpenses = [
  // European Adventure expenses
  {
    tripId: null, // Will be set when creating
    amount: 45.50,
    currency: "EUR",
    category: "food",
    description: "Lunch at local bistro",
    location: {
      name: "Le Comptoir du Relais, Paris",
      coordinates: { lat: 48.8534, lng: 2.3388 }
    },
    transportMode: "walking",
    date: "2024-10-02",
  },
  {
    tripId: null,
    amount: 12.80,
    currency: "EUR", 
    category: "transport",
    description: "Metro day pass",
    location: {
      name: "Châtelet-Les Halles Station, Paris",
      coordinates: { lat: 48.8619, lng: 2.3469 }
    },
    transportMode: "train",
    date: "2024-10-02",
  },
  {
    tripId: null,
    amount: 120.00,
    currency: "EUR",
    category: "accommodation",
    description: "Hotel Le Marais - 1 night",
    location: {
      name: "Hotel Le Marais, Paris",
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    transportMode: "walking",
    date: "2024-10-02",
  },
  {
    tripId: null,
    amount: 25.00,
    currency: "EUR",
    category: "entertainment",
    description: "Louvre Museum ticket",
    location: {
      name: "Louvre Museum, Paris",
      coordinates: { lat: 48.8606, lng: 2.3376 }
    },
    transportMode: "walking",
    date: "2024-10-03",
  },
  
  // Tokyo Business Trip expenses
  {
    tripId: null,
    amount: 850.00,
    currency: "JPY",
    category: "food",
    description: "Sushi dinner at Jiro",
    location: {
      name: "Sukiyabashi Jiro, Tokyo",
      coordinates: { lat: 35.6681, lng: 139.7648 }
    },
    transportMode: "train",
    date: "2024-11-06",
  },
  {
    tripId: null,
    amount: 200.00,
    currency: "JPY",
    category: "transport",
    description: "Taxi to conference center",
    location: {
      name: "Tokyo International Forum",
      coordinates: { lat: 35.6769, lng: 139.7632 }
    },
    transportMode: "car",
    date: "2024-11-07",
  },
  
  // Bali Retreat expenses
  {
    tripId: null,
    amount: 35.00,
    currency: "USD",
    category: "food",
    description: "Traditional Balinese dinner",
    location: {
      name: "Warung Babi Guling Ibu Oka, Ubud",
      coordinates: { lat: -8.5069, lng: 115.2625 }
    },
    transportMode: "motorbike",
    date: "2024-12-21",
  },
  {
    tripId: null,
    amount: 80.00,
    currency: "USD",
    category: "accommodation",
    description: "Beachfront villa - 1 night",
    location: {
      name: "Seminyak Beach, Bali",
      coordinates: { lat: -8.6919, lng: 115.1721 }
    },
    transportMode: "car",
    date: "2024-12-22",
  },
  
  // New York Weekend expenses
  {
    tripId: null,
    amount: 18.50,
    currency: "USD",
    category: "food",
    description: "New York pizza slice",
    location: {
      name: "Joe's Pizza, Times Square",
      coordinates: { lat: 40.7580, lng: -73.9855 }
    },
    transportMode: "walking",
    date: "2024-09-16",
  },
  {
    tripId: null,
    amount: 32.00,
    currency: "USD",
    category: "entertainment",
    description: "Broadway show ticket",
    location: {
      name: "Majestic Theatre, NYC",
      coordinates: { lat: 40.7578, lng: -73.9857 }
    },
    transportMode: "walking",
    date: "2024-09-16",
  }
];

// Generate sample data for a user
export const generateSampleData = async (userId, progressCallback = null) => {
  if (!userId) {
    throw new Error('User ID is required to generate sample data');
  }

  try {
    const reportProgress = (message, current, total) => {
      console.log(`📊 Progress: ${message} (${current}/${total})`);
      if (progressCallback) progressCallback(message, current, total);
    };

    reportProgress('Starting sample data generation...', 0, 100);
    
    // Generate trips
    reportProgress('Creating trips...', 10, 100);
    const tripIds = [];
    
    for (let i = 0; i < sampleTrips.length; i++) {
      const trip = { 
        ...sampleTrips[i], 
        createdBy: userId,
        members: [userId],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const tripDoc = await addDoc(collection(db, 'trips'), trip);
      tripIds.push(tripDoc.id);
      reportProgress(`Created trip: ${trip.name}`, 10 + (i + 1) * 10, 100);
    }

    // Generate expenses with realistic distribution
    reportProgress('Creating expenses...', 50, 100);
    let expenseIndex = 0;
    let totalExpensesCreated = 0;
    
    for (let tripIndex = 0; tripIndex < tripIds.length; tripIndex++) {
      const tripId = tripIds[tripIndex];
      const trip = sampleTrips[tripIndex];
      
      // Only add expenses for completed or active trips
      if (trip.status === 'planned') continue;
      
      // Determine how many expenses this trip should have
      const expensesForTrip = sampleExpenses.filter((_, index) => {
        if (tripIndex === 0) return index < 15; // European Adventure - lots of expenses
        if (tripIndex === 1) return index >= 15 && index < 25; // Tokyo Business Trip
        if (tripIndex === 2) return index >= 25 && index < 35; // Bali Retreat
        if (tripIndex === 3) return index >= 35; // New York Weekend
        return false;
      });
      
      for (const expense of expensesForTrip) {
        const expenseData = { 
          ...expense, 
          tripId,
          paidBy: userId,
          splitBetween: [userId],
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await addDoc(collection(db, 'expenses'), expenseData);
        totalExpensesCreated++;
        
        reportProgress(
          `Added expense: ${expense.description}`, 
          50 + Math.round((totalExpensesCreated / sampleExpenses.length) * 40), 
          100
        );
      }
    }
    
    reportProgress('Sample data generation complete!', 100, 100);
    
    return { 
      tripsCreated: tripIds.length, 
      expensesCreated: totalExpensesCreated,
      tripIds: tripIds
    };
    
  } catch (error) {
    console.error('❌ Error generating sample data:', error);
    throw error;
  }
};

// Clear all user data (for testing)
export const clearUserData = async (userId, progressCallback = null) => {
  if (!userId) {
    throw new Error('User ID is required to clear data');
  }

  try {
    const reportProgress = (message, current, total) => {
      console.log(`🧹 Cleanup: ${message} (${current}/${total})`);
      if (progressCallback) progressCallback(message, current, total);
    };

    reportProgress('Starting data cleanup...', 0, 100);
    
    // Get all user's trips
    const { getDocs, query, where } = await import('firebase/firestore');
    
    reportProgress('Finding user trips...', 25, 100);
    const tripsQuery = query(
      collection(db, 'trips'), 
      where('createdBy', '==', userId)
    );
    const tripsSnapshot = await getDocs(tripsQuery);
    
    // Delete expenses first
    reportProgress('Deleting expenses...', 50, 100);
    const { deleteDoc, doc } = await import('firebase/firestore');
    
    for (const tripDoc of tripsSnapshot.docs) {
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('tripId', '==', tripDoc.id)
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      
      for (const expenseDoc of expensesSnapshot.docs) {
        await deleteDoc(doc(db, 'expenses', expenseDoc.id));
      }
    }
    
    // Delete trips
    reportProgress('Deleting trips...', 75, 100);
    for (const tripDoc of tripsSnapshot.docs) {
      await deleteDoc(doc(db, 'trips', tripDoc.id));
    }
    
    reportProgress('Data cleanup complete!', 100, 100);
    
    return {
      tripsDeleted: tripsSnapshot.docs.length,
      message: 'All user data cleared successfully'
    };
    
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
    throw error;
  }
};

// Validate data integrity
export const validateSampleData = () => {
  console.log('🔍 Validating sample data structure...');
  
  // Check trips
  sampleTrips.forEach((trip, index) => {
    if (!trip.name || !trip.destination || !trip.totalBudget) {
      console.error(`❌ Trip ${index} missing required fields`);
    }
  });
  
  // Check expenses
  sampleExpenses.forEach((expense, index) => {
    if (!expense.amount || !expense.category || !expense.description) {
      console.error(`❌ Expense ${index} missing required fields`);
    }
    if (!expense.location || !expense.location.coordinates) {
      console.error(`❌ Expense ${index} missing location data`);
    }
  });
  
  console.log('✅ Data validation complete');
};