import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { db } from '../config/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export default function TripPlanningPage() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activities');
  const [saving, setSaving] = useState(false);

  // Form states for each category
  const [newActivity, setNewActivity] = useState({ title: '', description: '', priority: 'medium', completed: false });
  const [newRestaurant, setNewRestaurant] = useState({ name: '', cuisine: '', notes: '', mustTry: false });
  const [newShoppingItem, setNewShoppingItem] = useState({ item: '', category: 'souvenirs', purchased: false });
  const [newPlace, setNewPlace] = useState({ name: '', type: '', notes: '', visited: false });
  const [newPackingItem, setNewPackingItem] = useState({ item: '', category: 'essentials', packed: false });
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    loadTrip();
  }, [tripId, user]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const tripData = await tripService.getTripById(tripId);
      
      // Initialize planning data structures if they don't exist
      tripData.planning = {
        activities: [...tripData.planning.activities],
        restaurants: [...tripData.planning.restaurants],
        shopping: [...tripData.planning.shopping],
        places: [...tripData.planning.places],
        packing: [...tripData.planning.packing],
        notes: [...tripData.planning.notes]
      };
      
      setTrip(tripData);
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTripPlanning = async (field, value) => {
    try {
      setSaving(true);
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        [`planning.${field}`]: value
      });
      await loadTrip();
    } catch (error) {
      console.error('Error updating trip planning:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addActivity = async () => {
    if (!newActivity.title.trim()) return;
    
    const activity = {
      ...newActivity,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    await updateTripPlanning('activities', [...(trip.planning.activities || []), activity]);
    setNewActivity({ title: '', description: '', priority: 'medium', completed: false });
  };

  const toggleActivityComplete = async (activityId) => {
    const updated = trip.planning.activities.map(a =>
      a.id === activityId ? { ...a, completed: !a.completed } : a
    );
    await updateTripPlanning('activities', updated);
  };

  const deleteActivity = async (activityId) => {
    const updated = trip.planning.activities.filter(a => a.id !== activityId);
    await updateTripPlanning('activities', updated);
  };

  const addRestaurant = async () => {
    if (!newRestaurant.name.trim()) return;
    
    const restaurant = {
      ...newRestaurant,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    await updateTripPlanning('restaurants', [...(trip.planning.restaurants || []), restaurant]);
    setNewRestaurant({ name: '', cuisine: '', notes: '', mustTry: false });
  };

  const deleteRestaurant = async (restaurantId) => {
    const updated = trip.planning.restaurants.filter(r => r.id !== restaurantId);
    await updateTripPlanning('restaurants', updated);
  };

  const addShoppingItem = async () => {
    if (!newShoppingItem.item.trim()) return;
    
    const item = {
      ...newShoppingItem,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    await updateTripPlanning('shopping', [...(trip.planning.shopping || []), item]);
    setNewShoppingItem({ item: '', category: 'souvenirs', purchased: false });
  };

  const toggleShoppingPurchased = async (itemId) => {
    const updated = trip.planning.shopping.map(i =>
      i.id === itemId ? { ...i, purchased: !i.purchased } : i
    );
    await updateTripPlanning('shopping', updated);
  };

  const deleteShoppingItem = async (itemId) => {
    const updated = trip.planning.shopping.filter(i => i.id !== itemId);
    await updateTripPlanning('shopping', updated);
  };

  const addPlace = async () => {
    if (!newPlace.name.trim()) return;
    
    const place = {
      ...newPlace,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    await updateTripPlanning('places', [...(trip.planning.places || []), place]);
    setNewPlace({ name: '', type: '', notes: '', visited: false });
  };

  const togglePlaceVisited = async (placeId) => {
    const updated = trip.planning.places.map(p =>
      p.id === placeId ? { ...p, visited: !p.visited } : p
    );
    await updateTripPlanning('places', updated);
  };

  const deletePlace = async (placeId) => {
    const updated = trip.planning.places.filter(p => p.id !== placeId);
    await updateTripPlanning('places', updated);
  };

  const addPackingItem = async () => {
    if (!newPackingItem.item.trim()) return;
    
    const item = {
      ...newPackingItem,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    await updateTripPlanning('packing', [...(trip.planning.packing || []), item]);
    setNewPackingItem({ item: '', category: 'essentials', packed: false });
  };

  const togglePackingPacked = async (itemId) => {
    const updated = trip.planning.packing.map(i =>
      i.id === itemId ? { ...i, packed: !i.packed } : i
    );
    await updateTripPlanning('packing', updated);
  };

  const deletePackingItem = async (itemId) => {
    const updated = trip.planning.packing.filter(i => i.id !== itemId);
    await updateTripPlanning('packing', updated);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    const note = {
      text: newNote,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    await updateTripPlanning('notes', [...(trip.planning.notes || []), note]);
    setNewNote('');
  };

  const deleteNote = async (noteId) => {
    const updated = trip.planning.notes.filter(n => n.id !== noteId);
    await updateTripPlanning('notes', updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🗺️</div>
          <p className="text-gray-600">Loading trip planning...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Not Found</h2>
          <button onClick={() => navigate('/trips')} className="btn-primary">
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'activities', label: 'Activities & Ideas', icon: '🎯', count: trip.planning.activities?.length || 0 },
    { key: 'restaurants', label: 'Restaurants', icon: '🍽️', count: trip.planning.restaurants?.length || 0 },
    { key: 'shopping', label: 'Shopping', icon: '🛍️', count: trip.planning.shopping?.length || 0 },
    { key: 'places', label: 'Places to Visit', icon: '📍', count: trip.planning.places?.length || 0 },
    { key: 'packing', label: 'Packing List', icon: '🎒', count: trip.planning.packing?.length || 0 },
    { key: 'notes', label: 'Notes', icon: '📝', count: trip.planning.notes?.length || 0 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/trips')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2 text-sm"
          >
            ← Back to Trips
          </button>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🗺️</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Plan your perfect trip with activities, dining, and more
                </p>
              </div>
            </div>
            
            {saving && (
              <div className="mt-4 text-sm text-blue-600 flex items-center gap-2">
                <div className="animate-spin">⏳</div>
                Saving...
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max bg-white rounded-xl p-2 shadow-sm border">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-white/30' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {activeTab === 'activities' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Activities & Things to Do</h2>
              
              {/* Add Activity Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <input
                    type="text"
                    placeholder="Activity title (e.g., Visit Eiffel Tower)"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    className="input-field"
                    onKeyPress={(e) => e.key === 'Enter' && addActivity()}
                  />
                  <select
                    value={newActivity.priority}
                    onChange={(e) => setNewActivity({ ...newActivity, priority: e.target.value })}
                    className="input-field"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <textarea
                  placeholder="Description, notes, or details..."
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  className="input-field w-full mb-3"
                  rows={2}
                />
                <button onClick={addActivity} className="btn-primary w-full sm:w-auto">
                  ➕ Add Activity
                </button>
              </div>

              {/* Activities List */}
              <div className="space-y-3">
                {trip.planning.activities?.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-6xl block mb-4">🎯</span>
                    <p>No activities planned yet. Add your first activity above!</p>
                  </div>
                ) : (
                  trip.planning.activities?.map(activity => (
                    <div
                      key={activity.id}
                      className={`border rounded-lg p-4 transition-all ${
                        activity.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={activity.completed}
                          onChange={() => toggleActivityComplete(activity.id)}
                          className="mt-1 w-5 h-5 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`font-semibold ${activity.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {activity.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                activity.priority === 'high' ? 'bg-red-100 text-red-700' :
                                activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {activity.priority}
                              </span>
                              <button
                                onClick={() => deleteActivity(activity.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'restaurants' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🍽️ Restaurants & Food</h2>
              
              {/* Add Restaurant Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <input
                    type="text"
                    placeholder="Restaurant name"
                    value={newRestaurant.name}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                    className="input-field"
                    onKeyPress={(e) => e.key === 'Enter' && addRestaurant()}
                  />
                  <input
                    type="text"
                    placeholder="Cuisine type (e.g., Italian, Thai)"
                    value={newRestaurant.cuisine}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })}
                    className="input-field"
                  />
                </div>
                <textarea
                  placeholder="Notes, must-try dishes, location..."
                  value={newRestaurant.notes}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, notes: e.target.value })}
                  className="input-field w-full mb-3"
                  rows={2}
                />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRestaurant.mustTry}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, mustTry: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">⭐ Must Try</span>
                  </label>
                  <button onClick={addRestaurant} className="btn-primary ml-auto">
                    ➕ Add Restaurant
                  </button>
                </div>
              </div>

              {/* Restaurants List */}
              <div className="grid md:grid-cols-2 gap-4">
                {trip.planning.restaurants?.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    <span className="text-6xl block mb-4">🍽️</span>
                    <p>No restaurants added yet. Start building your food list!</p>
                  </div>
                ) : (
                  trip.planning.restaurants?.map(restaurant => (
                    <div
                      key={restaurant.id}
                      className={`border rounded-lg p-4 ${
                        restaurant.mustTry ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {restaurant.name}
                            {restaurant.mustTry && <span className="text-yellow-500">⭐</span>}
                          </h3>
                          {restaurant.cuisine && (
                            <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteRestaurant(restaurant.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                      {restaurant.notes && (
                        <p className="text-sm text-gray-600 mt-2">{restaurant.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'shopping' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🛍️ Shopping List</h2>
              
              {/* Add Shopping Item Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid md:grid-cols-3 gap-4 mb-3">
                  <input
                    type="text"
                    placeholder="Item to buy"
                    value={newShoppingItem.item}
                    onChange={(e) => setNewShoppingItem({ ...newShoppingItem, item: e.target.value })}
                    className="input-field md:col-span-2"
                    onKeyPress={(e) => e.key === 'Enter' && addShoppingItem()}
                  />
                  <select
                    value={newShoppingItem.category}
                    onChange={(e) => setNewShoppingItem({ ...newShoppingItem, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="souvenirs">Souvenirs</option>
                    <option value="gifts">Gifts</option>
                    <option value="clothing">Clothing</option>
                    <option value="accessories">Accessories</option>
                    <option value="food">Food & Snacks</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button onClick={addShoppingItem} className="btn-primary w-full sm:w-auto">
                  ➕ Add Item
                </button>
              </div>

              {/* Shopping List */}
              <div className="grid md:grid-cols-3 gap-4">
                {trip.planning.shopping?.length === 0 ? (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    <span className="text-6xl block mb-4">🛍️</span>
                    <p>No shopping items yet. Add what you'd like to buy!</p>
                  </div>
                ) : (
                  trip.planning.shopping?.map(item => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 transition-all ${
                        item.purchased ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.purchased}
                          onChange={() => toggleShoppingPurchased(item.id)}
                          className="w-5 h-5 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${item.purchased ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item.item}
                          </p>
                          <span className="text-xs text-gray-500">{item.category}</span>
                        </div>
                        <button
                          onClick={() => deleteShoppingItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'places' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📍 Places to Visit</h2>
              
              {/* Add Place Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <input
                    type="text"
                    placeholder="Place name (e.g., Louvre Museum)"
                    value={newPlace.name}
                    onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                    className="input-field"
                    onKeyPress={(e) => e.key === 'Enter' && addPlace()}
                  />
                  <input
                    type="text"
                    placeholder="Type (Museum, Park, Landmark, etc.)"
                    value={newPlace.type}
                    onChange={(e) => setNewPlace({ ...newPlace, type: e.target.value })}
                    className="input-field"
                  />
                </div>
                <textarea
                  placeholder="Notes, opening hours, tips..."
                  value={newPlace.notes}
                  onChange={(e) => setNewPlace({ ...newPlace, notes: e.target.value })}
                  className="input-field w-full mb-3"
                  rows={2}
                />
                <button onClick={addPlace} className="btn-primary w-full sm:w-auto">
                  ➕ Add Place
                </button>
              </div>

              {/* Places List */}
              <div className="grid md:grid-cols-2 gap-4">
                {trip.planning.places?.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    <span className="text-6xl block mb-4">📍</span>
                    <p>No places added yet. Add landmarks and attractions!</p>
                  </div>
                ) : (
                  trip.planning.places?.map(place => (
                    <div
                      key={place.id}
                      className={`border rounded-lg p-4 transition-all ${
                        place.visited ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={place.visited}
                          onChange={() => togglePlaceVisited(place.id)}
                          className="mt-1 w-5 h-5 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className={`font-semibold ${place.visited ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {place.name}
                              </h3>
                              {place.type && (
                                <p className="text-xs text-gray-600">{place.type}</p>
                              )}
                            </div>
                            <button
                              onClick={() => deletePlace(place.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                          {place.notes && (
                            <p className="text-sm text-gray-600 mt-2">{place.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'packing' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🎒 Packing List</h2>
              
              {/* Add Packing Item Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid md:grid-cols-3 gap-4 mb-3">
                  <input
                    type="text"
                    placeholder="Item to pack"
                    value={newPackingItem.item}
                    onChange={(e) => setNewPackingItem({ ...newPackingItem, item: e.target.value })}
                    className="input-field md:col-span-2"
                    onKeyPress={(e) => e.key === 'Enter' && addPackingItem()}
                  />
                  <select
                    value={newPackingItem.category}
                    onChange={(e) => setNewPackingItem({ ...newPackingItem, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="essentials">Essentials</option>
                    <option value="clothing">Clothing</option>
                    <option value="toiletries">Toiletries</option>
                    <option value="electronics">Electronics</option>
                    <option value="documents">Documents</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button onClick={addPackingItem} className="btn-primary w-full sm:w-auto">
                  ➕ Add Item
                </button>
              </div>

              {/* Packing List by Category */}
              <div className="space-y-6">
                {trip.planning.packing?.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-6xl block mb-4">🎒</span>
                    <p>No packing items yet. Start your packing list!</p>
                  </div>
                ) : (
                  ['essentials', 'clothing', 'toiletries', 'electronics', 'documents', 'other'].map(category => {
                    const items = trip.planning.packing?.filter(i => i.category === category) || [];
                    if (items.length === 0) return null;
                    
                    const packed = items.filter(i => i.packed).length;
                    const total = items.length;
                    
                    return (
                      <div key={category} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-gray-900 capitalize">{category}</h3>
                          <span className="text-sm text-gray-600">{packed}/{total} packed</span>
                        </div>
                        <div className="space-y-2">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={item.packed}
                                onChange={() => togglePackingPacked(item.id)}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                              <span className={`flex-1 text-sm ${item.packed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {item.item}
                              </span>
                              <button
                                onClick={() => deletePackingItem(item.id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📝 General Notes</h2>
              
              {/* Add Note Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <textarea
                  placeholder="Add a note about your trip..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="input-field w-full mb-3"
                  rows={3}
                />
                <button onClick={addNote} className="btn-primary w-full sm:w-auto">
                  ➕ Add Note
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {trip.planning.notes?.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-6xl block mb-4">📝</span>
                    <p>No notes yet. Add important trip information!</p>
                  </div>
                ) : (
                  trip.planning.notes?.map(note => (
                    <div key={note.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start gap-3">
                        <p className="text-gray-700 flex-1">{note.text}</p>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
