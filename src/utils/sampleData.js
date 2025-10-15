// Sample data generator for testing and development
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';

// Sample trip data
export const sampleTrips = [
  {
    name: "European Adventure",
    destination: "Paris, France",
    startDate: "2024-10-01",
    endDate: "2024-10-15",
    totalBudget: 3500,
    currency: "EUR",
    description: "Two-week adventure through Europe",
  },
  {
    name: "Tokyo Business Trip",
    destination: "Tokyo, Japan", 
    startDate: "2024-11-05",
    endDate: "2024-11-12",
    totalBudget: 2800,
    currency: "JPY",
    description: "Business conference and client meetings",
  },
  {
    name: "Bali Retreat",
    destination: "Bali, Indonesia",
    startDate: "2024-12-20",
    endDate: "2025-01-02",
    totalBudget: 2200,
    currency: "USD",
    description: "Relaxing beach vacation and cultural exploration",
  },
  {
    name: "New York Weekend",
    destination: "New York, USA",
    startDate: "2024-09-15",
    endDate: "2024-09-18",
    totalBudget: 1200,
    currency: "USD",
    description: "Quick weekend getaway to the Big Apple",
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
export const generateSampleData = async (userId) => {
  try {
    console.log('🎭 Generating sample data for user:', userId);
    
    // Create sample trips
    const tripIds = [];
    for (const tripData of sampleTrips) {
      const tripDoc = await addDoc(collection(db, 'trips'), {
        ...tripData,
        createdBy: userId,
        members: [userId],
        createdAt: new Date()
      });
      tripIds.push(tripDoc.id);
      console.log('✅ Created trip:', tripData.name);
    }
    
    // Create sample expenses for each trip
    let expenseIndex = 0;
    for (let i = 0; i < tripIds.length; i++) {
      const tripId = tripIds[i];
      // Each trip gets 2-3 expenses
      const expensesForTrip = sampleExpenses.slice(expenseIndex, expenseIndex + 2 + i);
      
      for (const expenseData of expensesForTrip) {
        await addDoc(collection(db, 'expenses'), {
          ...expenseData,
          tripId: tripId,
          paidBy: userId,
          splitBetween: [userId],
          createdAt: new Date()
        });
      }
      expenseIndex += expensesForTrip.length;
    }
    
    console.log('🎉 Sample data generation complete!');
    return { 
      tripsCreated: tripIds.length, 
      expensesCreated: sampleExpenses.length 
    };
    
  } catch (error) {
    console.error('❌ Error generating sample data:', error);
    throw error;
  }
};

// Clear all user data (for testing)
export const clearUserData = async (userId) => {
  // Note: This would need additional Firebase rules and functions
  // For now, this is a placeholder
  console.log('🧹 Would clear data for user:', userId);
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