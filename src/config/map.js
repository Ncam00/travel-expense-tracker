// Map configuration and utilities
export const MAPBOX_CONFIG = {
  accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
  style: 'mapbox://styles/mapbox/streets-v12',
  defaultCenter: [0, 20], // Longitude, Latitude
  defaultZoom: 2
};

// Transport mode options for expenses
export const TRANSPORT_MODES = [
  { id: 'plane', label: '✈️ Flight', icon: '✈️', color: '#3B82F6' },
  { id: 'train', label: '🚂 Train', icon: '🚂', color: '#10B981' },
  { id: 'car', label: '🚗 Car', icon: '🚗', color: '#F59E0B' },
  { id: 'bus', label: '🚌 Bus', icon: '🚌', color: '#8B5CF6' },
  { id: 'boat', label: '🚤 Boat', icon: '🚤', color: '#06B6D4' },
  { id: 'walking', label: '🚶 Walking', icon: '🚶', color: '#84CC16' },
  { id: 'bike', label: '🚴 Bicycle', icon: '🚴', color: '#F97316' },
  { id: 'taxi', label: '🚕 Taxi/Uber', icon: '🚕', color: '#EF4444' },
  { id: 'other', label: '🔄 Other', icon: '🔄', color: '#6B7280' }
];

// Location search and geocoding utilities
export const searchLocations = async (query) => {
  try {
    const accessToken = MAPBOX_CONFIG.accessToken;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&types=place,poi,address&limit=5`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search locations');
    }
    
    const data = await response.json();
    return data.features.map(feature => ({
      id: feature.id,
      name: feature.place_name,
      coordinates: feature.center, // [longitude, latitude]
      context: feature.context
    }));
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
};

// Reverse geocoding - get location name from coordinates
export const reverseGeocode = async (coordinates) => {
  try {
    const [longitude, latitude] = coordinates;
    const accessToken = MAPBOX_CONFIG.accessToken;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&types=place,poi,address&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Failed to reverse geocode');
    }
    
    const data = await response.json();
    return data.features[0]?.place_name || 'Unknown location';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Unknown location';
  }
};

// Get user's current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([
          position.coords.longitude,
          position.coords.latitude
        ]);
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};