import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function MinimalApp() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      <h1>Minimal Test App</h1>
      <p>If you can see this, React is working properly.</p>
      <button onClick={() => alert('Button clicked!')}>Test Button</button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MinimalApp />
  </React.StrictMode>,
)