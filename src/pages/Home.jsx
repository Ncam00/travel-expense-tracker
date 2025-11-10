import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20 page-transition">
          <div className="float-animation mb-8">
            <span className="text-8xl block mb-6">✈️</span>
          </div>
          <h1 className="heading-xl text-white mb-6 text-gradient">
            Travel Expense Tracker
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed">
            Plan your trips, track expenses, and split costs with friends.{' '}
            Make your travel budgeting stress-free with our beautiful, intuitive platform.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="btn-primary"
              >
                🚀 Get Started Free
              </Link>
              <Link
                to="/login"
                className="btn-secondary"
              >
                👋 Welcome Back
              </Link>
            </div>
          )}
          {user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/dashboard"
                className="btn-primary"
              >
                📊 Go to Dashboard
              </Link>
              <Link
                to="/trips"
                className="btn-secondary"
              >
                🎒 View My Trips
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="card hover-lift text-center p-8 group">
            <div className="text-6xl mb-6 block group-hover:scale-110 transition-transform duration-300">✈️</div>
            <h2 className="text-2xl font-bold mb-4 text-white">Trip Planning</h2>
            <p className="text-white/70 leading-relaxed">
              Organize your trips and set budgets before you travel. Create detailed itineraries with smart budget allocation.
            </p>
          </div>
          <div className="card hover-lift text-center p-8 group">
            <div className="text-6xl mb-6 block group-hover:scale-110 transition-transform duration-300">📊</div>
            <h2 className="text-2xl font-bold mb-4 text-white">Expense Tracking</h2>
            <p className="text-white/70 leading-relaxed">
              Track your spending in real-time with detailed categories and beautiful analytics visualizations.
            </p>
          </div>
          <div className="card hover-lift text-center p-8 group">
            <div className="text-6xl mb-6 block group-hover:scale-110 transition-transform duration-300">👥</div>
            <h2 className="text-2xl font-bold mb-4 text-white">Group Collaboration</h2>
            <p className="text-white/70 leading-relaxed">
              Plan together! Share activities, accommodation, shopping, and transportation with estimated costs. Vote and collaborate in real-time.
            </p>
          </div>
        </div>

        {/* New Features Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="card p-8">
            <h3 className="text-3xl font-bold text-white mb-6">🗺️ Location Tracking</h3>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Interactive maps with expense markers
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                GPS location detection
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Transport mode tracking
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Location-based analytics
              </li>
            </ul>
          </div>
          <div className="card p-8">
            <h3 className="text-3xl font-bold text-white mb-6">📈 Smart Analytics</h3>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Real-time spending insights
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Category breakdown charts
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Budget vs actual comparisons
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Trend analysis over time
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center card p-12 glow-effect">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to simplify your travel expenses?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who manage their budgets effectively with our cutting-edge platform
          </p>
          {!user && (
            <Link
              to="/signup"
              className="btn-primary text-lg px-8 py-4"
            >
              🌟 Start Tracking Now
            </Link>
          )}
          {user && (
            <Link
              to="/expenses"
              className="btn-primary text-lg px-8 py-4"
            >
              💰 Track New Expense
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
