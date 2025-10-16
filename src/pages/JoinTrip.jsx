import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { joinTripByCode, acceptTripInvitation } from '../services/tripSharingService';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const JoinTrip = () => {
  const { code, token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && code) {
      handleJoinByCode(code);
    }
  }, [user, code]);

  useEffect(() => {
    if (user && token) {
      handleAcceptInvitation(token);
    }
  }, [user, token]);

  const handleJoinByCode = async (shareCode) => {
    if (!user) {
      setError('Please log in to join a trip');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await joinTripByCode(shareCode, user.uid, user.email);
      setResult(result);
      
      // Redirect to trip after 3 seconds
      setTimeout(() => {
        navigate(`/trips/${result.tripId}`);
      }, 3000);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (inviteToken) => {
    if (!user) {
      setError('Please log in to accept this invitation');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await acceptTripInvitation(inviteToken, user.uid, user.email);
      setResult(result);
      
      // Redirect to trip after 3 seconds
      setTimeout(() => {
        navigate(`/trips/${result.tripId}`);
      }, 3000);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualJoin = () => {
    if (manualCode.trim()) {
      handleJoinByCode(manualCode.trim().toUpperCase());
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="card-solid p-8 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
              <p className="text-gray-600 mb-6">
                You need to be logged in to join a trip.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary w-full"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="btn-secondary w-full"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="card-solid p-8 text-center">
              <div className="spinner mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {token ? 'Accepting Invitation...' : 'Joining Trip...'}
              </h2>
              <p className="text-gray-600">Please wait while we process your request.</p>
            </div>
          )}

          {/* Success State */}
          {result && !loading && (
            <div className="card-solid p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {result.alreadyMember ? 'Already a Member!' : 'Welcome Aboard!'}
              </h2>
              <p className="text-gray-600 mb-4">{result.message}</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 font-medium">Trip: {result.tripName}</p>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Redirecting to trip dashboard in 3 seconds...
              </p>
              <button
                onClick={() => navigate(`/trips/${result.tripId}`)}
                className="btn-primary w-full"
              >
                Go to Trip Dashboard
              </button>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="card-solid p-8 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Join</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
              
              {!code && !token && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Trip Code
                    </label>
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center font-mono text-lg tracking-wider"
                      maxLength={6}
                    />
                  </div>
                  <button
                    onClick={handleManualJoin}
                    disabled={!manualCode.trim()}
                    className="btn-primary w-full"
                  >
                    Join Trip
                  </button>
                </div>
              )}
              
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => navigate('/trips')}
                  className="btn-secondary w-full"
                >
                  View My Trips
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Manual Join Form (when no code in URL) */}
          {!code && !token && !result && !error && !loading && (
            <div className="card-solid p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎒</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Join a Trip</h2>
                <p className="text-gray-600">
                  Enter a trip share code to join an existing trip.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Share Code
                  </label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center font-mono text-lg tracking-wider"
                    maxLength={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the 6-character code shared by the trip organizer
                  </p>
                </div>
                
                <button
                  onClick={handleManualJoin}
                  disabled={!manualCode.trim() || loading}
                  className="btn-primary w-full"
                >
                  {loading ? '⏳ Joining...' : '🚀 Join Trip'}
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Don't have a trip code?
                </p>
                <button
                  onClick={() => navigate('/trips')}
                  className="btn-secondary w-full"
                >
                  Create Your Own Trip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JoinTrip;