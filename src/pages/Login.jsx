import { useState } from 'react';import { Link, useNavigate } from 'react-router-dom';import { useAuth } from '../context/AuthContext';export default function Login() {  const [email, setEmail] = useState('');  const [password, setPassword] = useState('');  const [error, setError] = useState('');  const [loading, setLoading] = useState(false);  const navigate = useNavigate();  const { login } = useAuth();  const handleSubmit = async (e) => {    e.preventDefault();    setError('');    setLoading(true);    try {      await login(email, password);      navigate('/dashboard');    } catch (err) {      setError('Invalid email or password');    } finally {      setLoading(false);    }  };  return (    <div className="min-h-[80vh] flex items-center justify-center px-4">      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">        <div>          <h1 className="text-3xl font-bold text-center text-gray-900">            Welcome Back          </h1>          <p className="mt-2 text-center text-gray-600">            Track your travel expenses with ease          </p>        </div>        {error && (          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">            <span className="block sm:inline">{error}</span>          </div>        )}        <form onSubmit={handleSubmit} className="space-y-6">          <div>            <label className="block text-sm font-medium text-gray-700">              Email            </label>            <input              type="email"              value={email}              onChange={(e) => setEmail(e.target.value)}              className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"              required            />          </div>          <div>            <label className="block text-sm font-medium text-gray-700">              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <Link 
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center">
            <span className="text-gray-600">Don't have an account?</span>
            {' '}
            <Link 
              to="/signup"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
