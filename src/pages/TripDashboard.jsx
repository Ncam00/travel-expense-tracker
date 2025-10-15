import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EXPENSE_CATEGORIES, getCategoryById } from '../constants/expenseCategories';
import { tripService } from '../services/tripService';
import { expenseService } from '../services/expenseService';
import QuickExpenseModal from '../components/QuickExpenseModal';

export default function TripDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tripStats, setTripStats] = useState({
    totalSpent: 0,
    budgetRemaining: 5000,
    expensesByCategory: {}
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [stats, recent] = await Promise.all([
          getTripStats(user.uid),
          getRecentExpenses(user.uid, 5) // Get last 5 expenses
        ]);
        setTripStats(stats);
        setRecentExpenses(recent);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const handleQuickExpense = async (expenseData) => {
    try {
      await addExpense(user.uid, expenseData);
      // Refresh both stats and recent expenses
      const [newStats, newRecent] = await Promise.all([
        getTripStats(user.uid),
        getRecentExpenses(user.uid, 5)
      ]);
      setTripStats(newStats);
      setRecentExpenses(newRecent);
    } catch (err) {
      setError('Failed to add expense');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header with Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your travel expenses and budget</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/trips"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Manage Trips
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Budget Overview Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm col-span-full">
          <h2 className="text-xl font-semibold mb-4">Budget Overview</h2>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-2xl font-bold">${tripStats.budgetRemaining.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold">${tripStats.totalSpent.toFixed(2)}</p>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full rounded-full"
              style={{ width: `${(tripStats.totalSpent / 5000) * 100}%`, backgroundColor: '#4caf50' }}
            ></div>
          </div>
        </div>

        {/* Quick Add Expense Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Quick Add Expense</h2>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Add Expense
          </button>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentExpenses.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity</p>
            ) : (
              recentExpenses.map((expense) => {
                const category = getCategoryById(expense.category);
                return (
                  <div key={expense.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <span className="font-medium">{expense.description}</span>
                      <div className="text-sm text-gray-500 flex items-center">
                        <span>{category.icon}</span>
                        <span className="ml-1">{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className="font-medium">${Number(expense.amount).toFixed(2)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Category Breakdown Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm col-span-full">
          <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {EXPENSE_CATEGORIES.map(category => {
              const amount = tripStats.expensesByCategory[category.id] || 0;
              const percentage = tripStats.totalSpent ? 
                ((amount / tripStats.totalSpent) * 100).toFixed(1) : 0;
              
              return (
                <div 
                  key={category.id}
                  className={`p-4 rounded-lg ${category.color}`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{category.icon}</span>
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <p className="text-xl font-semibold mt-2">
                    ${amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <QuickExpenseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleQuickExpense}
      />
    </div>
  );
}