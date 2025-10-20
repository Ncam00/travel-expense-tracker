import { createContext, useContext, useState, useEffect } from 'react';

// Lazy import Firebase to handle potential errors
let auth = null;
let firebaseAuth = null;

const initializeFirebase = async () => {
  try {
    if (!auth) {
      const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } = await import('firebase/auth');
      auth = { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
      firebaseAuth = getAuth();
    }
    return { auth, firebaseAuth };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { auth: null, firebaseAuth: null };
  }
};

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renderFallback, setRenderFallback] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    
    const setupAuth = async () => {
      try {
        console.log('Setting up auth...');
        const { auth, firebaseAuth } = await initializeFirebase();
        
        if (auth && firebaseAuth) {
          console.log('Firebase initialized successfully');
          unsubscribe = auth.onAuthStateChanged(firebaseAuth, (user) => {
            console.log('Auth state changed:', user?.email || 'No user');
            setUser(user);
            setLoading(false);
            setError(null);
          });
        } else {
          // Firebase failed to initialize
          console.error('Firebase failed to initialize');
          setLoading(false);
          setError('Firebase authentication not available');
          setRenderFallback(true);
        }
      } catch (error) {
        console.error('Auth setup error:', error);
        setLoading(false);
        setError('Authentication service unavailable');
        setRenderFallback(true);
      }
    };

    // Set a timeout to force render after 3 seconds
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Auth taking too long, forcing render');
        setLoading(false);
        setRenderFallback(true);
      }
    }, 3000);

    setupAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { auth, firebaseAuth } = await initializeFirebase();
      if (auth && firebaseAuth) {
        return auth.signInWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        throw new Error('Firebase authentication not available');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email, password) => {
    try {
      const { auth, firebaseAuth } = await initializeFirebase();
      if (auth && firebaseAuth) {
        return auth.createUserWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        throw new Error('Firebase authentication not available');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { auth, firebaseAuth } = await initializeFirebase();
      if (auth && firebaseAuth) {
        return auth.signOut(firebaseAuth);
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    error
  };

  console.log('AuthProvider rendering, loading:', loading, 'user:', user?.email || 'none');

  // Always provide the context, even during loading
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};