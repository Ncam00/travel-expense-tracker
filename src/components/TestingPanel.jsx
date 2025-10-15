import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateSampleData, validateSampleData } from '../utils/sampleData';
import { db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const TestingPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (message, type = 'info') => {
    setResults(prev => [...prev, { 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    addResult(`🧪 Starting ${testName}...`, 'info');
    try {
      await testFunction();
      addResult(`✅ ${testName} completed successfully`, 'success');
    } catch (error) {
      addResult(`❌ ${testName} failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testSampleDataGeneration = async () => {
    if (!user) throw new Error('User must be logged in');
    const result = await generateSampleData(user.uid);
    addResult(`Created ${result.tripsCreated} trips and ${result.expensesCreated} expenses`, 'success');
  };

  const testDataValidation = async () => {
    validateSampleData();
    addResult('Sample data structure is valid', 'success');
  };

  const testAuthFlow = async () => {
    if (!user) throw new Error('User is not authenticated');
    
    // Test user object structure
    const requiredFields = ['uid', 'email'];
    const missingFields = requiredFields.filter(field => !user[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing user fields: ${missingFields.join(', ')}`);
    }
    
    addResult(`✅ User authenticated: ${user.email}`, 'success');
    addResult(`✅ User ID: ${user.uid}`, 'success');
    addResult(`✅ Authentication state: Valid`, 'success');
    
    // Test localStorage persistence
    const authData = localStorage.getItem('firebase:authUser');
    if (authData) {
      addResult(`✅ Auth data persisted in localStorage`, 'success');
    } else {
      addResult(`⚠️ No auth data found in localStorage`, 'warning');
    }
  };

  const testFirebaseConnection = async () => {
    try {
      // Test Firestore connection
      const testDoc = db.collection('test').doc('connection');
      await testDoc.set({ timestamp: new Date(), test: true });
      await testDoc.delete();
      addResult('✅ Firebase Firestore connection working', 'success');
    } catch (error) {
      throw new Error(`Firebase connection failed: ${error.message}`);
    }
  };

  const testLocalStorage = async () => {
    localStorage.setItem('test-key', 'test-value');
    const value = localStorage.getItem('test-key');
    if (value !== 'test-value') throw new Error('LocalStorage not working');
    localStorage.removeItem('test-key');
    addResult('LocalStorage working correctly', 'success');
  };

  const clearResults = () => setResults([]);

  const createTestAccount = async () => {
    const testEmail = 'test@example.com';
    const testPassword = 'Password123!';
    
    try {
      // Try to create test account
      await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      addResult('✅ Test account created successfully', 'success');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        addResult('ℹ️ Test account already exists', 'info');
        // Try to sign in instead
        try {
          await signInWithEmailAndPassword(auth, testEmail, testPassword);
          addResult('✅ Signed in to existing test account', 'success');
        } catch (signInError) {
          addResult(`❌ Failed to sign in: ${signInError.message}`, 'error');
        }
      } else {
        addResult(`❌ Failed to create account: ${error.message}`, 'error');
      }
    }
  };

  if (!user) {
    return (
      <div className="card-solid p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🧪 Testing Panel</h2>
          <p className="text-gray-600">Please log in to access testing features</p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">🔒 Authentication Required</h3>
          <p className="text-yellow-700 mb-4">You need to be logged in to use the testing panel.</p>
          
          <div className="space-y-2 text-sm text-yellow-700">
            <h4 className="font-medium">Testing Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to <a href="/signup" className="text-blue-600 hover:underline">Sign Up</a> and create: <code className="bg-yellow-100 px-1 rounded">test@example.com</code></li>
              <li>Use password: <code className="bg-yellow-100 px-1 rounded">Password123!</code></li>
              <li>Test login/logout functionality</li>
              <li>Return here to run comprehensive tests</li>
            </ol>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => runTest('Create Test Account', createTestAccount)}
              disabled={loading}
              className="btn-primary text-sm px-4 py-2"
            >
              🧪 Auto-Create Test Account
            </button>
            <a href="/signup" className="btn-secondary text-sm px-4 py-2">
              🚀 Manual Signup
            </a>
            <a href="/login" className="btn-secondary text-sm px-4 py-2">
              👋 Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-solid p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🧪 Testing Panel</h2>
        <p className="text-gray-600">Test all application features and generate sample data</p>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => runTest('Authentication Test', testAuthFlow)}
          disabled={loading}
          className="btn-primary"
        >
          🔐 Test Authentication
        </button>

        <button
          onClick={() => runTest('Firebase Connection', testFirebaseConnection)}
          disabled={loading}
          className="btn-primary"
        >
          🔥 Test Firebase
        </button>

        <button
          onClick={() => runTest('Data Validation', testDataValidation)}
          disabled={loading}
          className="btn-primary"
        >
          🔍 Validate Sample Data
        </button>

        <button
          onClick={() => runTest('Sample Data Generation', testSampleDataGeneration)}
          disabled={loading}
          className="btn-primary"
        >
          🎭 Generate Sample Data
        </button>

        <button
          onClick={() => runTest('LocalStorage Test', testLocalStorage)}
          disabled={loading}
          className="btn-primary"
        >
          💾 Test LocalStorage
        </button>
      </div>

      {/* Quick Actions */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
          <button
            onClick={clearResults}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear Results
          </button>
        </div>

        {/* Results Display */}
        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto custom-scrollbar">
          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No test results yet</p>
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`text-sm p-2 rounded ${
                    result.type === 'success'
                      ? 'bg-green-100 text-green-800'
                      : result.type === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  <span className="font-mono text-xs text-gray-500">
                    {result.timestamp}
                  </span>
                  <br />
                  {result.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="spinner mr-2"></div>
          <span className="text-gray-600">Running tests...</span>
        </div>
      )}

      {/* User Info */}
      <div className="border-t pt-4 text-sm text-gray-600">
        <p>👤 Logged in as: <span className="font-medium">{user.email}</span></p>
        <p>🆔 User ID: <span className="font-mono text-xs">{user.uid}</span></p>
      </div>
    </div>
  );
};

export default TestingPanel;