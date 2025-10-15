import { useState, useEffect } from 'react';
import { createTrip, updateTrip } from '../services/tripService';
import { useAuth } from '../context/AuthContext';

export default function TripModal({ isOpen, onClose, onSubmit, trip = null }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [tripData, setTripData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    currency: 'USD',
    description: '',
    isCompleted: false
  });

  // Reset form when modal opens/closes or trip changes
  useEffect(() => {
    if (isOpen) {
      if (trip) {
        // Edit mode - populate with existing trip data
        setTripData({
          name: trip.name || '',
          destination: trip.destination || '',
          startDate: trip.startDate ? trip.startDate.split('T')[0] : '',
          endDate: trip.endDate ? trip.endDate.split('T')[0] : '',
          totalBudget: trip.totalBudget || '',
          currency: trip.currency || 'USD',
          description: trip.description || '',
          isCompleted: trip.isCompleted || false
        });
      } else {
        // Create mode - reset form
        setTripData({
          name: '',
          destination: '',
          startDate: '',
          endDate: '',
          totalBudget: '',
          currency: 'USD',
          description: '',
          isCompleted: false
        });
      }
      setError('');
    }
  }, [isOpen, trip]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (new Date(tripData.endDate) <= new Date(tripData.startDate)) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    if (parseFloat(tripData.totalBudget) <= 0) {
      setError('Budget must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const tripDataToSubmit = {
        ...tripData,
        totalBudget: parseFloat(tripData.totalBudget),
        startDate: new Date(tripData.startDate).toISOString(),
        endDate: new Date(tripData.endDate).toISOString()
      };

      if (trip) {
        // Update existing trip
        await updateTrip(trip.id, tripDataToSubmit);
      } else {
        // Create new trip
        await createTrip(user.uid, tripDataToSubmit);
      }

      onSubmit && onSubmit();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl modal-content max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {trip ? 'Edit Trip' : 'Create New Trip'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Trip Name *</label>
              <input
                type="text"
                value={tripData.name}
                onChange={(e) => setTripData({...tripData, name: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Summer Europe Trip"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Destination *</label>
              <input
                type="text"
                value={tripData.destination}
                onChange={(e) => setTripData({...tripData, destination: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Paris, France"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Start Date *</label>
              <input
                type="date"
                value={tripData.startDate}
                onChange={(e) => setTripData({...tripData, startDate: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">End Date *</label>
              <input
                type="date"
                value={tripData.endDate}
                onChange={(e) => setTripData({...tripData, endDate: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Total Budget *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">
                  {currencies.find(c => c.code === tripData.currency)?.symbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tripData.totalBudget}
                  onChange={(e) => setTripData({...tripData, totalBudget: e.target.value})}
                  className="w-full border rounded px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Currency</label>
              <select
                value={tripData.currency}
                onChange={(e) => setTripData({...tripData, currency: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Description</label>
            <textarea
              value={tripData.description}
              onChange={(e) => setTripData({...tripData, description: e.target.value})}
              className="w-full border rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add notes about your trip..."
            />
          </div>

          {trip && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isCompleted"
                checked={tripData.isCompleted}
                onChange={(e) => setTripData({...tripData, isCompleted: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="isCompleted" className="text-sm font-medium">
                Mark trip as completed
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 border rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : (trip ? 'Update Trip' : 'Create Trip')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}