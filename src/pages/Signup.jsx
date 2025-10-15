import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();  const handleChange = (e) => {    const { name, value } = e.target;    setFormData(prev => ({      ...prev,      [name]: value    }));  };  const handleSubmit = async (e) => {    e.preventDefault();    setError('');        if (formData.password !== formData.confirmPassword) {      setError('Passwords do not match');      return;    }    if (formData.password.length < 6) {      setError('Password must be at least 6 characters');      return;    }        try {      setLoading(true);      await signup(formData.email, formData.password);      navigate('/dashboard');    } catch (err) {      setError(err.message || 'Failed to create an account');    } finally {      setLoading(false);    }  };  return (    <div className="min-h-[80vh] flex items-center justify-center px-4">      <div className="max-w-md w-full">        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>        <div className="bg-white p-8 rounded-lg shadow-sm">          {error && (            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">              {error}            </div>          )}                    <form onSubmit={handleSubmit} className="space-y-6">            <div>              <label className="block text-sm font-medium text-gray-700 mb-2">                Email Address              </label>              <input                type="email"                name="email"                value={formData.email}                onChange={handleChange}                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"                required                disabled={loading}              />            </div>            <div>              <label className="block text-sm font-medium text-gray-700 mb-2">                Password              </label>              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
