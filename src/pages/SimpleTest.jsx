/**
 * Simple Test Page - No dependencies
 * Basic React test to check if the app is working
 */

import React from 'react';

const SimpleTest = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '2rem'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          color: '#333'
        }}>
          🎉 React is Working!
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: '#666',
          marginBottom: '2rem'
        }}>
          Your Travel Expense Tracker is ready for testing
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <a 
            href="/" 
            style={{
              background: '#4F46E5',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🏠 Home Page
          </a>
          
          <a 
            href="/login" 
            style={{
              background: '#059669',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🔑 Login
          </a>
          
          <a 
            href="/signup" 
            style={{
              background: '#DC2626',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            📝 Sign Up
          </a>
        </div>

        <div style={{
          background: '#F3F4F6',
          padding: '1.5rem',
          borderRadius: '10px',
          marginBottom: '1rem'
        }}>
          <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>
            ✅ What's Working:
          </h3>
          <ul style={{
            textAlign: 'left',
            color: '#6B7280',
            listStyle: 'none',
            padding: 0
          }}>
            <li>✓ React Application</li>
            <li>✓ Vite Development Server</li>
            <li>✓ CSS Styling</li>
            <li>✓ Component Rendering</li>
          </ul>
        </div>

        <div style={{
          background: '#FEF3C7',
          padding: '1rem',
          borderRadius: '10px',
          border: '1px solid #F59E0B'
        }}>
          <p style={{
            color: '#92400E',
            margin: 0,
            fontSize: '0.9rem'
          }}>
            <strong>⚠️ Debug Mode:</strong> If other pages are blank, there might be an issue with Firebase or authentication context.
          </p>
        </div>

        <div style={{
          marginTop: '2rem',
          fontSize: '0.8rem',
          color: '#9CA3AF'
        }}>
          Server: localhost:3004 | Current Time: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default SimpleTest;