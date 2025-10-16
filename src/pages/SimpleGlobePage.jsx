import React from 'react';
import SimpleGlobe from '../components/SimpleGlobe';

export default function SimpleGlobePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">
            🌍 Simple 3D Globe Test
          </h1>
          <p className="text-gray-300 mb-6">
            Testing basic 3D globe functionality
          </p>
        </div>
      </div>

      {/* Globe Container */}
      <div className="relative h-[80vh]">
        <SimpleGlobe />
      </div>

      {/* Controls Info */}
      <div className="fixed top-20 right-6 bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white text-sm z-20">
        <h4 className="font-semibold mb-2">Controls</h4>
        <div className="space-y-1">
          <div>🖱️ <span className="text-gray-300">Drag to rotate</span></div>
          <div>🔍 <span className="text-gray-300">Scroll to zoom</span></div>
        </div>
      </div>
    </div>
  );
}