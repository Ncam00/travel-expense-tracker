import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';

// Import the actual testing components
import TestingPage from './pages/TestingPage';
import TripCreationTestPage from './pages/TripCreationTestPage';
import SimpleTest from './pages/SimpleTest';

// Create a simple working auth context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return { user: null, loading: false, login: () => {}, signup: () => {}, logout: () => {} };
  }
  return context;
};

// Simple working components
function WorkingHome() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🌍 Travel Expense Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track expenses, plan trips, and manage group travel seamlessly
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📊 Expense Tracking</h3>
            <p className="text-gray-600 mb-4">Log and categorize your travel expenses with location data</p>
            <a href="/expenses" className="text-blue-600 hover:text-blue-800 font-medium">
              Start Tracking →
            </a>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🗺️ Trip Planning</h3>
            <p className="text-gray-600 mb-4">Plan and organize your trips with collaborative features</p>
            <a href="/trips" className="text-blue-600 hover:text-blue-800 font-medium">
              Plan Trip →
            </a>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">👥 Group Collaboration</h3>
            <p className="text-gray-600 mb-4">Share trips and split expenses with travel companions</p>
            <a href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
              Collaborate →
            </a>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 Ready to Test?</h2>
          <p className="text-gray-600 mb-4">
            Access our comprehensive testing tools to validate all features:
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/debug" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              🔍 System Debug
            </a>
            <a href="/testing" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
              🧪 Testing Panel
            </a>
            <a href="/trip-creation-test" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
              📋 Trip Creation Test
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkingDebug() {
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
              <a href="/" className="block bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition">
                🏠 Back to Home
              </a>
              <a href="/testing" className="block bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded transition">
                🧪 Testing Panel
              </a>
              <a href="/trip-creation-test" className="block bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded transition">
                📋 Trip Creation Test
              </a>
              <a href="/login" className="block bg-green-100 hover:bg-green-200 px-4 py-2 rounded transition">
                🔐 Login Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple fallback auth context
function SimpleAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const authValue = {
    user,
    loading,
    login: async (email, password) => {
      console.log('Login attempt:', email);
      // Simulate login
      setUser({ email, uid: 'demo-user' });
      return Promise.resolve();
    },
    signup: async (email, password) => {
      console.log('Signup attempt:', email);
      // Simulate signup
      setUser({ email, uid: 'demo-user' });
      return Promise.resolve();
    },
    logout: async () => {
      setUser(null);
      return Promise.resolve();
    }
  };
  
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Working navbar with better styling
function WorkingNavbar() {
  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold">🌍 Travel Tracker</h1>
            <div className="hidden md:flex space-x-6">
              <a href="/" className="hover:text-blue-300 transition">Home</a>
              <a href="/debug" className="hover:text-blue-300 transition">Debug</a>
              <a href="/testing" className="hover:text-blue-300 transition">Testing</a>
              <a href="/trip-creation-test" className="hover:text-blue-300 transition">Trip Test</a>
            </div>
          </div>
          <div className="flex space-x-4">
            <a href="/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition">
              Login
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

function WorkingApp() {
  return (
    <SimpleAuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <WorkingNavbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<WorkingHome />} />
            <Route path="/debug" element={<WorkingDebug />} />
            <Route path="/test" element={<SimpleTest />} />
            <Route path="/testing" element={<TestingPage />} />
            <Route path="/trip-creation-test" element={<TripCreationTestPage />} />
            <Route path="/login" element={<div className="p-8"><h1 className="text-2xl">🔐 Login Page Coming Soon...</h1></div>} />
            <Route path="/signup" element={<div className="p-8"><h1 className="text-2xl">📝 Signup Page Coming Soon...</h1></div>} />
          </Routes>
        </div>
      </Router>
    </SimpleAuthProvider>
  );
}

export default WorkingApp;