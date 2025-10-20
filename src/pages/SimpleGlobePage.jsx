import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Globe3D from '../components/Globe3D';

export default function SimpleGlobePage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedTripData, setSelectedTripData] = useState(null);
  const [globeData, setGlobeData] = useState({ locations: [], routes: [] });
  const [timelineMode, setTimelineMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlanningPanel, setShowPlanningPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('activities');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('SimpleGlobePage mounted, user:', user);
  }, []);

  // Form states for each category
  const [newActivity, setNewActivity] = useState({ title: '', description: '', priority: 'medium', completed: false });
  const [newRestaurant, setNewRestaurant] = useState({ name: '', cuisine: '', notes: '', mustTry: false });
  const [newShoppingItem, setNewShoppingItem] = useState({ item: '', category: 'souvenirs', purchased: false });
  const [newPlace, setNewPlace] = useState({ name: '', type: '', notes: '', visited: false });
  const [newPackingItem, setNewPackingItem] = useState({ item: '', category: 'essentials', packed: false });
  const [newNote, setNewNote] = useState('');

  // Load user's real trips from Firebase
  useEffect(() => {
    if (user) {
      loadUserTrips();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const userTrips = await tripService.getTrips(user.uid);
      
      // Convert trip data to globe format
      const locations = [];
      const routes = [];
      
      userTrips.forEach(trip => {
        // Add main destination
        if (trip.destination && trip.latitude && trip.longitude) {
          locations.push({
            name: trip.destination,
            lat: trip.latitude,
            lng: trip.longitude,
            tripId: trip.id,
            tripName: trip.name,
            totalSpent: trip.totalSpent || 0,
            country: trip.country || ''
          });
        }
      });

      setTrips(userTrips);
      setGlobeData({ locations, routes });
    } catch (error) {
      console.error('Error loading trips:', error);
      setError('Failed to load trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Timeline animation
  useEffect(() => {
    if (isPlaying && timelineMode) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, timelineMode]);

  const handleLocationClick = async (location) => {
    setSelectedTrip(location.tripId);
    setShowPlanningPanel(true);
    
    // Load full trip data
    try {
      const tripData = await tripService.getTripById(location.tripId);
      
      // Initialize planning data structures if they don't exist
      if (!tripData.planning) {
        tripData.planning = {
          activities: [],
          restaurants: [],
          shopping: [],
          places: [],
          packing: [],
          notes: []
        };
      }
      
      setSelectedTripData(tripData);
    } catch (error) {
      console.error('Error loading trip data:', error);
    }
  };

  const updateTripPlanning = async (field, value) => {
    if (!selectedTripData) return;
    
    try {
      setSaving(true);
      const tripRef = doc(db, 'trips', selectedTripData.id);
      await updateDoc(tripRef, {
        [`planning.${field}`]: value
      });
      
      // Update local state
      setSelectedTripData({
        ...selectedTripData,
        planning: {
          ...selectedTripData.planning,
          [field]: value
        }
      });
    } catch (error) {
      console.error('Error updating trip planning:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Planning CRUD operations
  const addActivity = async () => {
    if (!newActivity.title.trim() || !selectedTripData) return;
    const activity = { ...newActivity, id: Date.now().toString(), createdAt: new Date() };
    await updateTripPlanning('activities', [...(selectedTripData.planning.activities || []), activity]);
    setNewActivity({ title: '', description: '', priority: 'medium', completed: false });
  };

  const toggleActivityComplete = async (activityId) => {
    const updated = selectedTripData.planning.activities.map(a =>
      a.id === activityId ? { ...a, completed: !a.completed } : a
    );
    await updateTripPlanning('activities', updated);
  };

  const deleteActivity = async (activityId) => {
    const updated = selectedTripData.planning.activities.filter(a => a.id !== activityId);
    await updateTripPlanning('activities', updated);
  };

  const addRestaurant = async () => {
    if (!newRestaurant.name.trim() || !selectedTripData) return;
    const restaurant = { ...newRestaurant, id: Date.now().toString(), createdAt: new Date() };
    await updateTripPlanning('restaurants', [...(selectedTripData.planning.restaurants || []), restaurant]);
    setNewRestaurant({ name: '', cuisine: '', notes: '', mustTry: false });
  };

  const deleteRestaurant = async (restaurantId) => {
    const updated = selectedTripData.planning.restaurants.filter(r => r.id !== restaurantId);
    await updateTripPlanning('restaurants', updated);
  };

  const addShoppingItem = async () => {
    if (!newShoppingItem.item.trim() || !selectedTripData) return;
    const item = { ...newShoppingItem, id: Date.now().toString(), createdAt: new Date() };
    await updateTripPlanning('shopping', [...(selectedTripData.planning.shopping || []), item]);
    setNewShoppingItem({ item: '', category: 'souvenirs', purchased: false });
  };

  const toggleShoppingPurchased = async (itemId) => {
    const updated = selectedTripData.planning.shopping.map(i =>
      i.id === itemId ? { ...i, purchased: !i.purchased } : i
    );
    await updateTripPlanning('shopping', updated);
  };

  const deleteShoppingItem = async (itemId) => {
    const updated = selectedTripData.planning.shopping.filter(i => i.id !== itemId);
    await updateTripPlanning('shopping', updated);
  };

  const addPlace = async () => {
    if (!newPlace.name.trim() || !selectedTripData) return;
    const place = { ...newPlace, id: Date.now().toString(), createdAt: new Date() };
    await updateTripPlanning('places', [...(selectedTripData.planning.places || []), place]);
    setNewPlace({ name: '', type: '', notes: '', visited: false });
  };

  const togglePlaceVisited = async (placeId) => {
    const updated = selectedTripData.planning.places.map(p =>
      p.id === placeId ? { ...p, visited: !p.visited } : p
    );
    await updateTripPlanning('places', updated);
  };

  const deletePlace = async (placeId) => {
    const updated = selectedTripData.planning.places.filter(p => p.id !== placeId);
    await updateTripPlanning('places', updated);
  };

  const addPackingItem = async () => {
    if (!newPackingItem.item.trim() || !selectedTripData) return;
    const item = { ...newPackingItem, id: Date.now().toString(), createdAt: new Date() };
    await updateTripPlanning('packing', [...(selectedTripData.planning.packing || []), item]);
    setNewPackingItem({ item: '', category: 'essentials', packed: false });
  };

  const togglePackingPacked = async (itemId) => {
    const updated = selectedTripData.planning.packing.map(i =>
      i.id === itemId ? { ...i, packed: !i.packed } : i
    );
    await updateTripPlanning('packing', updated);
  };

  const deletePackingItem = async (itemId) => {
    const updated = selectedTripData.planning.packing.filter(i => i.id !== itemId);
    await updateTripPlanning('packing', updated);
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedTripData) return;
    const note = { text: newNote, id: Date.now().toString(), createdAt: new Date() };
    await updateTripPlanning('notes', [...(selectedTripData.planning.notes || []), note]);
    setNewNote('');
  };

  const deleteNote = async (noteId) => {
    const updated = selectedTripData.planning.notes.filter(n => n.id !== noteId);
    await updateTripPlanning('notes', updated);
  };

  const renderTabContent = () => {
    if (!selectedTripData) return null;

    switch (activeTab) {
      case 'activities':
        return renderActivities();
      case 'restaurants':
        return renderRestaurants();
      case 'shopping':
        return renderShopping();
      case 'places':
        return renderPlaces();
      case 'packing':
        return renderPacking();
      case 'notes':
        return renderNotes();
      default:
        return null;
    }
  };

  const renderActivities = () => (
    <div>
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <input
          type="text"
          placeholder="Activity title"
          value={newActivity.title}
          onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-2"
          onKeyPress={(e) => e.key === 'Enter' && addActivity()}
        />
        <select
          value={newActivity.priority}
          onChange={(e) => setNewActivity({ ...newActivity, priority: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-2"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <textarea
          placeholder="Description..."
          value={newActivity.description}
          onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-2"
          rows={2}
        />
        <button onClick={addActivity} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          ➕ Add Activity
        </button>
      </div>
      <div className="space-y-2">
        {selectedTripData.planning.activities?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No activities yet</p>
        ) : (
          selectedTripData.planning.activities?.map(activity => (
            <div key={activity.id} className={`border rounded p-3 ${activity.completed ? 'bg-green-50' : 'bg-white'}`}>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={activity.completed}
                  onChange={() => toggleActivityComplete(activity.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className={`font-semibold ${activity.completed ? 'line-through text-gray-500' : ''}`}>
                      {activity.title}
                    </h4>
                    <button onClick={() => deleteActivity(activity.id)} className="text-red-500">🗑️</button>
                  </div>
                  {activity.description && <p className="text-sm text-gray-600">{activity.description}</p>}
                  <span className={`text-xs px-2 py-1 rounded ${
                    activity.priority === 'high' ? 'bg-red-100 text-red-700' :
                    activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {activity.priority}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderRestaurants = () => (
    <div>
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <input
          type="text"
          placeholder="Restaurant name"
          value={newRestaurant.name}
          onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <input
          type="text"
          placeholder="Cuisine type"
          value={newRestaurant.cuisine}
          onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <textarea
          placeholder="Notes..."
          value={newRestaurant.notes}
          onChange={(e) => setNewRestaurant({ ...newRestaurant, notes: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-2"
          rows={2}
        />
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={newRestaurant.mustTry}
            onChange={(e) => setNewRestaurant({ ...newRestaurant, mustTry: e.target.checked })}
          />
          <span className="text-sm">⭐ Must Try</span>
        </label>
        <button onClick={addRestaurant} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          ➕ Add Restaurant
        </button>
      </div>
      <div className="space-y-2">
        {selectedTripData.planning.restaurants?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No restaurants yet</p>
        ) : (
          selectedTripData.planning.restaurants?.map(restaurant => (
            <div key={restaurant.id} className={`border rounded p-3 ${restaurant.mustTry ? 'bg-yellow-50' : 'bg-white'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold flex items-center gap-1">
                    {restaurant.name}
                    {restaurant.mustTry && <span>⭐</span>}
                  </h4>
                  {restaurant.cuisine && <p className="text-sm text-gray-600">{restaurant.cuisine}</p>}
                  {restaurant.notes && <p className="text-sm text-gray-600 mt-1">{restaurant.notes}</p>}
                </div>
                <button onClick={() => deleteRestaurant(restaurant.id)} className="text-red-500">🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderShopping = () => (
    <div>
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <input
          type="text"
          placeholder="Item to buy"
          value={newShoppingItem.item}
          onChange={(e) => setNewShoppingItem({ ...newShoppingItem, item: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <select
          value={newShoppingItem.category}
          onChange={(e) => setNewShoppingItem({ ...newShoppingItem, category: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-2"
        >
          <option value="souvenirs">Souvenirs</option>
          <option value="gifts">Gifts</option>
          <option value="clothing">Clothing</option>
          <option value="accessories">Accessories</option>
          <option value="food">Food & Snacks</option>
          <option value="other">Other</option>
        </select>
        <button onClick={addShoppingItem} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          ➕ Add Item
        </button>
      </div>
      <div className="space-y-2">
        {selectedTripData.planning.shopping?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No shopping items yet</p>
        ) : (
          selectedTripData.planning.shopping?.map(item => (
            <div key={item.id} className={`border rounded p-3 flex items-center gap-2 ${item.purchased ? 'bg-green-50' : 'bg-white'}`}>
              <input
                type="checkbox"
                checked={item.purchased}
                onChange={() => toggleShoppingPurchased(item.id)}
              />
              <div className="flex-1">
                <span className={item.purchased ? 'line-through text-gray-500' : ''}>{item.item}</span>
                <span className="text-xs text-gray-500 ml-2">({item.category})</span>
              </div>
              <button onClick={() => deleteShoppingItem(item.id)} className="text-red-500">🗑️</button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderPlaces = () => (
    <div>
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <input
          type="text"
          placeholder="Place name"
          value={newPlace.name}
          onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <input
          type="text"
          placeholder="Type (Museum, Park, etc.)"
          value={newPlace.type}
          onChange={(e) => setNewPlace({ ...newPlace, type: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <textarea
          placeholder="Notes..."
          value={newPlace.notes}
          onChange={(e) => setNewPlace({ ...newPlace, notes: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-2"
          rows={2}
        />
        <button onClick={addPlace} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          ➕ Add Place
        </button>
      </div>
      <div className="space-y-2">
        {selectedTripData.planning.places?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No places yet</p>
        ) : (
          selectedTripData.planning.places?.map(place => (
            <div key={place.id} className={`border rounded p-3 ${place.visited ? 'bg-green-50' : 'bg-white'}`}>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={place.visited}
                  onChange={() => togglePlaceVisited(place.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className={`font-semibold ${place.visited ? 'line-through text-gray-500' : ''}`}>
                      {place.name}
                    </h4>
                    <button onClick={() => deletePlace(place.id)} className="text-red-500">🗑️</button>
                  </div>
                  {place.type && <p className="text-xs text-gray-600">{place.type}</p>}
                  {place.notes && <p className="text-sm text-gray-600 mt-1">{place.notes}</p>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderPacking = () => (
    <div>
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <input
          type="text"
          placeholder="Item to pack"
          value={newPackingItem.item}
          onChange={(e) => setNewPackingItem({ ...newPackingItem, item: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <select
          value={newPackingItem.category}
          onChange={(e) => setNewPackingItem({ ...newPackingItem, category: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-2"
        >
          <option value="essentials">Essentials</option>
          <option value="clothing">Clothing</option>
          <option value="toiletries">Toiletries</option>
          <option value="electronics">Electronics</option>
          <option value="documents">Documents</option>
          <option value="other">Other</option>
        </select>
        <button onClick={addPackingItem} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          ➕ Add Item
        </button>
      </div>
      <div className="space-y-4">
        {selectedTripData.planning.packing?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No packing items yet</p>
        ) : (
          ['essentials', 'clothing', 'toiletries', 'electronics', 'documents', 'other'].map(category => {
            const items = selectedTripData.planning.packing?.filter(i => i.category === category) || [];
            if (items.length === 0) return null;
            const packed = items.filter(i => i.packed).length;
            return (
              <div key={category}>
                <h4 className="font-semibold text-sm mb-2 capitalize flex justify-between">
                  <span>{category}</span>
                  <span className="text-gray-500">{packed}/{items.length}</span>
                </h4>
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2">
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={() => togglePackingPacked(item.id)}
                    />
                    <span className={`flex-1 text-sm ${item.packed ? 'line-through text-gray-500' : ''}`}>
                      {item.item}
                    </span>
                    <button onClick={() => deletePackingItem(item.id)} className="text-red-500 text-sm">🗑️</button>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderNotes = () => (
    <div>
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <textarea
          placeholder="Add a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
          rows={3}
        />
        <button onClick={addNote} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          ➕ Add Note
        </button>
      </div>
      <div className="space-y-2">
        {selectedTripData.planning.notes?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No notes yet</p>
        ) : (
          selectedTripData.planning.notes?.map(note => (
            <div key={note.id} className="border rounded p-3 bg-white">
              <div className="flex justify-between items-start gap-2">
                <p className="flex-1">{note.text}</p>
                <button onClick={() => deleteNote(note.id)} className="text-red-500">🗑️</button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const toggleTimeline = () => {
    setTimelineMode(!timelineMode);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const playTimeline = () => {
    setIsPlaying(!isPlaying);
  };

  const resetTimeline = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const tabs = [
    { key: 'activities', label: 'Activities', icon: '🎯', count: selectedTripData?.planning?.activities?.length || 0 },
    { key: 'restaurants', label: 'Dining', icon: '🍽️', count: selectedTripData?.planning?.restaurants?.length || 0 },
    { key: 'shopping', label: 'Shopping', icon: '🛍️', count: selectedTripData?.planning?.shopping?.length || 0 },
    { key: 'places', label: 'Places', icon: '📍', count: selectedTripData?.planning?.places?.length || 0 },
    { key: 'packing', label: 'Packing', icon: '🎒', count: selectedTripData?.planning?.packing?.length || 0 },
    { key: 'notes', label: 'Notes', icon: '📝', count: selectedTripData?.planning?.notes?.length || 0 }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4 animate-spin">🌍</div>
          <p className="text-xl">Loading your travel globe...</p>
          <p className="text-sm text-gray-400 mt-2">User: {user ? user.email : 'Not logged in'}</p>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-300 mb-6">Please log in to view your travel globe</p>
          <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Trips</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={loadUserTrips}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🌍 Your Travel Globe
            </h1>
            <p className="text-gray-300">
              Explore your adventures and plan your trips
            </p>
          </div>
          {selectedTripData && (
            <button
              onClick={() => setShowPlanningPanel(!showPlanningPanel)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
            >
              {showPlanningPanel ? '🌍 Show Globe' : '🗺️ Plan Trip'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex">
        {/* Globe Container */}
        <div className={`transition-all duration-300 ${showPlanningPanel ? 'w-1/2' : 'w-full'} h-[85vh]`}>
          {trips.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white max-w-md px-6">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-2xl font-bold mb-2">No Trips Yet</h3>
                <p className="text-gray-300 mb-6">
                  Create your first trip to see it on the globe!
                </p>
                <a 
                  href="/trips" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
                >
                  Create Your First Trip
                </a>
              </div>
            </div>
          ) : (
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2 animate-spin">🌍</div>
                  <p>Loading 3D Globe...</p>
                </div>
              </div>
            }>
              <Globe3D
                locations={globeData.locations}
                routes={globeData.routes}
                selectedTrip={selectedTrip}
                onLocationClick={handleLocationClick}
                timelineMode={timelineMode}
                currentTime={currentTime}
                className="w-full h-full"
              />
            </Suspense>
          )}
        </div>

        {/* Planning Panel */}
        {showPlanningPanel && selectedTripData && (
          <div className="w-1/2 h-[85vh] bg-white overflow-y-auto">
            <div className="p-6">
              {/* Trip Header */}
              <div className="mb-6 pb-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTripData.name}</h2>
                    <p className="text-gray-600">📍 {selectedTripData.destination}</p>
                  </div>
                  <button
                    onClick={() => setShowPlanningPanel(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                {saving && (
                  <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                    <div className="animate-spin">⏳</div>
                    Saving...
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="mb-6 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-1 whitespace-nowrap ${
                        activeTab === tab.key
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                      {tab.count > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
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
              <div className="space-y-4">{renderTabContent()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Controls */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white z-20">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTimeline}
            className={`px-2 py-1 rounded text-sm font-medium transition-all ${
              timelineMode 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {timelineMode ? 'Timeline ON' : 'Show All'}
          </button>
          
          {timelineMode && (
            <>
              <button
                onClick={playTimeline}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-all"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              
              <button
                onClick={resetTimeline}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-all"
              >
                Reset
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs">Timeline:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseInt(e.target.value))}
                  className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs">{currentTime}%</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controls Info */}
      <div className="fixed top-20 right-6 bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white text-sm z-20">
        <h4 className="font-semibold mb-2">🌍 Globe Controls</h4>
        <div className="space-y-1">
          <div>🖱️ <span className="text-gray-300">Drag to rotate</span></div>
          <div>🔍 <span className="text-gray-300">Scroll to zoom</span></div>
          <div>📍 <span className="text-gray-300">Hover pins for details</span></div>
          <div>✨ <span className="text-gray-300">Click pins to select trip</span></div>
          <div>⏱️ <span className="text-gray-300">Timeline mode replays journeys</span></div>
        </div>
      </div>
    </div>
  );
}