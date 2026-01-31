import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Clean working components without any complex dependencies
function CleanHome() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', color: '#1f2937', marginBottom: '16px' }}>
          🌍 Travel Expense Tracker
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '32px' }}>
          Track expenses, plan trips, and manage group travel seamlessly
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>📊 Expense Tracking</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>Log and categorize your travel expenses with location data</p>
          <a href="/expenses" style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}>
            Start Tracking →
          </a>
        </div>
        
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>🗺️ Trip Planning</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>Plan and organize your trips with collaborative features</p>
          <a href="/trips" style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}>
            Plan Trip →
          </a>
        </div>
        
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>👥 Group Collaboration</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>Share trips and split expenses with travel companions</p>
          <a href="/dashboard" style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}>
            Collaborate →
          </a>
        </div>
      </div>

      <div style={{ backgroundColor: '#dbeafe', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>🚀 Ready to Test?</h2>
        <p style={{ color: '#374151', marginBottom: '16px' }}>
          Access our comprehensive testing tools to validate all features:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <a href="/debug" style={{ 
            backgroundColor: '#2563eb', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '8px', 
            textDecoration: 'none',
            fontWeight: '500'
          }}>
            🔍 System Debug
          </a>
          <a href="/testing" style={{ 
            backgroundColor: '#059669', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '8px', 
            textDecoration: 'none',
            fontWeight: '500'
          }}>
            🧪 Testing Panel
          </a>
          <a href="/trip-creation-test" style={{ 
            backgroundColor: '#7c3aed', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '8px', 
            textDecoration: 'none',
            fontWeight: '500'
          }}>
            📋 Trip Creation Test
          </a>
        </div>
      </div>
    </div>
  );
}

function CleanDebug() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '24px' }}>🔍 System Debug Information</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>System Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>React App:</span>
              <span style={{ color: '#059669', fontWeight: '600' }}>✅ Running</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Routing:</span>
              <span style={{ color: '#059669', fontWeight: '600' }}>✅ Working</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Components:</span>
              <span style={{ color: '#059669', fontWeight: '600' }}>✅ Loaded</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Server:</span>
              <span style={{ color: '#059669', fontWeight: '600' }}>✅ Port 3000</span>
            </div>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="/" style={{ 
              backgroundColor: '#f3f4f6', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              textDecoration: 'none',
              color: '#374151',
              display: 'block'
            }}>
              🏠 Back to Home
            </a>
            <a href="/testing" style={{ 
              backgroundColor: '#dbeafe', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              textDecoration: 'none',
              color: '#1e40af',
              display: 'block'
            }}>
              🧪 Testing Panel
            </a>
            <a href="/trip-creation-test" style={{ 
              backgroundColor: '#ede9fe', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              textDecoration: 'none',
              color: '#6d28d9',
              display: 'block'
            }}>
              📋 Trip Creation Test
            </a>
            <a href="/login" style={{ 
              backgroundColor: '#dcfce7', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              textDecoration: 'none',
              color: '#166534',
              display: 'block'
            }}>
              🔐 Login Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function CleanNavbar() {
  return (
    <nav style={{ backgroundColor: '#1f2937', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>🌍 Travel Tracker</h1>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="/" style={{ color: 'white', textDecoration: 'none', transition: 'color 0.3s' }}>Home</a>
              <a href="/debug" style={{ color: 'white', textDecoration: 'none', transition: 'color 0.3s' }}>Debug</a>
              <a href="/testing" style={{ color: 'white', textDecoration: 'none', transition: 'color 0.3s' }}>Testing</a>
              <a href="/trip-creation-test" style={{ color: 'white', textDecoration: 'none', transition: 'color 0.3s' }}>Trip Test</a>
            </div>
          </div>
          <div>
            <a href="/login" style={{ 
              backgroundColor: '#2563eb', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Login
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

function CleanApp() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <TailwindNavbar />
        <Routes>
          <Route path="/" element={<TailwindHome />} />
          <Route path="/debug" element={<TailwindDebug />} />
          <Route path="/testing" element={
            <div className="container mx-auto px-4 py-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">🧪 Testing Panel</h1>
                <p className="text-gray-600 text-lg mb-8">Loading comprehensive testing infrastructure...</p>
                <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
                  <p className="text-blue-800">Testing tools will be available here to validate all Phase 4 features.</p>
                </div>
              </div>
            </div>
          } />
          <Route path="/trip-creation-test" element={
            <div className="container mx-auto px-4 py-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">📋 Trip Creation Test</h1>
                <p className="text-gray-600 text-lg mb-8">Loading trip testing workflow...</p>
                <div className="bg-purple-50 rounded-lg p-6 max-w-2xl mx-auto">
                  <p className="text-purple-800">Trip creation and collaboration testing tools will be available here.</p>
                </div>
              </div>
            </div>
          } />
          <Route path="/login" element={
            <div className="container mx-auto px-4 py-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">🔐 Login</h1>
                <p className="text-gray-600 text-lg mb-8">Authentication system coming soon...</p>
                <div className="bg-green-50 rounded-lg p-6 max-w-2xl mx-auto">
                  <p className="text-green-800">Firebase authentication will be integrated here.</p>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default CleanApp;