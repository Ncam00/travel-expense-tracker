import React, { useState, useEffect } from 'react';
import { 
  createTripShareCode, 
  sendTripInvitation, 
  getTripMembers,
  removeTripMember,
  updateMemberRole 
} from '../services/tripSharingService';
import { useAuth } from '../context/AuthContext';

const TripSharingModal = ({ trip, isOpen, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('share');
  const [shareCode, setShareCode] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && trip) {
      loadTripData();
    }
  }, [isOpen, trip]);

  const loadTripData = async () => {
    try {
      setLoading(true);
      const data = await getTripMembers(trip.id);
      setMembers(data.members);
      setInvitations(data.invitations);
      setShareCode(data.shareCode || '');
      if (data.shareCode) {
        setShareUrl(`${window.location.origin}/join/${data.shareCode}`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShareCode = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await createTripShareCode(trip.id, user.uid);
      setShareCode(result.shareCode);
      setShareUrl(result.shareUrl);
      setSuccess('Share code created successfully!');
      if (onUpdate) onUpdate();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    try {
      setLoading(true);
      setError('');
      await sendTripInvitation(trip.id, user.uid, inviteEmail, personalMessage);
      setSuccess(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail('');
      setPersonalMessage('');
      loadTripData(); // Refresh data
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      setLoading(true);
      await removeTripMember(trip.id, memberUserId, user.uid);
      setSuccess('Member removed successfully');
      loadTripData();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const isOwnerOrAdmin = () => {
    return trip?.createdBy === user?.uid || 
           members.find(m => m.userId === user?.uid)?.role === 'admin';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              👥 Share "{trip?.name}"
            </h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('share')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'share' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              🔗 Share Code
            </button>
            <button
              onClick={() => setActiveTab('invite')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'invite' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              📧 Invite Members
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'members' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              👥 Members ({members.length})
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-100 p-3 rounded-lg mb-4">
              ❌ {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-500/20 border border-green-400/30 text-green-100 p-3 rounded-lg mb-4">
              ✅ {success}
            </div>
          )}

          {/* Share Code Tab */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <p className="text-white/80">
                Generate a share code that anyone can use to join this trip instantly.
              </p>
              
              {shareCode ? (
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Share Code
                    </label>
                    <div className="flex gap-2">
                      <code className="flex-1 bg-black/20 text-white p-3 rounded-lg font-mono text-lg tracking-wider">
                        {shareCode}
                      </code>
                      <button
                        onClick={() => copyToClipboard(shareCode)}
                        className="btn-secondary"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Share URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 bg-black/20 text-white p-3 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(shareUrl)}
                        className="btn-secondary"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/60 mb-4">No share code created yet</p>
                  {isOwnerOrAdmin() && (
                    <button
                      onClick={handleCreateShareCode}
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? '⏳ Creating...' : '🔗 Create Share Code'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Invite Tab */}
          {activeTab === 'invite' && (
            <div className="space-y-4">
              <p className="text-white/80">
                Send personal invitations to specific people via email.
              </p>
              
              {isOwnerOrAdmin() ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="friend@example.com"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Personal Message (Optional)
                    </label>
                    <textarea
                      value={personalMessage}
                      onChange={(e) => setPersonalMessage(e.target.value)}
                      placeholder="Hey! Want to join me on this amazing trip?"
                      rows={3}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50"
                    />
                  </div>
                  
                  <button
                    onClick={handleSendInvitation}
                    disabled={loading || !inviteEmail}
                    className="btn-primary w-full"
                  >
                    {loading ? '⏳ Sending...' : '📧 Send Invitation'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  Only trip owners and admins can send invitations
                </div>
              )}
              
              {/* Pending Invitations */}
              {invitations.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Pending Invitations</h3>
                  <div className="space-y-2">
                    {invitations.filter(inv => inv.status === 'pending').map((invitation, index) => (
                      <div key={index} className="bg-white/10 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <div className="text-white font-medium">{invitation.email}</div>
                          <div className="text-white/60 text-sm">
                            Sent {invitation.invitedAt.toDate().toLocaleDateString()}
                          </div>
                        </div>
                        <span className="text-yellow-400 text-sm">⏳ Pending</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <p className="text-white/80">
                Manage trip members and their permissions.
              </p>
              
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.userId} className="bg-white/10 rounded-lg p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {member.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{member.email}</div>
                        <div className="text-white/60 text-sm flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            member.role === 'owner' ? 'bg-purple-500/30 text-purple-200' :
                            member.role === 'admin' ? 'bg-blue-500/30 text-blue-200' :
                            'bg-gray-500/30 text-gray-200'
                          }`}>
                            {member.role}
                          </span>
                          <span>
                            Joined {member.joinedAt.toDate().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {isOwnerOrAdmin() && member.userId !== trip?.createdBy && (
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded hover:bg-red-500/20"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripSharingModal;