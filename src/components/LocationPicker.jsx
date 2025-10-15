import React, { useState, useEffect } from 'react';
import { searchLocations, getCurrentLocation } from '../config/map';

const LocationPicker = ({ onLocationSelect, selectedLocation = null, placeholder = "Search for a location..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Location search error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Set initial value if selectedLocation is provided
  useEffect(() => {
    if (selectedLocation && selectedLocation.name) {
      setQuery(selectedLocation.name);
    }
  }, [selectedLocation]);

  const handleLocationSelect = (location) => {
    setQuery(location.name);
    setShowSuggestions(false);
    onLocationSelect({
      name: location.name,
      coordinates: location.coordinates // [longitude, latitude]
    });
  };

  const handleCurrentLocation = async () => {
    setGettingCurrentLocation(true);
    try {
      const coordinates = await getCurrentLocation();
      // For current location, we'll use reverse geocoding to get the name
      const { reverseGeocode } = await import('../config/map');
      const locationName = await reverseGeocode(coordinates);
      
      const currentLocation = {
        name: `📍 ${locationName}`,
        coordinates
      };
      
      handleLocationSelect(currentLocation);
    } catch (error) {
      console.error('Failed to get current location:', error);
      alert('Could not get your current location. Please check your browser permissions.');
    } finally {
      setGettingCurrentLocation(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value === '') {
      onLocationSelect(null);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {loading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={gettingCurrentLocation}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title="Use current location"
        >
          {gettingCurrentLocation ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <span>📍</span>
          )}
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id || index}
              type="button"
              onClick={() => handleLocationSelect(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{suggestion.name}</div>
              {suggestion.context && (
                <div className="text-sm text-gray-600 mt-1">
                  {suggestion.context.map(ctx => ctx.text).join(', ')}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && suggestions.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="px-4 py-3 text-gray-500 text-center">
            No locations found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;