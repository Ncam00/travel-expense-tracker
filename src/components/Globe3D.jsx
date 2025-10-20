import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

// Realistic Earth component with smart rotation to showcase destinations
function RealisticEarth({ locations = [], selectedTrip = null, onLocationClick = () => {} }) {
  const earthRef = useRef();
  const [targetRotation, setTargetRotation] = useState(0);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  
  // Mobile detection for performance
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
  
  // Load realistic Earth texture
  const earthTexture = useLoader(THREE.TextureLoader, 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
  
  // Smart rotation to showcase destinations
  useFrame((state) => {
    if (earthRef.current) {
      if (locations.length > 0) {
        // Rotate to showcase different destinations over time
        const rotationSpeed = 0.001;
        const showcaseInterval = 8000; // 8 seconds per destination
        const currentTime = state.clock.elapsedTime * 1000;
        const locationIndex = Math.floor(currentTime / showcaseInterval) % locations.length;
        
        if (locationIndex !== currentLocationIndex) {
          setCurrentLocationIndex(locationIndex);
          // Calculate rotation to show the current destination
          const location = locations[locationIndex];
          const targetY = -((location.lng + 180) * Math.PI) / 180;
          setTargetRotation(targetY);
        }
        
        // Smooth rotation towards target
        const currentY = earthRef.current.rotation.y;
        const diff = targetRotation - currentY;
        const shortestDiff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;
        earthRef.current.rotation.y += shortestDiff * 0.02;
      } else {
        // Default slow rotation when no destinations
        earthRef.current.rotation.y += 0.002;
      }
    }
  });

  return (
    <group>
      {/* Earth sphere with realistic texture - lower quality on mobile */}
      <mesh ref={earthRef} position={[0, 0, 0]}>
        <sphereGeometry args={[2, isMobile ? 32 : 64, isMobile ? 32 : 64]} />
        <meshLambertMaterial map={earthTexture} />
      </mesh>
      
      {/* Location pins */}
      {locations.map((location, index) => (
        <LocationPin 
          key={`${location.lat}-${location.lng}-${location.tripId}-${index}`} 
          location={location} 
          index={index}
          isSelected={selectedTrip === location.tripId}
          onClick={() => onLocationClick(location)}
        />
      ))}
    </group>
  );
}

// Fallback Earth component with smart rotation while texture loads
function BlueEarth({ locations = [], selectedTrip = null, onLocationClick = () => {} }) {
  const earthRef = useRef();
  const [targetRotation, setTargetRotation] = useState(0);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  
  // Smart rotation to showcase destinations
  useFrame((state) => {
    if (earthRef.current) {
      if (locations.length > 0) {
        // Rotate to showcase different destinations over time
        const showcaseInterval = 8000; // 8 seconds per destination
        const currentTime = state.clock.elapsedTime * 1000;
        const locationIndex = Math.floor(currentTime / showcaseInterval) % locations.length;
        
        if (locationIndex !== currentLocationIndex) {
          setCurrentLocationIndex(locationIndex);
          // Calculate rotation to show the current destination
          const location = locations[locationIndex];
          const targetY = -((location.lng + 180) * Math.PI) / 180;
          setTargetRotation(targetY);
        }
        
        // Smooth rotation towards target
        const currentY = earthRef.current.rotation.y;
        const diff = targetRotation - currentY;
        const shortestDiff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;
        earthRef.current.rotation.y += shortestDiff * 0.02;
      } else {
        // Default slow rotation when no destinations
        earthRef.current.rotation.y += 0.002;
      }
    }
  });

  return (
    <group>
      {/* Earth sphere with blue fallback */}
      <mesh ref={earthRef} position={[0, 0, 0]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshLambertMaterial 
          color="#2563eb"
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Location pins */}
      {locations.map((location, index) => (
        <LocationPin 
          key={`${location.lat}-${location.lng}-${location.tripId}-${index}`} 
          location={location} 
          index={index}
          isSelected={selectedTrip === location.tripId}
          onClick={() => onLocationClick(location)}
        />
      ))}
    </group>
  );
}

// Convert lat/lng to 3D coordinates on sphere
function latLngTo3D(lat, lng, radius = 2) {
  const phi = (lat * Math.PI) / 180;
  const theta = ((lng - 180) * Math.PI) / 180;
  
  const x = -(radius * Math.cos(phi) * Math.cos(theta));
  const y = radius * Math.sin(phi);
  const z = radius * Math.cos(phi) * Math.sin(theta);
  
  return [x, y, z];
}

// Individual location pin component
function LocationPin({ location, index, isSelected, onClick = () => {} }) {
  const pinRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const position = latLngTo3D(location.lat, location.lng, 2.1);
  
  // Pulse animation for selected pins
  useFrame((state) => {
    if (pinRef.current && isSelected) {
      pinRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });
  
  // Spending level visualization
  const getSpendingColor = (amount) => {
    if (amount > 5000) return '#ff4757'; // Red for high spending
    if (amount > 2000) return '#ffa726'; // Orange for medium spending
    if (amount > 500) return '#66bb6a';  // Green for low spending
    return '#4ecdc4'; // Teal for minimal spending
  };
  
  const spendingHeight = Math.min(location.totalSpent / 2000, 0.4); // Cap height
  
  return (
    <group position={position}>
      {/* Pin marker */}
      <mesh 
        ref={pinRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(location);
        }}
        scale={hovered ? 1.3 : 1}
      >
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial 
          color={isSelected ? '#ff6b6b' : getSpendingColor(location.totalSpent)} 
          emissive={isSelected ? '#ff2222' : getSpendingColor(location.totalSpent)}
          emissiveIntensity={isSelected ? 0.5 : 0.2}
        />
      </mesh>
      
      {/* Location label */}
      {hovered && (
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.06}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={1}
        >
          {`${location.name}\n$${location.totalSpent?.toLocaleString() || '0'}`}
        </Text>
      )}
      
      {/* Spending indicator cylinder */}
      {location.totalSpent > 0 && (
        <mesh position={[0, -spendingHeight/2 - 0.05, 0]}>
          <cylinderGeometry args={[0.02, 0.03, spendingHeight, 8]} />
          <meshStandardMaterial 
            color={getSpendingColor(location.totalSpent)}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}
      
      {/* Transport mode indicator */}
      {location.transportMode && (
        <mesh position={[0.08, 0, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial 
            color={location.transportMode === 'plane' ? '#61dafb' : 
                   location.transportMode === 'train' ? '#ff6b6b' :
                   location.transportMode === 'car' ? '#ffd93d' :
                   location.transportMode === 'boat' ? '#6bcf7f' : '#a18aff'}
          />
        </mesh>
      )}
    </group>
  );
}

// Travel route component with transport mode visualization
function TravelRoute({ fromLocation, toLocation, animated = false, transportMode = 'plane' }) {
  const routeRef = useRef();
  const lineRef = useRef();
  const [progress, setProgress] = useState(0);
  
  const from3D = latLngTo3D(fromLocation.lat, fromLocation.lng, 2.05);
  const to3D = latLngTo3D(toLocation.lat, toLocation.lng, 2.05);
  
  // Create curved path between two points
  const createCurvedPath = (start, end) => {
    const distance = Math.sqrt(
      Math.pow(end[0] - start[0], 2) + 
      Math.pow(end[1] - start[1], 2) + 
      Math.pow(end[2] - start[2], 2)
    );
    
    // Higher curve for longer distances
    const curveHeight = Math.min(distance * 0.3, 1.0);
    
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2,
        Math.max(start[1], end[1]) + curveHeight,
        (start[2] + end[2]) / 2
      ),
      new THREE.Vector3(...end)
    );
    return curve;
  };
  
  const curve = createCurvedPath(from3D, to3D);
  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  // Transport mode colors and styles
  const getRouteStyle = (mode) => {
    switch (mode) {
      case 'plane':
        return { color: '#61dafb', linewidth: 3, opacity: 0.8 };
      case 'train':
        return { color: '#ff6b6b', linewidth: 2, opacity: 0.7 };
      case 'car':
        return { color: '#ffd93d', linewidth: 2, opacity: 0.6 };
      case 'boat':
        return { color: '#6bcf7f', linewidth: 2, opacity: 0.7 };
      case 'bus':
        return { color: '#a18aff', linewidth: 2, opacity: 0.6 };
      default:
        return { color: '#61dafb', linewidth: 2, opacity: 0.6 };
    }
  };
  
  const routeStyle = getRouteStyle(transportMode);
  
  // Animation logic
  useFrame((state) => {
    if (animated && routeRef.current) {
      setProgress((prev) => (prev + 0.02) % 1);
      
      // Animate line drawing effect
      if (lineRef.current) {
        const totalPoints = points.length;
        const visiblePoints = Math.floor(totalPoints * progress);
        const visibleGeometry = new THREE.BufferGeometry().setFromPoints(
          points.slice(0, Math.max(1, visiblePoints))
        );
        lineRef.current.geometry = visibleGeometry;
      }
    }
  });
  
  return (
    <group ref={routeRef}>
      {/* Main route line */}
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial 
          color={routeStyle.color} 
          linewidth={routeStyle.linewidth}
          transparent
          opacity={routeStyle.opacity}
        />
      </line>
      
      {/* Transport mode indicator at start */}
      <mesh position={from3D}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial 
          color={routeStyle.color}
          emissive={routeStyle.color}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Animated travel indicator */}
      {animated && progress > 0 && (
        <mesh position={curve.getPoint(progress).toArray()}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

// Main Globe3D component with timeline controls
export default function Globe3D({ 
  locations = [], 
  routes = [], 
  selectedTrip = null,
  onLocationClick = () => {},
  timelineMode = false,
  currentTime = 0,
  className = ""
}) {
  const [visibleRoutes, setVisibleRoutes] = useState([]);
  const [visibleLocations, setVisibleLocations] = useState([]);
  
  // Mobile detection and optimization
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
  const canvasRef = useRef();
  
  // Timeline logic
  useEffect(() => {
    if (timelineMode && locations.length > 0) {
      // Sort all locations by date
      const sortedLocations = [...locations].sort((a, b) => {
        const dateA = a.date?.seconds || a.date?.getTime() || 0;
        const dateB = b.date?.seconds || b.date?.getTime() || 0;
        return dateA - dateB;
      });
      
      const totalLocations = sortedLocations.length;
      const showCount = Math.floor((currentTime / 100) * totalLocations);
      
      setVisibleLocations(sortedLocations.slice(0, showCount));
      
      // Show routes up to current time
      const relevantRoutes = routes.filter(route => {
        const fromIndex = sortedLocations.findIndex(loc => 
          loc.lat === route.from.lat && loc.lng === route.from.lng
        );
        return fromIndex < showCount - 1;
      });
      
      setVisibleRoutes(relevantRoutes.map(route => ({
        ...route,
        animated: route.routeIndex === showCount - 2 // Animate the current route
      })));
    } else {
      setVisibleLocations(locations);
      setVisibleRoutes(routes);
    }
  }, [timelineMode, currentTime, locations, routes]);

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'linear-gradient(to-bottom, #000428, #004e92)' }}
        gl={{ 
          antialias: !isMobile, // Disable anti-aliasing on mobile for performance
          powerPreference: isMobile ? 'low-power' : 'high-performance'
        }}
      >
        {/* Lighting - simplified to match working globe */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Stars background - reduced count on mobile */}
        <Stars 
          radius={100} 
          depth={50} 
          count={isMobile ? 1000 : 2000} 
          factor={4} 
          saturation={0} 
          fade 
        />
        
        {/* Earth with Suspense for texture loading */}
        <Suspense fallback={
          <BlueEarth 
            locations={visibleLocations} 
            selectedTrip={selectedTrip} 
            onLocationClick={onLocationClick}
          />
        }>
          <RealisticEarth 
            locations={visibleLocations} 
            selectedTrip={selectedTrip} 
            onLocationClick={onLocationClick}
          />
        </Suspense>
        
        {/* Travel routes - simplified rendering */}
        {visibleRoutes.map((route, index) => (
          <TravelRoute 
            key={`route-${index}`}
            fromLocation={route.from}
            toLocation={route.to}
            transportMode={route.transportMode || 'plane'}
            animated={route.animated || false}
          />
        ))}
        
        {/* Controls - enhanced for mobile */}
        <OrbitControls 
          enablePan={isMobile ? false : true} // Disable pan on mobile to avoid conflicts
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={8}
          // Mobile-optimized settings
          touches={{
            ONE: THREE.TOUCH.ROTATE, // Single finger rotates
            TWO: THREE.TOUCH.DOLLY_PAN // Two fingers zoom/pan
          }}
          rotateSpeed={isMobile ? 0.8 : 1.0} // Faster rotation on mobile
          zoomSpeed={isMobile ? 1.2 : 1.0} // Faster zoom on mobile
          enableDamping={true}
          dampingFactor={0.05} // Smooth inertia
          minPolarAngle={Math.PI * 0.1} // Prevent flipping over poles
          maxPolarAngle={Math.PI * 0.9}
        />
      </Canvas>
    </div>
  );
}

// Export helper function for converting trip data
export function convertTripDataFor3D(trips = []) {
  const locations = [];
  const routes = [];
  
  trips.forEach(trip => {
    if (trip.expenses) {
      const tripLocations = [];
      
      trip.expenses.forEach(expense => {
        if (expense.location && expense.location.coordinates) {
          const locationData = {
            lat: expense.location.coordinates.lat,
            lng: expense.location.coordinates.lng,
            name: expense.location.name,
            totalSpent: expense.amount,
            tripId: trip.id,
            tripName: trip.name,
            date: expense.date,
            transportMode: expense.transportMode || 'plane'
          };
          
          locations.push(locationData);
          tripLocations.push(locationData);
        }
      });
      
      // Sort locations by date for this trip
      tripLocations.sort((a, b) => {
        const dateA = a.date?.seconds || a.date?.getTime() || 0;
        const dateB = b.date?.seconds || b.date?.getTime() || 0;
        return dateA - dateB;
      });
      
      // Create routes between consecutive locations
      for (let i = 0; i < tripLocations.length - 1; i++) {
        routes.push({
          from: tripLocations[i],
          to: tripLocations[i + 1],
          tripId: trip.id,
          tripName: trip.name,
          transportMode: tripLocations[i + 1].transportMode,
          animated: false,
          routeIndex: i
        });
      }
    }
  });
  
  // Consolidate spending by location
  const consolidatedLocations = [];
  const locationMap = new Map();
  
  locations.forEach(loc => {
    const key = `${loc.lat},${loc.lng},${loc.tripId}`;
    if (locationMap.has(key)) {
      locationMap.get(key).totalSpent += loc.totalSpent;
    } else {
      locationMap.set(key, { ...loc });
      consolidatedLocations.push(locationMap.get(key));
    }
  });
  
  return { locations: consolidatedLocations, routes };
}