import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/expenseService';
import { tripService } from '../services/tripService';
import { realTimeService } from '../services/realTimeService';
import { notificationService } from '../services/notificationService';
import DailySpendingView from '../components/DailySpendingView';
import LocationPicker from '../components/LocationPicker';
import TransportModeSelector from '../components/TransportModeSelector';
import TravelMap from '../components/TravelMap';
import ActivityFeed from '../components/ActivityFeed';
import { TRANSPORT_MODES } from '../config/map';
import { exportExpensesToCSV } from '../utils/csvExport';

const ExpenseTracker = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState(null);
  const [transportMode, setTransportMode] = useState('');
  const [category, setCategory] = useState('food');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('expenses');
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const unsubscribeRef = useRef(null);

  // Initialize notification service
  useEffect(() => {
    notificationService.initialize();
  }, []);

  useEffect(() => {
    const fetchTrips = async () => {
      if (user) {
        try {
          const tripsData = await tripService.getTrips(user.uid);
          setTrips(tripsData);
        } catch (error) {
          console.error('Error fetching trips:', error);
        }
      }
    };

    fetchTrips();
  }, [user]);

  // Real-time expense updates
  useEffect(() => {
    if (!user || !selectedTrip || !isRealTimeEnabled) {
      // Fallback to manual fetch
      const fetchExpenses = async () => {
        if (user && selectedTrip) {
          try {
            const expensesData = await expenseService.getExpenses(user.uid);
            const filteredExpenses = expensesData.filter(expense => expense.tripId === selectedTrip);
            setExpenses(filteredExpenses);
          } catch (error) {
            console.error('Error fetching expenses:', error);
          }
        }
      };
      fetchExpenses();
      return;
    }

    // Set up real-time subscription
    const unsubscribe = realTimeService.subscribeToExpenses(selectedTrip, {
      onExpensesUpdate: (newExpenses) => {
        setExpenses(newExpenses);
        setConnectionStatus('connected');
      },
      onExpenseChanges: (changes) => {
        changes.forEach(change => {
          if (change.type === 'added') {
            notificationService.showToast(`New expense: ${change.expense.description}`, 'success');
          } else if (change.type === 'modified') {
            notificationService.showToast(`Updated expense: ${change.expense.description}`, 'info');
          } else if (change.type === 'removed') {
            notificationService.showToast(`Deleted expense: ${change.expense.description}`, 'warning');
          }
        });
      },
      onError: (error) => {
        console.error('Real-time expense error:', error);
        setConnectionStatus('error');
        notificationService.showToast('Connection error - updates may be delayed', 'error');
      }
    });

    unsubscribeRef.current = unsubscribe;
    setConnectionStatus('connected');

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user, selectedTrip, isRealTimeEnabled]);

  const handleTripSelect = (tripId) => {
    setSelectedTrip(tripId);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!amount || !description || !date) {
      setError('Please fill in all fields');
      return;
    }

    if (!selectedTrip) {
      setError('Please select a trip first');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const newExpense = await expenseService.addExpense({
        tripId: selectedTrip,
        amount: parseFloat(amount),
        description,
        date,
        category,
        location,
        transportMode,
        userId: user.uid,
      });

      // Send notification to trip members
      await notificationService.sendExpenseNotification(selectedTrip, newExpense, 'added');

      setSuccess('Expense added successfully');
      setAmount('');
      setDescription('');
      setDate('');
      setLocation(null);
      setTransportMode('');
      setCategory('food');
      
      // Refresh expenses
      const expensesData = await expenseService.getExpenses(user.uid);
      const filteredExpenses = expensesData.filter(expense => expense.tripId === selectedTrip);
      setExpenses(filteredExpenses);
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense');
    }
  };

  return (
    <div className="p-8 page-transition">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">💰</div>
          <h1 className="heading-lg text-gray-900 mb-4">
            Expense Tracker
          </h1>
          <p className="text-gray-600 text-lg">
            Track your travel expenses with location and analytics
          </p>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-2xl inline-flex">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'expenses'
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <span>💳</span>
                Add Expenses
              </button>
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'daily'
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <span>📊</span>
                Daily Spending
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'map'
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <span>🗺️</span>
                Map View
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'activity'
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <span>📋</span>
                Activity
                {connectionStatus === 'connected' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1" />
                )}
              </button>
            </div>
          </div>
          
          {/* Connection Status Indicator & Export Button */}
          {selectedTrip && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-4">
              <button
                onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  isRealTimeEnabled 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                {isRealTimeEnabled ? 'Live Updates Enabled' : 'Manual Refresh Mode'}
              </button>
              
              {expenses.length > 0 && (
                <button
                  onClick={() => {
                    try {
                      const selectedTripData = trips.find(t => t.id === selectedTrip);
                      exportExpensesToCSV(
                        expenses,
                        `${selectedTripData?.name || 'trip'}_expenses_${new Date().toISOString().split('T')[0]}.csv`
                      );
                    } catch (err) {
                      setError('Failed to export expenses');
                      setTimeout(() => setError(''), 3000);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all bg-blue-100 text-blue-700 hover:bg-blue-200"
                  title="Export expenses as CSV"
                >
                  📊 Export to CSV
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'expenses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Trip Selection */}
            <div className="card-solid p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span>🎒</span>
                Select Your Trip
              </h2>
              <div className="grid gap-4">
                {trips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => handleTripSelect(trip.id)}
                    className={`p-6 text-left rounded-2xl border-2 transition-all duration-300 hover-lift ${
                      selectedTrip === trip.id 
                        ? 'border-blue-500 bg-blue-50 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{trip.name}</h3>
                        <p className="text-gray-600">{trip.destination}</p>
                      </div>
                      <div className="text-2xl">
                        {selectedTrip === trip.id ? '✅' : '🌍'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedTrip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="card-solid p-8"
              >
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                  <span>💳</span>
                  Add New Expense
                </h2>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                    <div className="flex items-center gap-2">
                      <span>❌</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
                    <div className="flex items-center gap-2">
                      <span>✅</span>
                      <span>{success}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddExpense} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label">
                        💰 Amount *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input-solid w-full"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        📝 Description *
                      </label>
                      <input
                        type="text"
                        placeholder="What did you spend on?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input-solid w-full"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        📅 Date *
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="input-solid w-full"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        🏷️ Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-solid w-full"
                      >
                        <option value="food">🍽️ Food</option>
                        <option value="transport">🚗 Transport</option>
                        <option value="accommodation">🏨 Accommodation</option>
                        <option value="entertainment">🎯 Entertainment</option>
                        <option value="shopping">🛍️ Shopping</option>
                        <option value="other">📦 Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Location Selection */}
                  <div className="form-group">
                    <label className="form-label">
                      📍 Location
                    </label>
                    <LocationPicker
                      onLocationSelect={setLocation}
                      selectedLocation={location}
                    />
                  </div>

                  {/* Transport Mode Selection */}
                  <div className="form-group">
                    <label className="form-label">
                      🚀 Transport Mode
                    </label>
                    <TransportModeSelector
                      selectedMode={transportMode}
                      onModeSelect={setTransportMode}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full"
                  >
                    ✨ Add Expense
                  </button>
                </form>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'daily' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DailySpendingView selectedTripId={selectedTrip} />
          </motion.div>
        )}

        {activeTab === 'map' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card-solid p-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span>🗺️</span>
                Expense Map
              </h2>
              <p className="text-gray-600">
                {selectedTrip 
                  ? `Viewing expenses with locations for the selected trip`
                  : 'Select a trip to view expenses on the map'
                }
              </p>
            </div>
            
            {expenses.length > 0 ? (
              <div className="space-y-6">
                <TravelMap 
                  expenses={expenses.filter(expense => expense.location)} 
                  height="500px"
                  showExpensePopups={true}
                />
                
                {/* Expense stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
                    <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-gray-600">With Locations</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {expenses.filter(e => e.location).length}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-gray-600">Total Amount</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      ${expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {/* Transport mode breakdown */}
                {expenses.some(e => e.transportMode) && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Transport Modes Used</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(
                        expenses.reduce((acc, expense) => {
                          if (expense.transportMode) {
                            acc[expense.transportMode] = (acc[expense.transportMode] || 0) + 1;
                          }
                          return acc;
                        }, {})
                      ).map(([mode, count]) => (
                        <div key={mode} className="text-center">
                          <div className="text-2xl mb-1">
                            {TRANSPORT_MODES.find(t => t.id === mode)?.icon || '🔄'}
                          </div>
                          <div className="text-sm font-medium capitalize">{mode}</div>
                          <div className="text-xs text-gray-600">{count} expenses</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🗺️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses to map</h3>
                <p className="text-gray-600">
                  {selectedTrip 
                    ? 'Add some expenses with locations to see them on the map'
                    : 'Select a trip first, then add expenses with locations'
                  }
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Activity Feed Tab */}
        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {selectedTrip ? (
              <ActivityFeed 
                tripId={selectedTrip} 
                className="w-full"
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a trip to view activity</h3>
                <p className="text-gray-600">
                  Choose a trip to see real-time updates from group members
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;