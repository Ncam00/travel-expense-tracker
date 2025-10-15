import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/expenseService';
import { tripService } from '../services/tripService';
import DailySpendingView from '../components/DailySpendingView';

const ExpenseTracker = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
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
        userId: user.uid,
      });

      setSuccess('Expense added successfully');
      setAmount('');
      setDescription('');
      setDate('');
      
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
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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
    </div>
  );
};

export default ExpenseTracker;