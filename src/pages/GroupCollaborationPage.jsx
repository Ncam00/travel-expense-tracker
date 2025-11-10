import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

export default function GroupCollaborationPage() {
  const { user } = useAuth();
  const { tripId } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">👥 Group Collaboration</h1>
          <p className="text-gray-600">Plan together! Share activities, accommodation, shopping, and transportation ideas with estimated costs.</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Trip ID:</span> {tripId || 'No trip ID'}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">User:</span> {user?.email || 'Not logged in'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Group Planning Features</h2>
          <p className="text-gray-600 mb-6">
            This is where users will be able to collaboratively plan their trip activities, accommodation, shopping, and transportation with estimated costs.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🎯</span>
                <h3 className="font-semibold text-blue-900">Activities</h3>
              </div>
              <p className="text-blue-700 text-sm mb-3">Suggest and vote on activities with estimated costs</p>
              <ul className="text-blue-600 text-sm space-y-1">
                <li>• Add activity suggestions</li>
                <li>• Vote on group preferences</li>
                <li>• Track estimated costs</li>
                <li>• Set priority levels</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🏨</span>
                <h3 className="font-semibold text-purple-900">Accommodation</h3>
              </div>
              <p className="text-purple-700 text-sm mb-3">Share hotel and lodging options</p>
              <ul className="text-purple-600 text-sm space-y-1">
                <li>• Compare accommodation options</li>
                <li>• Check-in/out dates</li>
                <li>• Cost per night tracking</li>
                <li>• Group voting system</li>
              </ul>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🛍️</span>
                <h3 className="font-semibold text-green-900">Shopping</h3>
              </div>
              <p className="text-green-700 text-sm mb-3">Create collaborative shopping lists</p>
              <ul className="text-green-600 text-sm space-y-1">
                <li>• Shared shopping items</li>
                <li>• Location suggestions</li>
                <li>• Budget estimates</li>
                <li>• Priority voting</li>
              </ul>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🚗</span>
                <h3 className="font-semibold text-orange-900">Transportation</h3>
              </div>
              <p className="text-orange-700 text-sm mb-3">Plan routes and transportation options</p>
              <ul className="text-orange-600 text-sm space-y-1">
                <li>• Route planning</li>
                <li>• Multiple transport modes</li>
                <li>• Cost per person</li>
                <li>• Schedule coordination</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">🚀 Coming Soon: Full Collaboration Features</h3>
            <p className="text-gray-600 text-sm mb-4">
              The full interactive collaboration system is being built with real-time voting, cost tracking, and member management.
            </p>
            <div className="flex gap-4 text-sm">
              <div className="text-green-600">✅ Route Structure Complete</div>
              <div className="text-yellow-600">🔄 Database Integration In Progress</div>
              <div className="text-blue-600">📱 UI Components Ready</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}