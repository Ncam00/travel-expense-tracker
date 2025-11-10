import React, { useState, useEffect } from 'react';

export default function ExpenseTrackingPage() {
  const [trips, setTrips] = useState([]);

  // Sample travel data to demonstrate expense tracking functionality
  useEffect(() => {
    // Create sample trips with destinations
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
          { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, totalSpent: 1500, transportMode: 'plane' },
          { name: "Hanoi", country: "Vietnam", lat: 21.0285, lng: 105.8542, totalSpent: 800, transportMode: 'plane' }
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

    setTrips(sampleTrips);
  }, []);

  const totalLocations = trips.reduce((sum, trip) => sum + trip.destinations.length, 0);
  const totalSpent = trips.reduce((sum, trip) => 
    sum + trip.destinations.reduce((tripSum, dest) => tripSum + dest.totalSpent, 0), 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">
            Travel Expense Tracking
          </h1>
          <p className="text-gray-300 mb-6">
            Monitor and analyze your travel spending across all destinations
          </p>
          
          {/* Stats */}
          <div className="flex gap-6 mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{trips.length}</div>
              <div className="text-sm text-gray-300">Total Trips</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{totalLocations}</div>
              <div className="text-sm text-gray-300">Locations Visited</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                ${totalSpent.toLocaleString()}
              </div>
              <div className="text-sm text-gray-300">Total Spent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Tracking Content */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-6 pb-12">
          {/* Expense Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {trips.map(trip => (
              <div key={trip.id} className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-3">{trip.name}</h3>
                <div className="space-y-3">
                  {trip.destinations.map((dest, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-medium">{dest.name}</div>
                        <div className="text-gray-300 text-sm">{dest.country}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">${dest.totalSpent?.toLocaleString()}</div>
                        <div className="text-gray-400 text-xs">{dest.transportMode}</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-white/20">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Trip Total:</span>
                      <span className="text-white font-bold">
                        ${trip.destinations.reduce((sum, dest) => sum + dest.totalSpent, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-4">📊 Track Your Travel Expenses</h3>
              <p className="text-gray-300 mb-6">
                Start logging your travel expenses to see detailed analytics and spending patterns
              </p>
              <button 
                onClick={() => window.location.href = '/testing'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all mr-4"
              >
                Start Expense Tracking
              </button>
              <button 
                onClick={() => window.location.href = '/travel-globe'}
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transition-all"
              >
                View Travel Globe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}