import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

// Earth component with realistic textures
function Earth({ locations = [], selectedTrip = null }) {
  const earthRef = useRef();
  
  // Load Earth textures (we'll use a simple color for now, but this can be enhanced with real Earth textures)
  const earthTexture = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg');
  const bumpMap = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/elev_bump_4k.jpg');
  
  // Rotate the Earth slowly
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={earthRef} position={[0, 0, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          map={earthTexture}
          bumpMap={bumpMap}
          bumpScale={0.05}
          shininess={1000}
        />
      </mesh>
      
      {/* Location pins */}
      {locations.map((location, index) => (
        <LocationPin 
          key={index} 
          location={location} 
          index={index}
          isSelected={selectedTrip === location.tripId}
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
function LocationPin({ location, index, isSelected }) {
  const pinRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const position = latLngTo3D(location.lat, location.lng, 2.1);
  
  // Pulse animation for selected pins
  useFrame((state) => {
    if (pinRef.current && isSelected) {
      pinRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });
  
  return (
    <group position={position}>
      {/* Pin marker */}
      <mesh 
        ref={pinRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial 
          color={isSelected ? '#ff6b6b' : '#4ecdc4'} 
          emissive={isSelected ? '#ff2222' : '#226644'}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Location label */}
      {hovered && (
        <Text
          position={[0, 0.15, 0]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {location.name}
          {location.totalSpent && (
            <meshStandardMaterial attach="material" color="#ffffff" />
          )}
        </Text>
      )}
      
      {/* Spending indicator */}
      {location.totalSpent && (
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.02, 0.02, Math.min(location.totalSpent / 1000, 0.3), 8]} />
          <meshStandardMaterial 
            color={location.totalSpent > 5000 ? '#ff4757' : location.totalSpent > 1000 ? '#ffa726' : '#66bb6a'} 
          />
        </mesh>
      )}
    </group>
  );
}

// Travel route component
function TravelRoute({ fromLocation, toLocation, animated = false }) {
  const routeRef = useRef();
  const [progress, setProgress] = useState(0);
  
  const from3D = latLngTo3D(fromLocation.lat, fromLocation.lng, 2.05);
  const to3D = latLngTo3D(toLocation.lat, toLocation.lng, 2.05);
  
  // Create curved path between two points
  const createCurvedPath = (start, end) => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2,
        Math.max(start[1], end[1]) + 0.5,
        (start[2] + end[2]) / 2
      ),
      new THREE.Vector3(...end)
    );
    return curve;
  };
  
  const curve = createCurvedPath(from3D, to3D);
  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  useFrame(() => {
    if (animated && routeRef.current) {
      setProgress((prev) => (prev + 0.01) % 1);
    }
  });
  
  return (
    <line ref={routeRef} geometry={geometry}>
      <lineBasicMaterial color="#61dafb" linewidth={2} />
    </line>
  );
}

// Main Globe3D component
export default function Globe3D({ 
  locations = [], 
  routes = [], 
  selectedTrip = null,
  onLocationClick = () => {},
  className = ""
}) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f172a 100%)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4169e1" />
        
        {/* Stars background */}
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1}
        />
        
        {/* Earth */}
        <Earth locations={locations} selectedTrip={selectedTrip} />
        
        {/* Travel routes */}
        {routes.map((route, index) => (
          <TravelRoute 
            key={index}
            fromLocation={route.from}
            toLocation={route.to}
            animated={route.animated}
          />
        ))}
        
        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={10}
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
      trip.expenses.forEach(expense => {
        if (expense.location && expense.location.coordinates) {
          locations.push({
            lat: expense.location.coordinates.lat,
            lng: expense.location.coordinates.lng,
            name: expense.location.name,
            totalSpent: expense.amount,
            tripId: trip.id,
            date: expense.date
          });
        }
      });
    }
  });
  
  // Group by trip and create routes
  trips.forEach(trip => {
    const tripLocations = locations.filter(loc => loc.tripId === trip.id);
    tripLocations.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    for (let i = 0; i < tripLocations.length - 1; i++) {
      routes.push({
        from: tripLocations[i],
        to: tripLocations[i + 1],
        tripId: trip.id,
        animated: false
      });
    }
  });
  
  return { locations, routes };
}