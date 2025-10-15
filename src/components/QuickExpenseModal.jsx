import { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES } from '../constants/expenseCategories';

export default function QuickExpenseModal({ isOpen, onClose, onSubmit, initialData }) {
  const [expense, setExpense] = useState({
    amount: '',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && initialData) {
      setExpense(initialData);
    } else if (isOpen) {
      setExpense({
        amount: '',
        category: 'food',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...expense,
      amount: parseFloat(expense.amount)
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white p-6 rounded-lg w-full max-w-md modal-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Quick Expense</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Category</label>
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
            <label className="block mb-1 text-sm font-medium">Description</label>
            <input
              type="text"
              value={expense.description}
              onChange={(e) => setExpense({...expense, description: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter expense description"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Date</label>
            <input
              type="date"
              value={expense.date}
              onChange={(e) => setExpense({...expense, date: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}