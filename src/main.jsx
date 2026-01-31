import React from 'react'
import ReactDOM from 'react-dom/client'
import CleanApp from './CleanApp.jsx'
import './index.css'

// Simple test components without complex dependencies
function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">🎯 Travel Tracker</h1>
        <p className="text-gray-600 mb-8">Step 1: Basic routing test - This should work with Tailwind CSS</p>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Navigation Test</h2>
          <div className="space-y-2">
            <Link to="/signup" className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Test Signup Page
            </Link>
            <Link to="/login" className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Test Login Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function TestSignup() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🎯 Signup Test</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="mb-4">This is a simple signup page test (no Firebase yet)</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}

function TestLogin() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🔐 Login Test</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="mb-4">This is a simple login page test (no Firebase yet)</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}

function SimpleApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<TestSignup />} />
        <Route path="/login" element={<TestLogin />} />
      </Routes>
    </Router>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CleanApp />
  </React.StrictMode>,
)
