import React from 'react';

function SimpleApp() {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#1f2937', fontSize: '2rem', marginBottom: '1rem' }}>
        � Travel Tracker - Test Mode
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        This is a minimal test version. If you can see this, React is working!
      </p>
      
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#1f2937', marginBottom: '1rem' }}>Status Check</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>✅ React is rendering</li>
          <li style={{ marginBottom: '0.5rem' }}>✅ CSS is working</li>
          <li style={{ marginBottom: '0.5rem' }}>✅ JavaScript is executing</li>
        </ul>
        
        <button 
          onClick={() => alert('JavaScript is working!')}
          style={{ 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            padding: '0.5rem 1rem', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

function SimpleDebug() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'blue' }}>🔍 Debug Page Working!</h1>
      <div style={{ marginTop: '20px' }}>
        <h2>System Status:</h2>
        <ul>
          <li>✅ React Router working</li>
          <li>✅ Navigation working</li>
          <li>✅ Server responding</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ padding: '10px', backgroundColor: 'gray', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>← Back to Home</a>
      </div>
    </div>
  );
}

function SimpleTest() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'orange' }}>🧪 Test Page Working!</h1>
      <div style={{ marginTop: '20px' }}>
        <h2>Test Results:</h2>
        <ul>
          <li>✅ Basic routing functional</li>
          <li>✅ Components rendering</li>
          <li>✅ Ready for complex features</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ padding: '10px', backgroundColor: 'gray', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>← Back to Home</a>
      </div>
    </div>
  );
}

function SimpleLogin() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'purple' }}>🔐 Login Page Working!</h1>
      <div style={{ marginTop: '20px' }}>
        <p>This is a simplified login page to test routing.</p>
        <div style={{ marginTop: '20px' }}>
          <a href="/" style={{ padding: '10px', backgroundColor: 'gray', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>← Back to Home</a>
        </div>
      </div>
    </div>
  );
}

function SimpleApp() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
        <Routes>
          <Route path="/" element={<SimpleHome />} />
          <Route path="/debug" element={<SimpleDebug />} />
          <Route path="/test" element={<SimpleTest />} />
          <Route path="/login" element={<SimpleLogin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default SimpleApp;