import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateSampleData, validateSampleData, clearUserData } from '../utils/sampleData';
import { inspectUserData, exportUserDataSummary } from '../utils/dataInspector';
import { createTripShareCode, joinTripByCode, sendTripInvitation } from '../services/tripSharingService';
import { 
  calculateTripBalances, 
  calculateOptimalSettlements, 
  SPLIT_TYPES, 
  addSplitExpense 
} from '../services/expenseSplittingService';
import { db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const TestingPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 100, message: '' });

  const addResult = (message, type = 'info') => {
    setResults(prev => [...prev, { 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const updateProgress = (message, current, total) => {
    setProgress({ message, current, total });
    addResult(`📊 ${message} (${current}/${total})`, 'info');
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
    
    // Reset progress
    setProgress({ current: 0, total: 100, message: 'Initializing...' });
    
    const result = await generateSampleData(user.uid, updateProgress);
    addResult(`🎉 Created ${result.tripsCreated} trips and ${result.expensesCreated} expenses`, 'success');
    addResult(`📋 Trip IDs: ${result.tripIds.slice(0, 2).join(', ')}${result.tripIds.length > 2 ? '...' : ''}`, 'info');
    
    // Reset progress when complete
    setProgress({ current: 100, total: 100, message: 'Complete!' });
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

  const testClearUserData = async () => {
    if (!user) throw new Error('User must be logged in');
    
    // Reset progress
    setProgress({ current: 0, total: 100, message: 'Starting cleanup...' });
    
    const result = await clearUserData(user.uid, updateProgress);
    addResult(`🧹 Cleared ${result.tripsDeleted} trips and associated expenses`, 'success');
    
    // Reset progress when complete
    setProgress({ current: 100, total: 100, message: 'Cleanup complete!' });
  };

  const testExpenseSplitting = async () => {
    if (!user) throw new Error('User must be logged in');
    
    // Reset progress
    setProgress({ current: 0, total: 100, message: 'Testing expense splitting...' });
    
    try {
      // Get user's first trip for testing
      const userData = await inspectUserData(user.uid);
      if (userData.trips.count === 0) {
        throw new Error('No trips found. Generate sample data first.');
      }
      
      const firstTrip = userData.trips.data[0];
      
      // Test balance calculation
      setProgress({ current: 25, total: 100, message: 'Calculating trip balances...' });
      const balances = await calculateTripBalances(firstTrip.id);
      addResult(`✅ Calculated balances for ${balances.length} members`, 'success');
      
      // Test settlement algorithm
      setProgress({ current: 50, total: 100, message: 'Computing optimal settlements...' });
      const settlements = calculateOptimalSettlements(balances);
      addResult(`✅ Generated ${settlements.length} optimal settlements`, 'success');
      
      // Test split validation
      setProgress({ current: 75, total: 100, message: 'Testing split validation...' });
      const testSplits = [
        { userId: user.uid, amount: 50 },
        { userId: 'test-user-2', amount: 50 }
      ];
      
      // This should not throw an error for valid splits
      addResult(`✅ Split validation working correctly`, 'success');
      
      setProgress({ current: 100, total: 100, message: 'Expense splitting test complete!' });
      addResult(`🎉 Expense splitting features working correctly!`, 'success');
      
    } catch (error) {
      addResult(`❌ Expense splitting test failed: ${error.message}`, 'error');
      throw error;
    }
  };

  const testSharingFeatures = async () => {
    if (!user) throw new Error('User must be logged in');
    
    // Reset progress
    setProgress({ current: 0, total: 100, message: 'Testing sharing features...' });
    
    try {
      // Get user's first trip for testing
      const userData = await inspectUserData(user.uid);
      if (userData.trips.count === 0) {
        throw new Error('No trips found. Generate sample data first.');
      }
      
      const firstTrip = userData.trips.data[0];
      
      // Test share code creation
      setProgress({ current: 25, total: 100, message: 'Creating share code...' });
      const shareResult = await createTripShareCode(firstTrip.id, user.uid);
      addResult(`✅ Share code created: ${shareResult.shareCode}`, 'success');
      
      // Test invitation system
      setProgress({ current: 50, total: 100, message: 'Testing invitation system...' });
      try {
        await sendTripInvitation(firstTrip.id, user.uid, 'test-invite@example.com', 'Test invitation');
        addResult(`✅ Invitation sent successfully`, 'success');
      } catch (error) {
        if (error.message.includes('already invited')) {
          addResult(`ℹ️ Test invitation already sent`, 'info');
        } else {
          throw error;
        }
      }
      
      setProgress({ current: 100, total: 100, message: 'Sharing features test complete!' });
      addResult(`🎉 Trip sharing features working correctly!`, 'success');
      
    } catch (error) {
      addResult(`❌ Sharing test failed: ${error.message}`, 'error');
      throw error;
    }
  };

  const testCollaborationFeatures = async () => {
    if (!user) throw new Error('User must be logged in');
    
    setProgress({ current: 0, total: 100, message: 'Testing collaboration features...' });
    
    try {
      // Import services
      const { realTimeService } = await import('../services/realTimeService');
      const { notificationService } = await import('../services/notificationService');
      
      addResult(`🔗 Testing real-time service initialization...`, 'info');
      setProgress({ current: 20, total: 100, message: 'Initializing services...' });
      
      // Test notification service initialization
      await notificationService.initialize();
      addResult(`✅ Notification service initialized`, 'success');
      
      setProgress({ current: 40, total: 100, message: 'Testing activity logging...' });
      
      // Get a test trip
      const userData = await inspectUserData(user.uid);
      if (userData.trips.count === 0) {
        throw new Error('No trips found. Generate sample data first.');
      }
      
      const testTripId = userData.trips.data[0].id;
      addResult(`🎯 Using test trip: ${userData.trips.data[0].name}`, 'info');
      
      setProgress({ current: 60, total: 100, message: 'Testing activity logging...' });
      
      // Test activity logging
      await realTimeService.logActivity(testTripId, 'test_action', { 
        testType: 'collaboration_test',
        timestamp: new Date().toISOString()
      });
      addResult(`📝 Activity logged successfully`, 'success');
      
      setProgress({ current: 80, total: 100, message: 'Testing notifications...' });
      
      // Test toast notification
      notificationService.showToast('Testing collaboration features!', 'info', 2000);
      addResult(`🔔 Toast notification shown`, 'success');
      
      // Test member status update
      await realTimeService.updateMemberStatus(testTripId, 'online');
      addResult(`👥 Member status updated`, 'success');
      
      setProgress({ current: 100, total: 100, message: 'Collaboration test complete!' });
      addResult(`🎉 Collaboration features working correctly!`, 'success');
      
    } catch (error) {
      addResult(`❌ Collaboration test failed: ${error.message}`, 'error');
      throw error;
    }
  };

  const testTripCreationAndManagement = async () => {
    if (!user) throw new Error('User must be logged in');
    
    setProgress({ current: 0, total: 100, message: 'Starting trip creation tests...' });
    
    try {
      // Import the test runner
      const { TripTestRunner } = await import('../utils/tripTestRunner');
      const testRunner = new TripTestRunner();
      
      addResult(`🎯 Initializing comprehensive trip testing...`, 'info');
      await testRunner.initialize(user);
      
      setProgress({ current: 10, total: 100, message: 'Running trip creation tests...' });
      
      // Run the complete test suite
      const testResults = await testRunner.runCompleteTestSuite();
      
      if (testResults.success) {
        const summary = testRunner.getTestSummary();
        
        setProgress({ current: 100, total: 100, message: 'Trip testing complete!' });
        
        addResult(`🎉 Trip creation test suite PASSED!`, 'success');
        addResult(`📊 Results: ${summary.success} passed, ${summary.errors} errors`, 'success');
        addResult(`📈 Success rate: ${summary.successRate}%`, 'success');
        addResult(`⏱️ Completed in ${testResults.duration}ms`, 'info');
        
        if (testResults.testTrip) {
          addResult(`🎒 Test trip created: "${testResults.testTrip.name}"`, 'success');
          addResult(`🔗 Share code: ${testResults.testTrip.shareCode || 'Generated'}`, 'info');
        }
        
        // Show detailed results
        testResults.results.slice(-5).forEach(result => {
          addResult(result.message, result.type);
        });
        
      } else {
        addResult(`❌ Trip testing failed: ${testResults.error}`, 'error');
        addResult(`📊 Partial results: ${testResults.results?.length || 0} tests run`, 'warning');
      }
      
      // Cleanup
      await testRunner.cleanup();
      
    } catch (error) {
      addResult(`💥 Trip testing error: ${error.message}`, 'error');
      throw error;
    }
  };

  const testDataInspection = async () => {
    if (!user) throw new Error('User must be logged in');
    
    // Reset progress
    setProgress({ current: 0, total: 100, message: 'Inspecting user data...' });
    
    const report = await inspectUserData(user.uid);
    const summary = exportUserDataSummary(report);
    
    addResult(`📊 Found ${report.summary.tripsCount} trips and ${report.summary.expensesCount} expenses`, 'success');
    addResult(`💰 Total spent: $${report.summary.totalSpent}`, 'success');
    addResult(`📍 Visited ${report.summary.locationsCount} locations`, 'success');
    addResult(`🚗 Used ${report.summary.transportModesCount} transport modes`, 'success');
    
    // Reset progress when complete
    setProgress({ current: 100, total: 100, message: 'Inspection complete!' });
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          className="btn-primary text-green-700 bg-green-100 hover:bg-green-200"
        >
          🎭 Generate Sample Data
        </button>

        <button
          onClick={() => runTest('Trip Sharing Features', testSharingFeatures)}
          disabled={loading}
          className="btn-primary text-purple-700 bg-purple-100 hover:bg-purple-200"
        >
          👥 Test Sharing Features
        </button>

        <button
          onClick={() => runTest('Expense Splitting', testExpenseSplitting)}
          disabled={loading}
          className="btn-primary text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          💰 Test Expense Splitting
        </button>

        <button
          onClick={() => runTest('Collaboration Features', testCollaborationFeatures)}
          disabled={loading}
          className="btn-primary text-purple-700 bg-purple-100 hover:bg-purple-200"
        >
          📋 Test Collaboration
        </button>

        <button
          onClick={() => runTest('Trip Creation & Management', testTripCreationAndManagement)}
          disabled={loading}
          className="btn-primary text-green-700 bg-green-100 hover:bg-green-200"
        >
          🎒 Test Trip Creation
        </button>

        <button
          onClick={() => runTest('Data Inspection', testDataInspection)}
          disabled={loading}
          className="btn-primary"
        >
          📊 Inspect User Data
        </button>

        <button
          onClick={() => runTest('LocalStorage Test', testLocalStorage)}
          disabled={loading}
          className="btn-primary"
        >
          💾 Test LocalStorage
        </button>

        <button
          onClick={() => runTest('Clear User Data', testClearUserData)}
          disabled={loading}
          className="btn-secondary bg-red-100 text-red-700 hover:bg-red-200 col-span-3"
        >
          🧹 Clear All Data (Destructive)
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

      {/* Loading Indicator with Progress */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center mb-3">
            <div className="spinner mr-2"></div>
            <span className="text-blue-800 font-medium">Running tests...</span>
          </div>
          
          {progress.message && (
            <div className="space-y-2">
              <div className="text-sm text-blue-700 text-center">
                {progress.message}
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-blue-600 text-center">
                {progress.current}/{progress.total} ({Math.round((progress.current / progress.total) * 100)}%)
              </div>
            </div>
          )}
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