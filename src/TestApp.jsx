import React from 'react';

const TestApp = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 Travel Expense Tracker
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Application is working correctly!
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ React is rendering properly
        </div>
        <div className="mt-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          🔧 Debug mode - Firebase disabled
        </div>
      </div>
    </div>
  );
};

export default TestApp;