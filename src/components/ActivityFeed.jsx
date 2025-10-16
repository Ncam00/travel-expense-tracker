/**
 * ActivityFeed Component
 * Displays real-time activity feed for trip members
 */

import React, { useState, useEffect, useRef } from 'react';
import { realTimeService } from '../services/realTimeService';
import { notificationService } from '../services/notificationService';

const ActivityFeed = ({ tripId, className = '' }) => {
  const [activities, setActivities] = useState([]);
  const [memberStatuses, setMemberStatuses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const feedRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!tripId) return;

    let mounted = true;
    setIsLoading(true);

    // Subscribe to real-time activity
    const unsubscribe = realTimeService.subscribeToMemberActivity(tripId, {
      onActivityUpdate: (newActivities) => {
        if (!mounted) return;
        setActivities(newActivities);
        setIsLoading(false);
        setConnectionStatus('connected');
        
        // Auto-scroll to bottom for new activities
        setTimeout(() => {
          if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
          }
        }, 100);
      },
      onError: (error) => {
        if (!mounted) return;
        console.error('Activity feed error:', error);
        setConnectionStatus('error');
        setIsLoading(false);
      }
    });

    unsubscribeRef.current = unsubscribe;

    // Update connection status
    const statusInterval = setInterval(() => {
      if (mounted) {
        setConnectionStatus(realTimeService.getConnectionStatus());
      }
    }, 5000);

    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      clearInterval(statusInterval);
    };
  }, [tripId]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return '';
    }
  };

  const getActivityIcon = (action) => {
    const iconMap = {
      trip_updated: '✏️',
      expense_added: '💰',
      expense_updated: '📝',
      expense_deleted: '🗑️',
      settlement_completed: '✅',
      member_joined: '👋',
      member_left: '👋',
      notification_sent: '🔔',
      trip_created: '🎯',
      default: '📋'
    };
    
    return iconMap[action] || iconMap.default;
  };

  const getActivityMessage = (activity) => {
    const { action, userName, data } = activity;
    
    switch (action) {
      case 'trip_updated':
        return `${userName} updated trip details`;
      case 'expense_added':
        return `${userName} added expense: ${data.description} ($${data.amount})`;
      case 'expense_updated':
        return `${userName} updated expense: ${data.description}`;
      case 'expense_deleted':
        return `${userName} deleted expense: ${data.description}`;
      case 'settlement_completed':
        return `Settlement completed: $${data.amount}`;
      case 'member_joined':
        return `${userName} joined the trip`;
      case 'member_left':
        return `${userName} left the trip`;
      case 'notification_sent':
        return `${userName} sent a ${data.type} notification`;
      case 'trip_created':
        return `${userName} created the trip`;
      default:
        return `${userName} performed an action`;
    }
  };

  const getActivityColor = (action) => {
    const colorMap = {
      expense_added: 'text-green-600',
      expense_updated: 'text-blue-600',
      expense_deleted: 'text-red-600',
      settlement_completed: 'text-emerald-600',
      trip_updated: 'text-purple-600',
      member_joined: 'text-indigo-600',
      member_left: 'text-orange-600',
      default: 'text-gray-600'
    };
    
    return colorMap[action] || colorMap.default;
  };

  const ConnectionStatus = () => (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus === 'connected' ? 'bg-green-500' :
        connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
      }`} />
      <span className="text-gray-600">
        {connectionStatus === 'connected' ? 'Live' :
         connectionStatus === 'error' ? 'Offline' : 'Connecting...'}
      </span>
    </div>
  );

  if (isLoading) {
    return (
      <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Activity Feed</h3>
          <ConnectionStatus />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Activity Feed</h3>
          <ConnectionStatus />
        </div>
      </div>

      <div 
        ref={feedRef}
        className="max-h-96 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500">No activity yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Trip activities will appear here as they happen
            </p>
          </div>
        ) : (
          <>
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/50 transition-colors group"
              >
                <div className="text-2xl flex-shrink-0">
                  {getActivityIcon(activity.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${getActivityColor(activity.action)} leading-relaxed`}>
                    {getActivityMessage(activity)}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <time className="text-xs text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </time>
                    
                    {activity.data?.amount && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        ${activity.data.amount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="text-gray-400 hover:text-gray-600 text-xs p-1"
                    onClick={() => notificationService.showToast(`Activity: ${activity.action}`, 'info')}
                  >
                    ℹ️
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {activities.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500 text-center">
            Showing {activities.length} recent activities
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;