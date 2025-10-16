import React from 'react';

export default function Globe3DPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">
            🌍 Globe 3D Visualization
          </h1>
          <p className="text-gray-300 mb-6">
            Interactive 3D globe with travel routes and destinations
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-4">🚀 Coming Soon</h3>
              <p className="text-gray-300 mb-6">
                The 3D globe visualization is under development
              </p>
              <button 
                onClick={() => window.location.href = '/travel-globe'}
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transition-all mr-4"
              >
                View Travel Globe
              </button>
              <button 
                onClick={() => window.location.href = '/expense-tracking'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Track Expenses
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}