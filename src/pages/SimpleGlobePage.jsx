import React, { useState, useEffect } from 'react';
import Globe3D from '../components/Globe3D';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { expenseService } from '../services/expenseService';

export default function SimpleGlobePage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [globeData, setGlobeData] = useState({ locations: [], routes: [] });
  const [timelineMode, setTimelineMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load real travel data from Firebase
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadTravelData();
  }, [user]);

  const loadTravelData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch trips and expenses in parallel
      const [userTrips, userExpenses] = await Promise.all([
        tripService.getTrips(user.uid),
        expenseService.getExpenses(user.uid)
      ]);

      // Group expenses by trip and location
      const tripExpensesMap = {};
      userExpenses.forEach(expense => {
        if (!expense.location || !expense.location.coordinates) {
          return; // Skip expenses without location data
        }

        const tripId = expense.tripId;
        if (!tripExpensesMap[tripId]) {
          tripExpensesMap[tripId] = [];
        }
        tripExpensesMap[tripId].push(expense);
      });

      // Process trips and create globe data
      const locations = [];
      const routes = [];
      const processedTrips = [];

      userTrips.forEach(trip => {
        const tripExpenses = tripExpensesMap[trip.id] || [];
        if (tripExpenses.length === 0) {
          return; // Skip trips without located expenses
        }

        // Sort expenses by date
        tripExpenses.sort((a, b) => {
          const dateA = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime();
          const dateB = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime();
          return dateA - dateB;
        });

        // Aggregate spending by location
        const locationSpendingMap = {};
        tripExpenses.forEach(expense => {
          const coords = expense.location.coordinates;
          const key = `${coords.lat},${coords.lng}`;
          
          if (!locationSpendingMap[key]) {
            locationSpendingMap[key] = {
              lat: coords.lat,
              lng: coords.lng,
              name: expense.location.name || 'Unknown Location',
              totalSpent: 0,
              tripId: trip.id,
              tripName: trip.name,
              transportMode: expense.transportMode || 'plane',
              date: expense.date,
              expenses: []
            };
          }
          
          locationSpendingMap[key].totalSpent += Number(expense.amount || 0);
          locationSpendingMap[key].expenses.push(expense);
        });

        // Convert to array and add to locations
        const tripLocations = Object.values(locationSpendingMap);
        tripLocations.forEach((location, index) => {
          locations.push(location);
          
          // Create routes between consecutive locations
          if (index > 0) {
            routes.push({
              from: tripLocations[index - 1],
              to: location,
              tripId: trip.id,
              tripName: trip.name,
              transportMode: location.transportMode || 'plane'
            });
          }
        });

        processedTrips.push({
          ...trip,
          destinations: tripLocations
        });
      });

      console.log(`Loaded ${userTrips.length} trips, ${userExpenses.length} expenses, ${locations.length} locations`);
      
      setTrips(processedTrips);
      setGlobeData({ locations, routes });
    } catch (err) {
      console.error('Error loading travel data:', err);
      setError(err.message || 'Failed to load travel data');
    } finally {
      setLoading(false);
    }
  };

  // Fallback to sample data if no user logged in or no data
  useEffect(() => {
    if (!user || (trips.length === 0 && !loading && !error)) {
      const sampleTrips = [
      {
        id: 'trip-1',
        name: "European Adventure",
        destinations: [
          { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, totalSpent: 2500, transportMode: 'plane' },
          { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041, totalSpent: 1800, transportMode: 'train' },
          { name: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050, totalSpent: 1200, transportMode: 'train' }
        ]
      },
      {
        id: 'trip-2', 
        name: "Asia Adventure",
        destinations: [
          { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, totalSpent: 3200, transportMode: 'plane' },
          { name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780, totalSpent: 2100, transportMode: 'plane' },
          { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, totalSpent: 1500, transportMode: 'plane' }
        ]
      },
      {
        id: 'trip-3',
        name: "North America Tour", 
        destinations: [
          { name: "New York", country: "USA", lat: 40.7128, lng: -74.0060, totalSpent: 2800, transportMode: 'plane' },
          { name: "San Francisco", country: "USA", lat: 37.7749, lng: -122.4194, totalSpent: 3100, transportMode: 'plane' },
          { name: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207, totalSpent: 1900, transportMode: 'train' }
        ]
      }
    ];

    // Convert trip data to globe format
    const locations = [];
    const routes = [];
    
    sampleTrips.forEach(trip => {
      trip.destinations.forEach((dest, index) => {
        locations.push({
          ...dest,
          tripId: trip.id,
          tripName: trip.name
        });
        
        // Create routes between consecutive destinations
        if (index > 0) {
          routes.push({
            from: trip.destinations[index - 1],
            to: dest,
            tripId: trip.id,
            transportMode: dest.transportMode
          });
        }
      });
    });

      // Only use sample data if we have no real data
      if (!loading && trips.length === 0 && !user) {
        setTrips(sampleTrips);
        setGlobeData({ locations, routes });
      }
    }
  }, [user, trips.length, loading]);

  // Timeline animation
  useEffect(() => {
    if (isPlaying && timelineMode) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, timelineMode]);

  const handleLocationClick = (location) => {
    setSelectedTrip(location.tripId);
  };

  const toggleTimeline = () => {
    setTimelineMode(!timelineMode);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const playTimeline = () => {
    setIsPlaying(!isPlaying);
  };

  const resetTimeline = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🌍</span>
          <h2 className="text-3xl font-bold text-white mb-4">Travel Globe</h2>
          <p className="text-gray-300 mb-6">Sign in to see your travel history visualized in 3D</p>
          <a href="/login" className="btn-primary">Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative z-10 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Your Travel Globe 🌍
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                {loading ? 'Loading your adventures...' : 
                 error ? 'Error loading data' :
                 globeData.locations.length > 0 ? `${globeData.locations.length} locations across ${trips.length} trips` :
                 'No travel data yet - start tracking your first trip!'}
              </p>
            </div>
            
            {!loading && !error && globeData.locations.length === 0 && (
              <a href="/trips" className="btn-secondary text-sm">
                Create Your First Trip
              </a>
            )}
            
            {!loading && globeData.locations.length > 0 && (
              <button
                onClick={() => loadTravelData()}
                className="text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                title="Refresh data"
              >
                🔄 Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">🌍</div>
            <p className="text-white text-lg">Loading your travel data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center bg-red-500/20 border border-red-500 rounded-lg p-8 max-w-md">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Data</h3>
            <p className="text-red-200 mb-4">{error}</p>
            <button
              onClick={() => loadTravelData()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Globe Container - Only show when data is loaded */}
      {!loading && !error && (
        <>
          <div className="relative h-[80vh]">
            <Globe3D
              locations={globeData.locations}
              routes={globeData.routes}
              selectedTrip={selectedTrip}
              onLocationClick={handleLocationClick}
              timelineMode={timelineMode}
              currentTime={currentTime}
              className="w-full h-full"
            />
          </div>

          {/* Timeline Controls */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white z-20">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTimeline}
            className={`px-2 py-1 rounded text-sm font-medium transition-all ${
              timelineMode 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {timelineMode ? 'Timeline ON' : 'Show All'}
          </button>
          
          {timelineMode && (
            <>
              <button
                onClick={playTimeline}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-all"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              
              <button
                onClick={resetTimeline}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-all"
              >
                Reset
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs">Timeline:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseInt(e.target.value))}
                  className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs">{currentTime}%</span>
              </div>
            </>
          )}
        </div>
      </div>

          {/* Controls Info */}
          <div className="fixed top-20 right-6 bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white text-sm z-20 hidden lg:block">
            <h4 className="font-semibold mb-2">🌍 Globe Controls</h4>
            <div className="space-y-1">
              <div>🖱️ <span className="text-gray-300">Drag to rotate</span></div>
              <div>🔍 <span className="text-gray-300">Scroll to zoom</span></div>
              <div>📍 <span className="text-gray-300">Hover pins for details</span></div>
              <div>✨ <span className="text-gray-300">Click pins to select trip</span></div>
              <div>⏱️ <span className="text-gray-300">Timeline mode replays journeys</span></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}