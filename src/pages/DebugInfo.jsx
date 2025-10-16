/**
 * Debug Information Component
 * Shows current app state and provides quick access links
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DebugInfo = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔍 Travel App Debug Center
          </h1>
          <p className="text-lg text-gray-600">
            Check your app status and quick access to all features
          </p>
        </div>

        <div className="grid gap-6">
          {/* Authentication Status */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              🔐 Authentication Status
            </h2>
            
            {loading ? (
              <div className="flex items-center gap-3 text-yellow-600 text-lg">
                <div className="animate-spin w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                Loading authentication...
              </div>
            ) : user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-green-600 text-xl">
                  ✅ <span className="font-medium">Successfully Logged In!</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="text-sm text-gray-700 space-y-2">
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>User ID:</strong> {user.uid}</div>
                    {user.displayName && <div><strong>Display Name:</strong> {user.displayName}</div>}
                  </div>
                </div>
                <div className="text-green-700 bg-green-100 p-4 rounded-xl">
                  🎉 <strong>Great!</strong> You have access to all testing features!
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-red-600 text-xl">
                  ❌ <span className="font-medium">Not Logged In</span>
                </div>
                <div className="text-red-700 bg-red-100 p-4 rounded-xl">
                  ⚠️ <strong>Please log in first</strong> to access protected features like testing panels.
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              🚀 Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    🔑 Login Now
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    📝 Sign Up
                  </Link>
                  <Link
                    to="/"
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    🏠 Home Page
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/testing"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    🧪 Testing Panel
                  </Link>
                  <Link
                    to="/test-trip-creation"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    🎒 Trip Creation Test
                  </Link>
                  <Link
                    to="/expenses"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    💰 Expense Tracker
                  </Link>
                  <Link
                    to="/dashboard"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    🏠 Dashboard
                  </Link>
                  <Link
                    to="/trips"
                    className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    🗺️ My Trips
                  </Link>
                  <Link
                    to="/analytics"
                    className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    📈 Analytics
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* App Status */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              ✨ App Features Status
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-green-700">✅ Completed & Ready:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> User Authentication System
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Trip Creation & Management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Expense Tracking with Locations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Trip Sharing & Invitations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Expense Splitting Algorithms
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Real-time Collaboration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Activity Feeds & Notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Beautiful Glass Morphism UI
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-blue-700">🧪 Testing Features:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🔬</span> Comprehensive Testing Panel
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🔬</span> Trip Creation Test Runner
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🔬</span> Manual Testing Interface
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🔬</span> Real-time Feature Validation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🔬</span> Sample Data Generation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🔬</span> Firebase Integration Tests
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🔬</span> Collaboration Feature Tests
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🔬</span> UI/UX Testing Tools
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Current Session Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              🌐 Session Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div className="space-y-2">
                <div><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
                <div><strong>Server Port:</strong> 3004</div>
                <div><strong>Environment:</strong> Development</div>
                <div><strong>Hot Reload:</strong> ✅ Active</div>
              </div>
              <div className="space-y-2">
                <div><strong>Build Tool:</strong> Vite</div>
                <div><strong>Framework:</strong> React</div>
                <div><strong>Styling:</strong> Tailwind CSS</div>
                <div><strong>Backend:</strong> Firebase</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;