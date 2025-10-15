import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/expenseService';
import { tripService } from '../services/tripService';

const DailySpendingView = ({ selectedTripId = null }) => {
  const { user } = useAuth();
  const [dailySpending, setDailySpending] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTripId && trips.length > 0) {
      const trip = trips.find(t => t.id === selectedTripId);
      if (trip) {
        setSelectedTrip(trip);
        setDateRange({
          startDate: trip.startDate,
          endDate: trip.endDate
        });
      }
    }
  }, [selectedTripId, trips]);

  useEffect(() => {
    if (user && (selectedTrip || dateRange.startDate)) {
      loadDailySpending();
    }
  }, [user, selectedTrip, dateRange]);

  const loadTrips = async () => {
    try {
      const tripsData = await tripService.getTrips(user.uid);
      setTrips(tripsData);
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  const loadDailySpending = async () => {
    try {
      setLoading(true);
      const expenses = await expenseService.getExpenses(user.uid);
      
      // Filter expenses by trip or date range
      let filteredExpenses = expenses;
      if (selectedTrip) {
        filteredExpenses = expenses.filter(expense => expense.tripId === selectedTrip.id);
      } else if (dateRange.startDate && dateRange.endDate) {
        filteredExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          const start = new Date(dateRange.startDate);
          const end = new Date(dateRange.endDate);
          return expenseDate >= start && expenseDate <= end;
        });
      }

      // Group expenses by date
      const dailyData = {};
      filteredExpenses.forEach(expense => {
        const date = expense.date;
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            total: 0,
            expenses: [],
            categories: {}
          };
        }
        dailyData[date].total += parseFloat(expense.amount);
        dailyData[date].expenses.push(expense);
        
        // Group by category
        if (!dailyData[date].categories[expense.category]) {
          dailyData[date].categories[expense.category] = 0;
        }
        dailyData[date].categories[expense.category] += parseFloat(expense.amount);
      });

      // Convert to array and sort by date
      const sortedDailyData = Object.values(dailyData).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      setDailySpending(sortedDailyData);
    } catch (error) {
      console.error('Error loading daily spending:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTripChange = (tripId) => {
    if (tripId) {
      const trip = trips.find(t => t.id === tripId);
      setSelectedTrip(trip);
      setDateRange({
        startDate: trip.startDate,
        endDate: trip.endDate
      });
    } else {
      setSelectedTrip(null);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
    setSelectedTrip(null); // Clear trip selection when manually setting dates
  };

  const getTotalSpending = () => {
    return dailySpending.reduce((total, day) => total + day.total, 0);
  };

  const getAverageDaily = () => {
    return dailySpending.length > 0 ? getTotalSpending() / dailySpending.length : 0;
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: 'bg-red-200 text-red-800',
      accommodation: 'bg-blue-200 text-blue-800',
      transport: 'bg-green-200 text-green-800',
      entertainment: 'bg-purple-200 text-purple-800',
      shopping: 'bg-yellow-200 text-yellow-800',
      other: 'bg-gray-200 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Spending View</h2>
          <p className="text-gray-600">Track your daily expenses and spending patterns</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedTrip?.id || ''}
            onChange={(e) => handleTripChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a trip</option>
            {trips.map(trip => (
              <option key={trip.id} value={trip.id}>
                {trip.name} - {trip.destination}
              </option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {dailySpending.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Spending</p>
              <p className="text-2xl font-bold text-gray-900">${getTotalSpending().toFixed(2)}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Daily Average</p>
              <p className="text-2xl font-bold text-gray-900">${getAverageDaily().toFixed(2)}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Days Tracked</p>
              <p className="text-2xl font-bold text-gray-900">{dailySpending.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Daily Breakdown */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daily Breakdown</h3>
        </div>
        
        {dailySpending.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {dailySpending.map((day, index) => (
              <div key={day.date} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h4>
                    <p className="text-sm text-gray-600">{day.expenses.length} expenses</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">${day.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Category breakdown */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(day.categories).map(([category, amount]) => (
                      <span
                        key={category}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}
                      >
                        {category}: ${amount.toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Individual expenses */}
                <div className="space-y-2">
                  {day.expenses.map((expense, expenseIndex) => (
                    <div key={expenseIndex} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        <p className="text-sm text-gray-600">{expense.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${expense.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No spending data</h3>
            <p className="text-gray-600">
              {selectedTrip || (dateRange.startDate && dateRange.endDate)
                ? 'No expenses found for the selected period'
                : 'Select a trip or date range to view daily spending'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailySpendingView;