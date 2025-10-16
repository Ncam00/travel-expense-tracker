import React, { useState, useEffect } from 'react';
import Globe3D from '../components/Globe3D';

export default function SimpleGlobePage() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [globeData, setGlobeData] = useState({ locations: [], routes: [] });
  const [timelineMode, setTimelineMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sample travel data for globe demonstration
  useEffect(() => {
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

    setTrips(sampleTrips);
    setGlobeData({ locations, routes });
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">
            Your Travel Globe
          </h1>
          <p className="text-gray-300 mb-6">
            Explore your adventures on an interactive 3D globe
          </p>
        </div>
      </div>

      {/* Globe Container */}
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
      <div className="fixed top-20 right-6 bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white text-sm z-20">
        <h4 className="font-semibold mb-2">🌍 Globe Controls</h4>
        <div className="space-y-1">
          <div>🖱️ <span className="text-gray-300">Drag to rotate</span></div>
          <div>🔍 <span className="text-gray-300">Scroll to zoom</span></div>
          <div>📍 <span className="text-gray-300">Hover pins for details</span></div>
          <div>✨ <span className="text-gray-300">Click pins to select trip</span></div>
          <div>⏱️ <span className="text-gray-300">Timeline mode replays journeys</span></div>
        </div>
      </div>
    </div>
  );
}