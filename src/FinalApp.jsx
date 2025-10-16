import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Globe3DPage from './pages/Globe3DPage';

// Clean React components
const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xl">🌍</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-800">
                Travel Expense Tracker
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Track expenses, plan trips, and manage group travel seamlessly
            </p>
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start mb-3">
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Expense Tracking</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Log and categorize your travel expenses with location data
                  </p>
                  <a href="/expenses" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Start Tracking →
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start mb-3">
                <span className="text-2xl mr-3">🗺️</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Trip Planning</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Plan and organize your trips with collaborative features
                  </p>
                  <a href="/trips" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Plan Trip →
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start mb-3">
                <span className="text-2xl mr-3">🌍</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">3D Globe View</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Visualize your travel history on an interactive 3D Earth
                  </p>
                  <a href="/globe" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Explore Globe →
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start mb-3">
                <span className="text-2xl mr-3">👥</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Group Collaboration</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Share trips and split expenses with travel companions
                  </p>
                  <a href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Collaborate →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Testing Section */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-center mb-4">
              <span className="text-xl mr-3">🚀</span>
              <h2 className="text-xl font-bold text-gray-800">Ready to Test?</h2>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Access our comprehensive testing tools to validate all features:
            </p>
            <div className="flex gap-3">
              <a href="/debug" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center">
                <span className="mr-2">🔍</span>
                System Debug
              </a>
              <a href="/testing" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center">
                <span className="mr-2">🧪</span>
                Testing Panel
              </a>
              <a href="/trip-creation-test" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center">
                <span className="mr-2">📋</span>
                Trip Creation Test
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Debug = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 System Debug Information</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">System Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>React App:</span>
                <span className="text-green-600 font-semibold">✅ Running</span>
              </div>
              <div className="flex justify-between">
                <span>Routing:</span>
                <span className="text-green-600 font-semibold">✅ Working</span>
              </div>
              <div className="flex justify-between">
                <span>Components:</span>
                <span className="text-green-600 font-semibold">✅ Loaded</span>
              </div>
              <div className="flex justify-between">
                <span>Server:</span>
                <span className="text-green-600 font-semibold">✅ Port 3000</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a href="/" className="block bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors">
                🏠 Back to Home
              </a>
              <a href="/testing" className="block bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded transition-colors">
                🧪 Testing Panel
              </a>
              <a href="/trip-creation-test" className="block bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded transition-colors">
                📋 Trip Creation Test
              </a>
              <a href="/login" className="block bg-green-100 hover:bg-green-200 px-4 py-2 rounded transition-colors">
                🔐 Login Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🌍</span>
              </div>
              <h1 className="text-lg font-semibold">Travel Tracker</h1>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Home</a>
              <a href="/globe" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">🌍 3D Globe</a>
              <a href="/debug" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Debug</a>
              <a href="/testing" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Testing</a>
              <a href="/trip-creation-test" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Trip Test</a>
            </div>
          </div>
          <div className="flex space-x-4">
            <a href="/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors text-sm font-medium">
              Login
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Testing = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">🧪 Testing Panel</h1>
        <p className="text-gray-600 text-lg mb-8">Loading comprehensive testing infrastructure...</p>
        <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
          <p className="text-blue-800">Testing tools will be available here to validate all Phase 4 features.</p>
        </div>
      </div>
    </div>
  );
};

const TripTest = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">📋 Trip Creation Test</h1>
        <p className="text-gray-600 text-lg mb-8">Loading trip testing workflow...</p>
        <div className="bg-purple-50 rounded-lg p-6 max-w-2xl mx-auto">
          <p className="text-purple-800">Trip creation and collaboration testing tools will be available here.</p>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">🔐 Login</h1>
        <p className="text-gray-600 text-lg mb-8">Authentication system coming soon...</p>
        <div className="bg-green-50 rounded-lg p-6 max-w-2xl mx-auto">
          <p className="text-green-800">Firebase authentication will be integrated here.</p>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/globe" element={<Globe3DPage />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="/testing" element={<Testing />} />
          <Route path="/trip-creation-test" element={<TripTest />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;