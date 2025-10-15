import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_CONFIG } from '../config/map';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';

const TravelMap = ({ 
  expenses = [], 
  center = MAPBOX_CONFIG.defaultCenter, 
  zoom = MAPBOX_CONFIG.defaultZoom,
  height = '400px',
  showExpensePopups = true
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if Mapbox token is available
    if (!MAPBOX_CONFIG.accessToken || MAPBOX_CONFIG.accessToken.includes('demo_token')) {
      setError('Mapbox access token not configured. Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file.');
      setIsLoading(false);
      return;
    }

    if (map.current) return; // Initialize map only once

    try {
      mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_CONFIG.style,
        center: center,
        zoom: zoom
      });

      map.current.on('load', () => {
        setIsLoading(false);
        addExpenseMarkers();
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Failed to load map. Please check your internet connection.');
        setIsLoading(false);
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map.');
      setIsLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when expenses change
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      addExpenseMarkers();
    }
  }, [expenses]);

  const addExpenseMarkers = () => {
    if (!map.current) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.expense-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add new markers for each expense with location
    expenses.forEach((expense, index) => {
      if (!expense.location || !expense.location.coordinates) return;

      const [longitude, latitude] = expense.location.coordinates;

      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'expense-marker';
      markerElement.style.cssText = `
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: ${getExpenseColor(expense.category)};
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      // Create popup if enabled
      let popup = null;
      if (showExpensePopups) {
        popup = new mapboxgl.Popup({
          offset: 15,
          closeButton: true,
          closeOnClick: false
        }).setHTML(`
          <div class="p-3">
            <h3 class="font-semibold text-gray-900">${expense.description}</h3>
            <p class="text-lg font-bold text-green-600">$${expense.amount}</p>
            <p class="text-sm text-gray-600">${expense.category}</p>
            <p class="text-xs text-gray-500">${expense.location.name}</p>
            ${expense.transportMode ? `<p class="text-xs text-blue-600">🚗 ${expense.transportMode}</p>` : ''}
            <p class="text-xs text-gray-400">${expense.date}</p>
          </div>
        `);
      }

      // Add marker to map
      new mapboxgl.Marker(markerElement)
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map.current);
    });

    // Fit map to show all markers if there are any
    if (expenses.length > 0) {
      const coordinates = expenses
        .filter(expense => expense.location && expense.location.coordinates)
        .map(expense => expense.location.coordinates);

      if (coordinates.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord));
        
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    }
  };

  const getExpenseColor = (category) => {
    const colors = {
      food: '#EF4444',
      accommodation: '#3B82F6',
      transport: '#10B981',
      entertainment: '#8B5CF6',
      shopping: '#F59E0B',
      other: '#6B7280'
    };
    return colors[category] || colors.other;
  };

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg"
        style={{ height }}
      >
        <div className="text-center p-6">
          <div className="text-gray-400 text-4xl mb-2">🗺️</div>
          <p className="text-gray-600 mb-2">Map unavailable</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapContainer} 
        className="w-full rounded-lg overflow-hidden border border-gray-300"
        style={{ height }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      {expenses.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border">
          <h4 className="text-sm font-semibold mb-2">Expense Categories</h4>
          <div className="space-y-1">
            {[...new Set(expenses.map(e => e.category))].map(category => (
              <div key={category} className="flex items-center text-xs">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getExpenseColor(category) }}
                ></div>
                <span className="capitalize">{category}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelMap;