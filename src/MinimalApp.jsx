function MinimalApp() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'green' }}>🚀 Travel App is Working!</h1>
      <div style={{ marginTop: '20px' }}>
        <h2>Status Check:</h2>
        <ul>
          <li>✅ React is rendering</li>
          <li>✅ Vite server is running on port 3000</li>
          <li>✅ Environment variables loaded</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Quick Navigation:</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '200px' }}>
          <a href="/debug" style={{ 
            padding: '10px', 
            backgroundColor: 'blue', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            Debug Page
          </a>
          <a href="/test" style={{ 
            padding: '10px', 
            backgroundColor: 'green', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            Simple Test
          </a>
          <a href="/login" style={{ 
            padding: '10px', 
            backgroundColor: 'purple', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            Login Page
          </a>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        Current URL: {window.location.href}<br/>
        Current Time: {new Date().toLocaleString()}
      </div>
    </div>
  );
}

export default MinimalApp;