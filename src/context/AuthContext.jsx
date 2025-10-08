import { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(getAuth(), email, password);
  };

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(getAuth(), email, password);
  };

  const logout = () => {
    return signOut(getAuth());
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);