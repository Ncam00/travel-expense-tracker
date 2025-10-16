import React, { useState, useEffect } from 'react';
import Globe3D, { convertTripDataFor3D } from '../components/Globe3D';
import { tripService } from '../services/tripService';
import { useAuth } from '../context/AuthContext';

export default function Globe3DPage() {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globeData, setGlobeData] = useState({ locations: [], routes: [] });
  const [timelineMode, setTimelineMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function loadTrips() {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userTrips = await tripService.getTrips(currentUser.uid);
        setTrips(userTrips);
        
        // Convert trip data for 3D visualization
        const { locations, routes } = convertTripDataFor3D(userTrips);
        setGlobeData({ locations, routes });
      } catch (error) {
        console.error('Error loading trips for 3D globe:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, [currentUser]);

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

  const selectedTripData = trips.find(trip => trip.id === selectedTrip);

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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your 3D travel globe</h2>
          <p className="text-gray-300">Sign in to see your amazing travel history visualized in 3D!</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your travel universe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">
            🌍 Your Travel Universe
          </h1>
          <p className="text-gray-300 mb-6">
            Explore your adventures on an interactive 3D globe
          </p>
          
          {/* Stats */}
          <div className="flex gap-6 mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{trips.length}</div>
              <div className="text-sm text-gray-300">Total Trips</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{globeData.locations.length}</div>
              <div className="text-sm text-gray-300">Locations Visited</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                ${globeData.locations.reduce((sum, loc) => sum + (loc.totalSpent || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-300">Total Spent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Globe Container */}
      <div className="relative h-[80vh]">
        {globeData.locations.length > 0 ? (
          <Globe3D
            locations={globeData.locations}
            routes={globeData.routes}
            selectedTrip={selectedTrip}
            onLocationClick={handleLocationClick}
            timelineMode={timelineMode}
            currentTime={currentTime}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center bg-white/10 backdrop-blur-lg rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">🚀 Ready for Launch!</h3>
              <p className="text-gray-300 mb-4">
                Create your first trip with location data to see it on the 3D globe
              </p>
              <button 
                onClick={() => window.location.href = '/trip-planner'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Create Your First Trip
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Controls */}
      {globeData.locations.length > 0 && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white z-20">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTimeline}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                timelineMode 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {timelineMode ? '⏱️ Timeline ON' : '🌍 Show All'}
            </button>
            
            {timelineMode && (
              <>
                <button
                  onClick={playTimeline}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-all"
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
                
                <button
                  onClick={resetTimeline}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all"
                >
                  🔄 Reset
                </button>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Timeline:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentTime}
                    onChange={(e) => setCurrentTime(parseInt(e.target.value))}
                    className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm">{currentTime}%</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Trip Details Panel */}
      {selectedTripData && (
        <div className="fixed bottom-6 left-6 right-6 bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white z-20">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold mb-2">{selectedTripData.name}</h3>
              <p className="text-gray-300 mb-2">
                {new Date(selectedTripData.startDate.seconds * 1000).toLocaleDateString()} - 
                {new Date(selectedTripData.endDate.seconds * 1000).toLocaleDateString()}
              </p>
              <p className="text-gray-300">
                Budget: ${selectedTripData.totalBudget?.toLocaleString() || 'Not set'}
              </p>
            </div>
            <button
              onClick={() => setSelectedTrip(null)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Controls Legend */}
      <div className="fixed top-20 right-6 bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white text-sm z-20">
        <h4 className="font-semibold mb-2">🌍 Globe Controls</h4>
        <div className="space-y-1">
          <div>🖱️ <span className="text-gray-300">Click & drag to rotate</span></div>
          <div>🔍 <span className="text-gray-300">Scroll to zoom</span></div>
          <div>📍 <span className="text-gray-300">Hover pins for details</span></div>
          <div>✨ <span className="text-gray-300">Click pins to select trip</span></div>
          <div>⏱️ <span className="text-gray-300">Timeline mode replays journeys</span></div>
        </div>
        
        <h4 className="font-semibold mb-2 mt-4">🚗 Transport Modes</h4>
        <div className="space-y-1">
          <div><span className="text-blue-400">●</span> <span className="text-gray-300">Plane</span></div>
          <div><span className="text-red-400">●</span> <span className="text-gray-300">Train</span></div>
          <div><span className="text-yellow-400">●</span> <span className="text-gray-300">Car</span></div>
          <div><span className="text-green-400">●</span> <span className="text-gray-300">Boat</span></div>
          <div><span className="text-purple-400">●</span> <span className="text-gray-300">Bus</span></div>
        </div>
        
        <h4 className="font-semibold mb-2 mt-4">💰 Spending Levels</h4>
        <div className="space-y-1">
          <div><span className="text-red-400">●</span> <span className="text-gray-300">High ($5000+)</span></div>
          <div><span className="text-orange-400">●</span> <span className="text-gray-300">Medium ($2000+)</span></div>
          <div><span className="text-green-400">●</span> <span className="text-gray-300">Low ($500+)</span></div>
          <div><span className="text-teal-400">●</span> <span className="text-gray-300">Minimal</span></div>
        </div>
      </div>
    </div>
  );
}