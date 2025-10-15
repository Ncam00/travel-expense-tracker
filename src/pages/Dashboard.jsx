import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/expenseService';
import { tripService } from '../services/tripService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalTrips: 0,
    monthlySpending: 0,
    averagePerTrip: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [expensesData, tripsData] = await Promise.all([
        expenseService.getExpenses(user.uid),
        tripService.getTrips(user.uid)
      ]);
      
      setExpenses(expensesData);
      setTrips(tripsData);
      calculateStats(expensesData, tripsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (expensesData, tripsData) => {
    const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expensesData.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    const monthlySpending = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averagePerTrip = tripsData.length > 0 ? totalExpenses / tripsData.length : 0;

    setStats({
      totalExpenses,
      totalTrips: tripsData.length,
      monthlySpending,
      averagePerTrip
    });
  };

  const getRecentExpenses = () => {
    return expenses.slice(0, 5);
  };

  const getUpcomingTrips = () => {
    const today = new Date();
    return trips.filter(trip => new Date(trip.startDate) > today).slice(0, 3);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.email}!
        </h1>
        <p className="text-gray-600">Here's your travel spending overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalExpenses.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✈️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Trips</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.monthlySpending.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg per Trip</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.averagePerTrip.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
              <Link 
                to="/expenses" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {getRecentExpenses().length > 0 ? (
              <div className="space-y-4">
                {getRecentExpenses().map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-600">{expense.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${expense.amount}</p>
                      <p className="text-sm text-gray-600">{expense.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No expenses yet</p>
                <Link 
                  to="/expenses" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Add your first expense
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Trips */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Trips</h2>
              <Link 
                to="/trips" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {getUpcomingTrips().length > 0 ? (
              <div className="space-y-4">
                {getUpcomingTrips().map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{trip.name}</p>
                      <p className="text-sm text-gray-600">{trip.destination}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${trip.budget}</p>
                      <p className="text-sm text-gray-600">{trip.startDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No upcoming trips</p>
                <Link 
                  to="/trips" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Plan your first trip
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/expenses"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">💳</span>
            <div>
              <p className="font-medium text-gray-900">Add Expense</p>
              <p className="text-sm text-gray-600">Track your spending</p>
            </div>
          </Link>
          
          <Link
            to="/trips"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">🗺️</span>
            <div>
              <p className="font-medium text-gray-900">Plan Trip</p>
              <p className="text-sm text-gray-600">Create new adventure</p>
            </div>
          </Link>
          
          <Link
            to="/expenses"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">📊</span>
            <div>
              <p className="font-medium text-gray-900">View Reports</p>
              <p className="text-sm text-gray-600">Analyze spending</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;