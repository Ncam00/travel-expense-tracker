import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { db } from '../config/firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';

export default function TripPlanningPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('location');
  const [saving, setSaving] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);

  // Trip location data
  const [tripLocation, setTripLocation] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    description: ''
  });

  // Shopping list
  const [shoppingList, setShoppingList] = useState([]);
  const [newShoppingItem, setNewShoppingItem] = useState({ item: '', category: 'essentials', completed: false });

  // Restaurant list
  const [restaurantList, setRestaurantList] = useState([]);
  const [newRestaurant, setNewRestaurant] = useState({ name: '', cuisine: '', notes: '', priority: 'medium' });

  // Expenses (placeholder for future integration)
  const [expenseCategories, setExpenseCategories] = useState([
    { name: 'Accommodation', budgetAmount: 0, actualAmount: 0 },
    { name: 'Transportation', budgetAmount: 0, actualAmount: 0 },
    { name: 'Food & Dining', budgetAmount: 0, actualAmount: 0 },
    { name: 'Activities', budgetAmount: 0, actualAmount: 0 },
    { name: 'Shopping', budgetAmount: 0, actualAmount: 0 },
    { name: 'Other', budgetAmount: 0, actualAmount: 0 }
  ]);

  const sections = [
    { key: 'location', label: 'Location', icon: '📍', description: 'Set your trip destination and details' },
    { key: 'shopping', label: 'Shopping', icon: '🛍️', description: 'Plan what you want to buy' },
    { key: 'restaurant', label: 'Restaurant', icon: '🍽️', description: 'List restaurants you want to try' },
    { key: 'expense', label: 'Expense', icon: '💰', description: 'Budget and expense planning' }
  ];

  const saveTripData = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const tripData = {
        ...tripLocation,
        shopping: shoppingList,
        restaurants: restaurantList,
        expenseCategories: expenseCategories,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'planning' // planning, active, completed
      };

      if (currentTrip) {
        // Update existing trip
        const tripRef = doc(db, 'trips', currentTrip.id);
        await updateDoc(tripRef, { ...tripData, updatedAt: new Date() });
      } else {
        // Create new trip
        const docRef = await addDoc(collection(db, 'trips'), tripData);
        setCurrentTrip({ id: docRef.id, ...tripData });
      }

      alert('Trip saved successfully!');
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Failed to save trip. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addShoppingItem = () => {
    if (!newShoppingItem.item.trim()) return;
    
    const item = {
      ...newShoppingItem,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    setShoppingList([...shoppingList, item]);
    setNewShoppingItem({ item: '', category: 'essentials', completed: false });
  };

  const toggleShoppingItem = (itemId) => {
    setShoppingList(shoppingList.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteShoppingItem = (itemId) => {
    setShoppingList(shoppingList.filter(item => item.id !== itemId));
  };

  const addRestaurant = () => {
    if (!newRestaurant.name.trim()) return;
    
    const restaurant = {
      ...newRestaurant,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    setRestaurantList([...restaurantList, restaurant]);
    setNewRestaurant({ name: '', cuisine: '', notes: '', priority: 'medium' });
  };

  const deleteRestaurant = (restaurantId) => {
    setRestaurantList(restaurantList.filter(restaurant => restaurant.id !== restaurantId));
  };

  const updateExpenseCategory = (index, field, value) => {
    const updated = [...expenseCategories];
    updated[index][field] = parseFloat(value) || 0;
    setExpenseCategories(updated);
  };

  const renderLocationSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📍 Trip Location & Details</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trip Name</label>
          <input
            type="text"
            value={tripLocation.name}
            onChange={(e) => setTripLocation({ ...tripLocation, name: e.target.value })}
            placeholder="e.g., Summer Europe Adventure"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
          <input
            type="text"
            value={tripLocation.destination}
            onChange={(e) => setTripLocation({ ...tripLocation, destination: e.target.value })}
            placeholder="e.g., Paris, France"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={tripLocation.startDate}
            onChange={(e) => setTripLocation({ ...tripLocation, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={tripLocation.endDate}
            onChange={(e) => setTripLocation({ ...tripLocation, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget</label>
          <input
            type="number"
            value={tripLocation.budget}
            onChange={(e) => setTripLocation({ ...tripLocation, budget: e.target.value })}
            placeholder="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={tripLocation.description}
          onChange={(e) => setTripLocation({ ...tripLocation, description: e.target.value })}
          placeholder="Describe your trip plans, goals, or special notes..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderShoppingSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🛍️ Shopping List</h2>
      
      {/* Add Shopping Item Form */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid md:grid-cols-3 gap-4 mb-3">
          <input
            type="text"
            value={newShoppingItem.item}
            onChange={(e) => setNewShoppingItem({ ...newShoppingItem, item: e.target.value })}
            placeholder="Item to buy"
            className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && addShoppingItem()}
          />
          <select
            value={newShoppingItem.category}
            onChange={(e) => setNewShoppingItem({ ...newShoppingItem, category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="essentials">Essentials</option>
            <option value="clothing">Clothing</option>
            <option value="souvenirs">Souvenirs</option>
            <option value="gifts">Gifts</option>
            <option value="electronics">Electronics</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button
          onClick={addShoppingItem}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ➕ Add Item
        </button>
      </div>

      {/* Shopping List */}
      <div className="space-y-3">
        {shoppingList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🛍️</div>
            <p>No shopping items yet. Add items you want to buy during your trip!</p>
          </div>
        ) : (
          shoppingList.map(item => (
            <div key={item.id} className={`flex items-center gap-3 p-3 border rounded-lg ${item.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleShoppingItem(item.id)}
                className="w-5 h-5 rounded border-gray-300"
              />
              <div className="flex-1">
                <span className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {item.item}
                </span>
                <span className="text-sm text-gray-500 ml-2">({item.category})</span>
              </div>
              <button
                onClick={() => deleteShoppingItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderRestaurantSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🍽️ Restaurant Wishlist</h2>
      
      {/* Add Restaurant Form */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid md:grid-cols-2 gap-4 mb-3">
          <input
            type="text"
            value={newRestaurant.name}
            onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
            placeholder="Restaurant name"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            value={newRestaurant.cuisine}
            onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })}
            placeholder="Cuisine type"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="grid md:grid-cols-4 gap-4 mb-3">
          <textarea
            value={newRestaurant.notes}
            onChange={(e) => setNewRestaurant({ ...newRestaurant, notes: e.target.value })}
            placeholder="Notes, must-try dishes, location..."
            className="md:col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
          />
          <select
            value={newRestaurant.priority}
            onChange={(e) => setNewRestaurant({ ...newRestaurant, priority: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        <button
          onClick={addRestaurant}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ➕ Add Restaurant
        </button>
      </div>

      {/* Restaurant List */}
      <div className="grid md:grid-cols-2 gap-4">
        {restaurantList.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🍽️</div>
            <p>No restaurants added yet. Add places you want to dine during your trip!</p>
          </div>
        ) : (
          restaurantList.map(restaurant => (
            <div key={restaurant.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                  {restaurant.cuisine && <p className="text-sm text-gray-600">{restaurant.cuisine}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    restaurant.priority === 'high' ? 'bg-red-100 text-red-700' :
                    restaurant.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {restaurant.priority}
                  </span>
                  <button
                    onClick={() => deleteRestaurant(restaurant.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {restaurant.notes && (
                <p className="text-sm text-gray-600 mt-2">{restaurant.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderExpenseSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">💰 Expense Planning</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-600">💡</span>
          <h3 className="font-semibold text-blue-900">Budget Planning</h3>
        </div>
        <p className="text-blue-700 text-sm">
          Set your planned budget for each category. This will help you track expenses during your trip.
        </p>
      </div>

      <div className="grid gap-4">
        {expenseCategories.map((category, index) => (
          <div key={category.name} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Planned Budget</label>
                <input
                  type="number"
                  value={category.budgetAmount}
                  onChange={(e) => updateExpenseCategory(index, 'budgetAmount', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Spent</label>
                <input
                  type="number"
                  value={category.actualAmount}
                  onChange={(e) => updateExpenseCategory(index, 'actualAmount', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  readOnly
                  title="This will be automatically updated when you add expenses during your trip"
                />
              </div>
            </div>
            {category.budgetAmount > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{((category.actualAmount / category.budgetAmount) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      category.actualAmount > category.budgetAmount ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((category.actualAmount / category.budgetAmount) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Total Budget Summary</h3>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Planned</p>
            <p className="text-2xl font-bold text-blue-600">
              ${expenseCategories.reduce((sum, cat) => sum + cat.budgetAmount, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-2xl font-bold text-green-600">
              ${expenseCategories.reduce((sum, cat) => sum + cat.actualAmount, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Remaining</p>
            <p className={`text-2xl font-bold ${
              expenseCategories.reduce((sum, cat) => sum + cat.budgetAmount, 0) - 
              expenseCategories.reduce((sum, cat) => sum + cat.actualAmount, 0) >= 0 
              ? 'text-green-600' : 'text-red-600'
            }`}>
              ${(expenseCategories.reduce((sum, cat) => sum + cat.budgetAmount, 0) - 
                expenseCategories.reduce((sum, cat) => sum + cat.actualAmount, 0)).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'location': return renderLocationSection();
      case 'shopping': return renderShoppingSection();
      case 'restaurant': return renderRestaurantSection();
      case 'expense': return renderExpenseSection();
      default: return renderLocationSection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🗺️ Trip Planning</h1>
          <p className="text-gray-600">Plan your perfect trip with locations, shopping, dining, and budget management</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-6">
              <h2 className="font-semibold text-gray-900 mb-4">Planning Sections</h2>
              <nav className="space-y-2">
                {sections.map(section => (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeSection === section.key
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{section.icon}</span>
                      <div>
                        <div className="font-medium">{section.label}</div>
                        <div className={`text-xs ${
                          activeSection === section.key ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {section.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Save Button */}
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={saveTripData}
                  disabled={saving}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                    saving
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {saving ? '💾 Saving...' : '💾 Save Trip'}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}