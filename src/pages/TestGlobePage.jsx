import { useAuth } from '../context/AuthContext';

export default function TestGlobePage() {
  const { user } = useAuth();
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #1e293b, #7c3aed, #1e293b)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🌍</div>
        <h1>Test Globe Page - This Should Be Visible!</h1>
        <p style={{ marginTop: '10px', fontSize: '16px', color: '#ccc' }}>
          If you see this, the routing is working
        </p>
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#aaa' }}>
          User: {user?.email || 'No user'}
        </p>
      </div>
    </div>
  );
}
