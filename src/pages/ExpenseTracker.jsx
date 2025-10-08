import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addExpense, getUserExpenses } from '../services/expenseService';
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

  useEffect(() => {
    loadExpenses();
  }, [user]);

  const loadExpenses = async () => {
    try {
      const userExpenses = await getUserExpenses(user.uid);
      setExpenses(userExpenses);
    } catch (err) {
      setError('Failed to load expenses');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await addExpense(user.uid, expense);
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Track Expenses</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block mb-1">Amount</label>
          <input
            type="number"
            value={expense.amount}
            onChange={(e) => setExpense({...expense, amount: e.target.value})}
            className="w-full border rounded px-3 py-2"
            required
          />
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
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
        <div className="space-y-4">
          {expenses.map((exp) => {
            const category = EXPENSE_CATEGORIES.find(c => c.id === exp.category);
            return (
              <div key={exp.id} className="border rounded p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{exp.description}</span>
                    <span className="ml-2 text-gray-500">
                      {category?.icon} {category?.label}
                    </span>
                  </div>
                  <span className="text-green-600">${exp.amount}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(exp.date).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}