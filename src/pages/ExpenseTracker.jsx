import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addExpense, getUserExpenses, deleteExpense } from '../services/expenseService';
import { EXPENSE_CATEGORIES } from '../constants/expenseCategories';

export default function ExpenseTracker() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [expense, setExpense] = useState({
    amount: '',
    description: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadExpenses();
  }, [user]);

  const loadExpenses = async () => {
    try {
      const userExpenses = await getUserExpenses(user.uid);
      setExpenses(userExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      setError('Failed to load expenses');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addExpense(user.uid, {
        ...expense,
        amount: parseFloat(expense.amount)
      });
      setExpense({
        amount: '',
        description: '',
        category: 'food',
        date: new Date().toISOString().split('T')[0]
      });
      await loadExpenses();
    } catch (err) {
      setError('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await deleteExpense(expenseId);
      await loadExpenses();
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  const filteredExpenses = expenses.filter(exp => 
    filter === 'all' ? true : exp.category === filter
  );

  const totalAmount = filteredExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount), 
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Track Expenses</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-blue-600">
            ${totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={expense.amount}
                  onChange={(e) => setExpense({...expense, amount: e.target.value})}
                  className="w-full border rounded px-3 py-2 pl-7"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Category</label>
              <select
                value={expense.category}
                onChange={(e) => setExpense({...expense, category: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                {EXPENSE_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Description</label>
              <input
                type="text"
                value={expense.description}
                onChange={(e) => setExpense({...expense, description: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Date</label>
              <input
                type="date"
                value={expense.date}
                onChange={(e) => setExpense({...expense, date: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Expenses</h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">All Categories</option>
                {EXPENSE_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredExpenses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No expenses found.</p>
              ) : (
                filteredExpenses.map((exp) => {
                  const category = EXPENSE_CATEGORIES.find(c => c.id === exp.category);
                  return (
                    <div key={exp.id} className="border rounded p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{exp.description}</span>
                          <span className="ml-2 text-gray-500">
                            {category?.icon} {category?.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600">${Number(exp.amount).toFixed(2)}</span>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(exp.date).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}