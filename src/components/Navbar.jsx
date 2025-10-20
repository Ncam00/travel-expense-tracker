import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform duration-300">
              <span className="text-3xl">✈️</span>
              <span className="text-gradient-blue">Travel Tracker</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={isActive('/dashboard') ? 'nav-link-active' : 'nav-link'}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/trips"
                  className={isActive('/trips') ? 'nav-link-active' : 'nav-link'}
                >
                  🎒 Trips
                </Link>
                <Link
                  to="/join"
                  className={isActive('/join') ? 'nav-link-active' : 'nav-link'}
                >
                  👥 Join Trip
                </Link>
                <Link
                  to="/expenses"
                  className={isActive('/expenses') ? 'nav-link-active' : 'nav-link'}
                >
                  💰 Expenses
                </Link>
                <Link
                  to="/analytics"
                  className={isActive('/analytics') ? 'nav-link-active' : 'nav-link'}
                >
                  📈 Analytics
                </Link>
                <Link
                  to="/travel-globe"
                  className={isActive('/travel-globe') ? 'nav-link-active' : 'nav-link'}
                >
                  🌍 Globe
                </Link>
                <Link
                  to="/testing"
                  className={isActive('/testing') ? 'nav-link-active' : 'nav-link'}
                >
                  🧪 Testing
                </Link>
                <Link
                  to="/test-trip-creation"
                  className={isActive('/test-trip-creation') ? 'nav-link-active' : 'nav-link'}
                >
                  🎒 Trip Test
                </Link>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-white/80 text-sm hidden sm:block">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-white/80 hover:text-white hover:bg-red-500/20 px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-1"
                  >
                    <span>🚪</span>
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-link"
                >
                  👋 Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-secondary text-sm px-4 py-2"
                >
                  🚀 Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
