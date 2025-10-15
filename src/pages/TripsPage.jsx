import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { expenseService } from '../services/expenseService';
import TripModal from '../components/TripModal';

export default function TripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    loadTrips();
  }, [user]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const [userTrips, userExpenses] = await Promise.all([
        tripService.getTrips(user.uid),
        expenseService.getExpenses(user.uid)
      ]);

      // Calculate spending for each trip
      const tripsWithStats = userTrips.map(trip => {
        const tripExpenses = userExpenses.filter(expense => 
          expense.tripId === trip.id
        );
        
        const totalSpent = tripExpenses.reduce((sum, expense) => 
          sum + Number(expense.amount), 0
        );

        const remainingBudget = trip.totalBudget - totalSpent;
        const budgetUsedPercentage = trip.totalBudget > 0 ? 
          (totalSpent / trip.totalBudget) * 100 : 0;

        return {
          ...trip,
          totalSpent,
          remainingBudget,
          budgetUsedPercentage,
          expenseCount: tripExpenses.length
        };
      });

      setTrips(tripsWithStats);
    } catch (err) {
      setError('Failed to load trips');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = () => {
    setEditingTrip(null);
    setIsModalOpen(true);
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setIsModalOpen(true);
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip? This will also delete all associated expenses.')) {
      return;
    }

    try {
      await tripService.deleteTrip(tripId);
      await loadTrips();
    } catch (err) {
      setError('Failed to delete trip');
    }
  };

  const filteredTrips = trips.filter(trip => {
    if (filter === 'active') return !trip.isCompleted;
    if (filter === 'completed') return trip.isCompleted;
    return true;
  });

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(n => (
            <div key={n} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-600 mt-1">Manage your travel plans and budgets</p>
        </div>
        <button
          onClick={handleCreateTrip}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>New Trip</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All Trips' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No trips yet' : `No ${filter} trips`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? "Start planning your next adventure by creating your first trip!"
              : `You don't have any ${filter} trips at the moment.`
            }
          </p>
          {filter === 'all' && (
            <button
              onClick={handleCreateTrip}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Trip
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map(trip => {
            const daysRemaining = getDaysRemaining(trip.endDate);
            const isOverBudget = trip.totalSpent > trip.totalBudget;
            
            return (
              <div
                key={trip.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Trip Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {trip.name}
                      </h3>
                      <p className="text-gray-600 text-sm">📍 {trip.destination}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditTrip(trip)}
                        className="text-gray-400 hover:text-blue-600 p-1"
                        title="Edit trip"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Delete trip"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Trip Dates */}
                  <div className="text-sm text-gray-600 mb-4">
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    {daysRemaining > 0 && !trip.isCompleted && (
                      <span className="ml-2 text-blue-600 font-medium">
                        ({daysRemaining} days left)
                      </span>
                    )}
                    {trip.isCompleted && (
                      <span className="ml-2 text-green-600 font-medium">
                        (Completed)
                      </span>
                    )}
                  </div>

                  {/* Budget Overview */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-medium">
                        {formatCurrency(trip.totalBudget, trip.currency)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spent</span>
                      <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(trip.totalSpent, trip.currency)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining</span>
                      <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatCurrency(trip.remainingBudget, trip.currency)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isOverBudget ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(trip.budgetUsedPercentage, 100)}%`
                        }}
                      ></div>
                    </div>

                    <div className="text-xs text-gray-500 text-center">
                      {trip.budgetUsedPercentage.toFixed(1)}% of budget used • {trip.expenseCount} expenses
                    </div>
                  </div>

                  {trip.description && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {trip.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trip Modal */}
      <TripModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={loadTrips}
        trip={editingTrip}
      />
    </div>
  );
}