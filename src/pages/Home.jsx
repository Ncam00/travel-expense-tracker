import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();  return (    <div className="max-w-7xl mx-auto px-4 py-12">      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Travel Expense Tracker
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Plan your trips, track expenses, and split costs with friends.{' '}
          Make your travel budgeting stress-free.
        </p>
        {!user && (
          <div className="mt-8 space-x-4">
            <Link
              to="/signup"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-block border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-gray-400 transition-colors"
            >
              Log In
            </Link>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6 border rounded-lg">
          <span className="text-4xl mb-4 block">✈️</span>
          <h2 className="text-xl font-semibold mb-2">Trip Planning</h2>
          <p className="text-gray-600">
            Organize your trips and set budgets before you travel
          </p>
        </div>
        <div className="text-center p-6 border rounded-lg">
          <span className="text-4xl mb-4 block">📊</span>
          <h2 className="text-xl font-semibold mb-2">Expense Tracking</h2>
          <p className="text-gray-600">
            Track your spending in real-time with detailed categories
          </p>
        </div>
        <div className="text-center p-6 border rounded-lg">
          <span className="text-4xl mb-4 block">👥</span>
          <h2 className="text-xl font-semibold mb-2">Group Expenses</h2>
          <p className="text-gray-600">
            Split costs fairly among travel companions
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-4">
          Ready to simplify your travel expenses?
        </h2>
        <p className="text-gray-600 mb-6">
          Join thousands of travelers who manage their budgets effectively
        </p>
        {!user && (
          <Link
            to="/signup"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Tracking Now
          </Link>
        )}
      </div>
    </div>
  );
}
