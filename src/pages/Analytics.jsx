import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { expenseService } from '../services/expenseService';
import { EXPENSE_CATEGORIES } from '../constants/expenseCategories';

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    budgetVsActual: [],
    categoryBreakdown: [],
    spendingTrend: [],
    tripComparison: []
  });

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [trips, expenses] = await Promise.all([
        tripService.getTrips(user.uid),
        expenseService.getExpenses(user.uid)
      ]);

      // Budget vs Actual for each trip
      const budgetVsActual = trips.map(trip => {
        const tripExpenses = expenses.filter(expense => expense.tripId === trip.id);
        const totalSpent = tripExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        
        return {
          name: trip.name || 'Unnamed Trip',
          budget: trip.totalBudget || 0,
          spent: totalSpent,
          remaining: Math.max(0, (trip.totalBudget || 0) - totalSpent)
        };
      });

      // Category breakdown across all expenses
      const categoryTotals = {};
      expenses.forEach(expense => {
        const category = expense.category || 'other';
        categoryTotals[category] = (categoryTotals[category] || 0) + Number(expense.amount);
      });

      const categoryBreakdown = EXPENSE_CATEGORIES.map(category => {
        const amount = categoryTotals[category.id] || 0;
        return {
          name: category.label,
          value: amount,
          color: category.color.replace('bg-', '#').replace('-200', '80').replace('-300', 'a0')
        };
      }).filter(item => item.value > 0);

      // Spending trend by date (last 30 days)
      const last30Days = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        last30Days.push({
          date: date.toISOString().split('T')[0],
          amount: 0
        });
      }

      expenses.forEach(expense => {
        const expenseDate = expense.date;
        const dayIndex = last30Days.findIndex(day => day.date === expenseDate);
        if (dayIndex !== -1) {
          last30Days[dayIndex].amount += Number(expense.amount);
        }
      });

      const spendingTrend = last30Days.map(day => ({
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: day.amount
      }));

      // Trip comparison
      const tripComparison = trips.slice(0, 5).map(trip => {
        const tripExpenses = expenses.filter(expense => expense.tripId === trip.id);
        const totalSpent = tripExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        const budgetEfficiency = trip.totalBudget > 0 ? (totalSpent / trip.totalBudget) * 100 : 0;
        
        return {
          name: trip.name || 'Unnamed Trip',
          efficiency: Math.round(budgetEfficiency),
          spent: totalSpent,
          budget: trip.totalBudget || 0
        };
      });

      setAnalytics({
        budgetVsActual,
        categoryBreakdown,
        spendingTrend,
        tripComparison
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB'];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="animate-pulse space-y-6">
          {[1,2,3,4].map(n => (
            <div key={n} className="bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Insights into your travel spending</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Budget vs Actual */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Budget vs Actual Spending</h2>
          {analytics.budgetVsActual.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.budgetVsActual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, '']} />
                <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No trip data available
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
          {analytics.categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No expense data available
            </div>
          )}
        </div>

        {/* Spending Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Daily Spending Trend (Last 30 Days)</h2>
          {analytics.spendingTrend.some(day => day.amount > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No recent spending data available
            </div>
          )}
        </div>

        {/* Trip Budget Efficiency */}
        <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Trip Budget Efficiency</h2>
          {analytics.tripComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.tripComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'efficiency' ? `${value}%` : `$${value.toFixed(2)}`,
                    name === 'efficiency' ? 'Budget Used' : name === 'spent' ? 'Spent' : 'Budget'
                  ]} 
                />
                <Bar dataKey="efficiency" fill="#ff7c7c" name="Budget Used %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No trip comparison data available
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Total Trips</h3>
          <p className="text-2xl font-bold text-blue-600">{analytics.budgetVsActual.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Total Budget</h3>
          <p className="text-2xl font-bold text-green-600">
            ${analytics.budgetVsActual.reduce((sum, trip) => sum + trip.budget, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Total Spent</h3>
          <p className="text-2xl font-bold text-orange-600">
            ${analytics.budgetVsActual.reduce((sum, trip) => sum + trip.spent, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Average Efficiency</h3>
          <p className="text-2xl font-bold text-purple-600">
            {analytics.tripComparison.length > 0 
              ? Math.round(analytics.tripComparison.reduce((sum, trip) => sum + trip.efficiency, 0) / analytics.tripComparison.length)
              : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}