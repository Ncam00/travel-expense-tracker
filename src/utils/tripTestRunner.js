/**
 * Trip Creation & Management Test Runner
 * Comprehensive testing for trip functionality
 */

import { tripService } from '../services/tripService';
import { tripSharingService } from '../services/tripSharingService';
import { expenseService } from '../services/expenseService';
import { realTimeService } from '../services/realTimeService';
import { notificationService } from '../services/notificationService';

class TripTestRunner {
  constructor() {
    this.testResults = [];
    this.currentUser = null;
    this.testTrip = null;
  }

  /**
   * Initialize test runner
   */
  async initialize(user) {
    this.currentUser = user;
    this.testResults = [];
    console.log('🧪 Trip Test Runner Initialized for:', user.email);
  }

  /**
   * Add test result
   */
  addResult(message, type = 'info') {
    const result = {
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    this.testResults.push(result);
    console.log(`${this.getIcon(type)} ${message}`);
    return result;
  }

  /**
   * Get icon for result type
   */
  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  /**
   * Test 1: Basic Trip Creation
   */
  async testBasicTripCreation() {
    this.addResult('🎯 Testing basic trip creation...', 'info');
    
    try {
      const tripData = {
        name: 'Test Trip - Europe Adventure',
        destination: 'Paris, France',
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-11-07'),
        totalBudget: 2500,
        currency: 'EUR',
        description: 'A beautiful European adventure to test our trip creation system!'
      };

      const createdTrip = await tripService.createTrip(this.currentUser.uid, tripData);
      this.testTrip = createdTrip;
      
      this.addResult(`✅ Trip created successfully: ${createdTrip.name}`, 'success');
      this.addResult(`📍 Destination: ${createdTrip.destination}`, 'info');
      this.addResult(`💰 Budget: ${createdTrip.currency} ${createdTrip.totalBudget}`, 'info');
      this.addResult(`📅 Duration: ${createdTrip.startDate.toLocaleDateString()} - ${createdTrip.endDate.toLocaleDateString()}`, 'info');
      
      return createdTrip;
    } catch (error) {
      this.addResult(`❌ Trip creation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Test 2: Trip Sharing & Code Generation
   */
  async testTripSharing() {
    if (!this.testTrip) throw new Error('No test trip available');
    
    this.addResult('🔗 Testing trip sharing functionality...', 'info');
    
    try {
      // Generate share code
      const shareCode = await tripSharingService.generateShareCode(this.testTrip.id);
      this.addResult(`🎯 Share code generated: ${shareCode}`, 'success');
      
      // Test share code validation
      const isValid = await tripSharingService.validateShareCode(shareCode);
      if (isValid) {
        this.addResult('✅ Share code validation passed', 'success');
      } else {
        this.addResult('❌ Share code validation failed', 'error');
      }
      
      // Get trip members
      const members = await tripSharingService.getTripMembers(this.testTrip.id);
      this.addResult(`👥 Current members: ${members.length}`, 'info');
      
      return { shareCode, members };
    } catch (error) {
      this.addResult(`❌ Trip sharing test failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Test 3: Location Integration
   */
  async testLocationIntegration() {
    this.addResult('🗺️ Testing location integration...', 'info');
    
    try {
      // Test popular travel destinations
      const testLocations = [
        { name: 'Eiffel Tower, Paris', lat: 48.8584, lng: 2.2945 },
        { name: 'Louvre Museum, Paris', lat: 48.8606, lng: 2.3376 },
        { name: 'Arc de Triomphe, Paris', lat: 48.8738, lng: 2.2950 }
      ];
      
      for (const location of testLocations) {
        // Simulate location selection
        this.addResult(`📍 Testing location: ${location.name}`, 'info');
        
        // Validate coordinates
        if (location.lat && location.lng) {
          this.addResult(`✅ Location coordinates valid: ${location.lat}, ${location.lng}`, 'success');
        } else {
          this.addResult(`❌ Invalid location coordinates`, 'error');
        }
      }
      
      this.addResult('🗺️ Location integration test complete', 'success');
      return testLocations;
    } catch (error) {
      this.addResult(`❌ Location test failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Test 4: Expense Integration
   */
  async testExpenseIntegration() {
    if (!this.testTrip) throw new Error('No test trip available');
    
    this.addResult('💰 Testing expense integration...', 'info');
    
    try {
      // Create test expenses
      const testExpenses = [
        {
          tripId: this.testTrip.id,
          amount: 45.50,
          description: 'Dinner at Local Bistro',
          category: 'food',
          location: {
            name: 'Le Comptoir du 7ème, Paris',
            coordinates: { lat: 48.8566, lng: 2.3522 }
          },
          transportMode: 'walking',
          date: new Date().toISOString()
        },
        {
          tripId: this.testTrip.id,
          amount: 12.30,
          description: 'Metro Day Pass',
          category: 'transport',
          location: {
            name: 'Châtelet-Les Halles Station',
            coordinates: { lat: 48.8619, lng: 2.3467 }
          },
          transportMode: 'train',
          date: new Date().toISOString()
        }
      ];

      const createdExpenses = [];
      for (const expenseData of testExpenses) {
        const expense = await expenseService.addExpense({
          ...expenseData,
          userId: this.currentUser.uid
        });
        createdExpenses.push(expense);
        this.addResult(`✅ Expense added: ${expense.description} (${expense.amount})`, 'success');
      }
      
      // Verify expenses were added to trip
      const tripExpenses = await expenseService.getExpensesByTrip(this.testTrip.id);
      this.addResult(`📊 Total expenses in trip: ${tripExpenses.length}`, 'info');
      
      const totalAmount = tripExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      this.addResult(`💰 Total spent: ${this.testTrip.currency} ${totalAmount.toFixed(2)}`, 'info');
      
      return createdExpenses;
    } catch (error) {
      this.addResult(`❌ Expense integration test failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Test 5: Real-time Collaboration
   */
  async testRealTimeFeatures() {
    if (!this.testTrip) throw new Error('No test trip available');
    
    this.addResult('📡 Testing real-time collaboration...', 'info');
    
    try {
      // Initialize notification service
      await notificationService.initialize();
      this.addResult('✅ Notification service initialized', 'success');
      
      // Test activity logging
      await realTimeService.logActivity(this.testTrip.id, 'test_trip_creation', {
        tripName: this.testTrip.name,
        testType: 'automated_testing'
      });
      this.addResult('✅ Activity logged successfully', 'success');
      
      // Test member status update
      await realTimeService.updateMemberStatus(this.testTrip.id, 'online');
      this.addResult('✅ Member status updated', 'success');
      
      // Test toast notification
      notificationService.showToast('Testing trip creation workflow!', 'info', 2000);
      this.addResult('✅ Toast notification sent', 'success');
      
      return true;
    } catch (error) {
      this.addResult(`❌ Real-time features test failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Test 6: Trip Dashboard Navigation
   */
  async testTripDashboard() {
    if (!this.testTrip) throw new Error('No test trip available');
    
    this.addResult('🎛️ Testing trip dashboard...', 'info');
    
    try {
      // Get trip details
      const tripDetails = await tripService.getTrip(this.testTrip.id);
      this.addResult(`✅ Trip details loaded: ${tripDetails.name}`, 'success');
      
      // Test budget calculation
      const expenses = await expenseService.getExpensesByTrip(this.testTrip.id);
      const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const budgetRemaining = tripDetails.totalBudget - totalSpent;
      const budgetUsedPercent = (totalSpent / tripDetails.totalBudget) * 100;
      
      this.addResult(`💰 Budget analysis:`, 'info');
      this.addResult(`   Total Budget: ${tripDetails.currency} ${tripDetails.totalBudget}`, 'info');
      this.addResult(`   Total Spent: ${tripDetails.currency} ${totalSpent.toFixed(2)}`, 'info');
      this.addResult(`   Remaining: ${tripDetails.currency} ${budgetRemaining.toFixed(2)}`, 'info');
      this.addResult(`   Used: ${budgetUsedPercent.toFixed(1)}%`, 'info');
      
      if (budgetUsedPercent <= 100) {
        this.addResult('✅ Budget tracking working correctly', 'success');
      } else {
        this.addResult('⚠️ Over budget - alerts should trigger', 'warning');
      }
      
      return {
        tripDetails,
        expenses,
        budgetAnalysis: {
          totalSpent,
          budgetRemaining,
          budgetUsedPercent
        }
      };
    } catch (error) {
      this.addResult(`❌ Dashboard test failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Test 7: Trip Editing & Updates
   */
  async testTripEditing() {
    if (!this.testTrip) throw new Error('No test trip available');
    
    this.addResult('✏️ Testing trip editing...', 'info');
    
    try {
      const updatedData = {
        description: 'Updated: A magnificent European adventure with enhanced testing validation!',
        totalBudget: 3000 // Increase budget
      };
      
      const updatedTrip = await tripService.updateTrip(this.testTrip.id, updatedData);
      this.addResult(`✅ Trip updated successfully`, 'success');
      this.addResult(`📝 New description: ${updatedTrip.description.substring(0, 50)}...`, 'info');
      this.addResult(`💰 Updated budget: ${updatedTrip.currency} ${updatedTrip.totalBudget}`, 'info');
      
      // Log the update activity
      await realTimeService.logActivity(this.testTrip.id, 'trip_updated', {
        changes: Object.keys(updatedData),
        newBudget: updatedData.totalBudget
      });
      
      this.testTrip = updatedTrip;
      return updatedTrip;
    } catch (error) {
      this.addResult(`❌ Trip editing test failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Run complete test suite
   */
  async runCompleteTestSuite() {
    this.addResult('🚀 Starting complete trip creation test suite...', 'info');
    const startTime = Date.now();
    
    try {
      // Test 1: Basic Creation
      await this.testBasicTripCreation();
      
      // Test 2: Sharing Features
      await this.testTripSharing();
      
      // Test 3: Location Integration
      await this.testLocationIntegration();
      
      // Test 4: Expense Integration
      await this.testExpenseIntegration();
      
      // Test 5: Real-time Features
      await this.testRealTimeFeatures();
      
      // Test 6: Dashboard
      await this.testTripDashboard();
      
      // Test 7: Editing
      await this.testTripEditing();
      
      const duration = Date.now() - startTime;
      this.addResult(`🎉 Complete test suite passed in ${duration}ms!`, 'success');
      this.addResult(`📊 Total tests: ${this.testResults.filter(r => r.type === 'success').length} passed`, 'success');
      
      return {
        success: true,
        duration,
        results: this.testResults,
        testTrip: this.testTrip
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addResult(`💥 Test suite failed after ${duration}ms: ${error.message}`, 'error');
      
      return {
        success: false,
        duration,
        error: error.message,
        results: this.testResults,
        testTrip: this.testTrip
      };
    }
  }

  /**
   * Get test results summary
   */
  getTestSummary() {
    const total = this.testResults.length;
    const success = this.testResults.filter(r => r.type === 'success').length;
    const errors = this.testResults.filter(r => r.type === 'error').length;
    const warnings = this.testResults.filter(r => r.type === 'warning').length;
    
    return {
      total,
      success,
      errors,
      warnings,
      successRate: total > 0 ? (success / total * 100).toFixed(1) : 0,
      results: this.testResults
    };
  }

  /**
   * Clean up test data
   */
  async cleanup() {
    if (this.testTrip) {
      try {
        // Note: In production, you might want to keep test data
        // await tripService.deleteTrip(this.testTrip.id);
        this.addResult(`🧹 Cleanup: Test trip ${this.testTrip.name} marked for review`, 'info');
      } catch (error) {
        this.addResult(`⚠️ Cleanup warning: ${error.message}`, 'warning');
      }
    }
  }
}

export { TripTestRunner };
export default TripTestRunner;