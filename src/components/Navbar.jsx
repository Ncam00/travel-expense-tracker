import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="glass border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-white text-xl sm:text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform duration-300">
              <span className="text-2xl sm:text-3xl">✈️</span>
              <span className="text-gradient-blue hidden sm:inline">Travel Tracker</span>
              <span className="text-gradient-blue sm:hidden">TT</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {user ? (
              <>
                <Link to="/dashboard" className={isActive('/dashboard') ? 'nav-link-active' : 'nav-link'}>
                  📊 Dashboard
                </Link>
                <Link to="/trips" className={isActive('/trips') ? 'nav-link-active' : 'nav-link'}>
                  🎒 Trips
                </Link>
                <Link to="/join" className={isActive('/join') ? 'nav-link-active' : 'nav-link'}>
                  👥 Join Trip
                </Link>
                <Link to="/expenses" className={isActive('/expenses') ? 'nav-link-active' : 'nav-link'}>
                  💰 Expenses
                </Link>
                <Link to="/analytics" className={isActive('/analytics') ? 'nav-link-active' : 'nav-link'}>
                  📈 Analytics
                </Link>
                {/* Hidden dev tabs - uncomment for testing */}
                {/* <Link to="/testing" className={isActive('/testing') ? 'nav-link-active' : 'nav-link'}>🧪 Testing</Link>
                <Link to="/test-trip-creation" className={isActive('/test-trip-creation') ? 'nav-link-active' : 'nav-link'}>🎒 Trip Test</Link> */}
                
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-white/80 text-sm">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-white/80 hover:text-white hover:bg-red-500/20 px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-1"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">👋 Sign In</Link>
                <Link to="/signup" className="btn-secondary text-sm px-4 py-2">🚀 Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            {user && (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 py-4 space-y-2 animate-fade-in">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/trips"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive('/trips') 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  🎒 Trips
                </Link>
                <Link
                  to="/join"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive('/join') 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  👥 Join Trip
                </Link>
                <Link
                  to="/expenses"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive('/expenses') 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  💰 Expenses
                </Link>
                <Link
                  to="/analytics"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive('/analytics') 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  📈 Analytics
                </Link>
                
                <div className="border-t border-white/20 pt-3 mt-3">
                  <div className="px-4 py-2 text-white/60 text-sm">
                    {user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-lg text-white/80 hover:bg-red-500/20 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  👋 Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:shadow-lg transition-all"
                >
                  🚀 Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
