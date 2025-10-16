/**
 * Trip Creation Test Page
 * Manual testing interface for trip creation workflow
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { tripSharingService } from '../services/tripSharingService';
import { notificationService } from '../services/notificationService';
import LocationPicker from '../components/LocationPicker';
import TripSharingModal from '../components/TripSharingModal';

const TripCreationTestPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [createdTrip, setCreatedTrip] = useState(null);
  const [showSharingModal, setShowSharingModal] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    currency: 'USD',
    description: ''
  });

  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    // Initialize notification service
    notificationService.initialize();
  }, []);

  const addTestResult = (message, type = 'info') => {
    const result = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
    
    // Show toast notification
    notificationService.showToast(message, type, 3000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    const { name, destination, startDate, endDate, totalBudget } = formData;
    
    if (!name.trim()) {
      addTestResult('❌ Trip name is required', 'error');
      return false;
    }
    
    if (!destination.trim()) {
      addTestResult('❌ Destination is required', 'error');
      return false;
    }
    
    if (!startDate || !endDate) {
      addTestResult('❌ Start and end dates are required', 'error');
      return false;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
      addTestResult('❌ End date must be after start date', 'error');
      return false;
    }
    
    if (!totalBudget || parseFloat(totalBudget) <= 0) {
      addTestResult('❌ Valid budget amount is required', 'error');
      return false;
    }
    
    addTestResult('✅ Step 1 validation passed', 'success');
    return true;
  };

  const handleStep1Submit = () => {
    if (validateStep1()) {
      setStep(2);
      addTestResult('🎯 Moving to location selection', 'info');
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    addTestResult(`📍 Location selected: ${location.name}`, 'success');
  };

  const handleStep2Submit = () => {
    if (selectedLocation) {
      addTestResult('✅ Location validation passed', 'success');
      setStep(3);
    } else {
      addTestResult('⚠️ Location is optional - proceeding anyway', 'warning');
      setStep(3);
    }
  };

  const createTrip = async () => {
    setLoading(true);
    addTestResult('🚀 Creating trip...', 'info');
    
    try {
      const tripData = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        totalBudget: parseFloat(formData.totalBudget),
        location: selectedLocation
      };

      const newTrip = await tripService.createTrip(user.uid, tripData);
      setCreatedTrip(newTrip);
      
      addTestResult(`✅ Trip "${newTrip.name}" created successfully!`, 'success');
      addTestResult(`🆔 Trip ID: ${newTrip.id}`, 'info');
      
      // Generate share code
      const shareCode = await tripSharingService.generateShareCode(newTrip.id);
      addTestResult(`🔗 Share code generated: ${shareCode}`, 'success');
      
      setStep(4);
      
    } catch (error) {
      addTestResult(`❌ Trip creation failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testSharingFeatures = () => {
    if (createdTrip) {
      setShowSharingModal(true);
      addTestResult('🔗 Testing sharing features...', 'info');
    }
  };

  const resetTest = () => {
    setStep(1);
    setFormData({
      name: '',
      destination: '',
      startDate: '',
      endDate: '',
      totalBudget: '',
      currency: 'USD',
      description: ''
    });
    setSelectedLocation(null);
    setCreatedTrip(null);
    setTestResults([]);
    addTestResult('🔄 Test reset - ready for new trip creation', 'info');
  };

  const getStepIcon = (stepNumber) => {
    if (step > stepNumber) return '✅';
    if (step === stepNumber) return '🎯';
    return '⭕';
  };

  const getResultIcon = (type) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  };

  const getResultColor = (type) => {
    const colors = {
      success: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600'
    };
    return colors[type] || colors.info;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Trip Creation Testing Lab
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive testing interface for trip creation workflow with real-time validation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Form Steps */}
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Testing Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStepIcon(1)}</span>
                  <span className={step >= 1 ? 'font-medium' : 'text-gray-500'}>
                    Trip Details
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStepIcon(2)}</span>
                  <span className={step >= 2 ? 'font-medium' : 'text-gray-500'}>
                    Location Selection
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStepIcon(3)}</span>
                  <span className={step >= 3 ? 'font-medium' : 'text-gray-500'}>
                    Review & Create
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStepIcon(4)}</span>
                  <span className={step >= 4 ? 'font-medium' : 'text-gray-500'}>
                    Sharing & Testing
                  </span>
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    🎯 Step 1: Trip Details
                  </h2>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trip Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Europe Adventure 2025"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination *
                      </label>
                      <input
                        type="text"
                        value={formData.destination}
                        onChange={(e) => handleInputChange('destination', e.target.value)}
                        placeholder="e.g., Paris, France"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date *
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget *
                        </label>
                        <input
                          type="number"
                          value={formData.totalBudget}
                          onChange={(e) => handleInputChange('totalBudget', e.target.value)}
                          placeholder="2500"
                          min="1"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          value={formData.currency}
                          onChange={(e) => handleInputChange('currency', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="JPY">JPY (¥)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Tell us about your trip plans..."
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleStep1Submit}
                    className="w-full btn-primary"
                  >
                    Continue to Location Selection →
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    📍 Step 2: Location Selection
                  </h2>

                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Select a specific location for your trip (optional but recommended for better mapping):
                    </p>

                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      placeholder="Search for trip location..."
                      className="w-full"
                    />

                    {selectedLocation && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <h4 className="font-medium text-green-800 mb-2">Selected Location:</h4>
                        <p className="text-green-700">{selectedLocation.name}</p>
                        <p className="text-sm text-green-600">
                          Coordinates: {selectedLocation.coordinates.lat.toFixed(4)}, {selectedLocation.coordinates.lng.toFixed(4)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 btn-secondary"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleStep2Submit}
                      className="flex-1 btn-primary"
                    >
                      Continue to Review →
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    📋 Step 3: Review & Create
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-medium text-gray-800 mb-3">Trip Summary:</h4>
                      <div className="grid gap-2 text-sm">
                        <div><span className="font-medium">Name:</span> {formData.name}</div>
                        <div><span className="font-medium">Destination:</span> {formData.destination}</div>
                        <div><span className="font-medium">Dates:</span> {formData.startDate} to {formData.endDate}</div>
                        <div><span className="font-medium">Budget:</span> {formData.currency} {formData.totalBudget}</div>
                        {selectedLocation && (
                          <div><span className="font-medium">Location:</span> {selectedLocation.name}</div>
                        )}
                        {formData.description && (
                          <div><span className="font-medium">Description:</span> {formData.description}</div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <h4 className="font-medium text-blue-800 mb-2">What happens when you create this trip:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>✅ Trip will be saved to your account</li>
                        <li>✅ Share code will be automatically generated</li>
                        <li>✅ You'll be set as the trip owner</li>
                        <li>✅ Real-time collaboration features will be enabled</li>
                        <li>✅ Location integration will be activated</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 btn-secondary"
                      disabled={loading}
                    >
                      ← Back
                    </button>
                    <button
                      onClick={createTrip}
                      className="flex-1 btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Creating Trip...' : '🚀 Create Trip'}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && createdTrip && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-green-700 mb-6">
                    🎉 Trip Created Successfully!
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <h4 className="font-medium text-green-800 mb-3">Trip Details:</h4>
                      <div className="grid gap-2 text-sm text-green-700">
                        <div><span className="font-medium">ID:</span> {createdTrip.id}</div>
                        <div><span className="font-medium">Name:</span> {createdTrip.name}</div>
                        <div><span className="font-medium">Share Code:</span> {createdTrip.shareCode || 'Generated'}</div>
                        <div><span className="font-medium">Created:</span> {new Date(createdTrip.createdAt).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <button
                        onClick={testSharingFeatures}
                        className="btn-primary"
                      >
                        🔗 Test Sharing Features
                      </button>
                      <button
                        onClick={() => window.location.href = `/trips/${createdTrip.id}`}
                        className="btn-secondary"
                      >
                        📊 View Trip Dashboard
                      </button>
                      <button
                        onClick={resetTest}
                        className="btn-outline"
                      >
                        🔄 Create Another Trip
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column: Test Results */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📊 Test Results
              <span className="text-sm text-gray-500">({testResults.length})</span>
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🧪</div>
                  <p className="text-gray-500">Test results will appear here</p>
                </div>
              ) : (
                testResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="text-lg flex-shrink-0">
                      {getResultIcon(result.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${getResultColor(result.type)}`}>
                        {result.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {result.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {testResults.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setTestResults([])}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear Results
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trip Sharing Modal */}
        {showSharingModal && createdTrip && (
          <TripSharingModal
            tripId={createdTrip.id}
            onClose={() => setShowSharingModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TripCreationTestPage;