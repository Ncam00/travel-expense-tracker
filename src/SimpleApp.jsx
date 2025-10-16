import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Simple fallback components
function SimpleHome() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'green' }}>🏠 Home Page Working!</h1>
      <div style={{ marginTop: '20px' }}>
        <h2>Navigation Test:</h2>
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', maxWidth: '200px' }}>
          <a href="/debug" style={{ padding: '10px', backgroundColor: 'blue', color: 'white', textDecoration: 'none', borderRadius: '5px', textAlign: 'center' }}>Debug Page</a>
          <a href="/test" style={{ padding: '10px', backgroundColor: 'green', color: 'white', textDecoration: 'none', borderRadius: '5px', textAlign: 'center' }}>Simple Test</a>
          <a href="/login" style={{ padding: '10px', backgroundColor: 'purple', color: 'white', textDecoration: 'none', borderRadius: '5px', textAlign: 'center' }}>Login Page</a>
        </div>
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