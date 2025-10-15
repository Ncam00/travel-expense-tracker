import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/expenseService';
import { tripService } from '../services/tripService';
import DailySpendingView from '../components/DailySpendingView';
import LocationPicker from '../components/LocationPicker';
import TransportModeSelector from '../components/TransportModeSelector';
import TravelMap from '../components/TravelMap';
import { TRANSPORT_MODES } from '../config/map';

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
  const [activeTab, setActiveTab] = useState('expenses'); // New state for tabs

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

  useEffect(() => {
    const fetchExpenses = async () => {
      if (user) {
        try {
          const expensesData = await expenseService.getExpenses(user.uid);
          // Filter by selected trip if one is selected
          const filteredExpenses = selectedTrip 
            ? expensesData.filter(expense => expense.tripId === selectedTrip)
            : expensesData;
          setExpenses(filteredExpenses);
        } catch (error) {
          console.error('Error fetching expenses:', error);
        }
      }
    };

    fetchExpenses();
  }, [user, selectedTrip]);

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
      await expenseService.addExpense({
        tripId: selectedTrip,
        amount: parseFloat(amount),
        description,
        date,
        category,
        location,
        transportMode,
        userId: user.uid,
      });

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Expense Tracker</h1>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'expenses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Add Expenses
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'daily'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Daily Spending
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'map'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Map View
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'expenses' && (
        <div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Trips</h2>
            <div className="grid gap-2">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => handleTripSelect(trip.id)}
                  className={`p-3 text-left border rounded-lg hover:bg-gray-50 ${
                    selectedTrip === trip.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {trip.name} - {trip.destination}
                </button>
              ))}
            </div>
          </div>

          {selectedTrip && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="food">🍽️ Food & Dining</option>
                      <option value="accommodation">🏨 Accommodation</option>
                      <option value="transport">🚗 Transportation</option>
                      <option value="entertainment">🎭 Entertainment</option>
                      <option value="shopping">🛍️ Shopping</option>
                      <option value="other">📝 Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    placeholder="What did you spend on?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <LocationPicker
                    onLocationSelect={setLocation}
                    selectedLocation={location}
                    placeholder="Where did you spend this?"
                  />
                </div>

                <div>
                  <TransportModeSelector
                    selectedMode={transportMode}
                    onModeSelect={setTransportMode}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                >
                  Add Expense
                </button>
              </form>

              {error && <p className="text-red-600 mt-2">{error}</p>}
              {success && <p className="text-green-600 mt-2">{success}</p>}

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Expenses</h3>
                <div className="space-y-2">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="p-3 border border-gray-200 rounded-md">
                      <div className="flex justify-between">
                        <span>{expense.description}</span>
                        <span className="font-semibold">${expense.amount}</span>
                      </div>
                      <div className="text-sm text-gray-600">{expense.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'daily' && (
        <DailySpendingView selectedTripId={selectedTrip} />
      )}

      {activeTab === 'map' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Expense Map</h2>
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
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;