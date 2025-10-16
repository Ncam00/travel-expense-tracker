/**
 * Notification Service
 * Manages in-app notifications, alerts, and member communication
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { realTimeService } from './realTimeService';

class NotificationService {
  constructor() {
    this.listeners = new Map();
    this.notificationCallbacks = new Set();
    this.isInitialized = false;
    this.permissions = 'default';
  }

  /**
   * Initialize notification service
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request browser notification permission
      if ('Notification' in window) {
        this.permissions = await Notification.requestPermission();
      }

      this.isInitialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.warn('Failed to initialize notifications:', error);
    }
  }

  /**
   * Subscribe to user notifications
   */
  subscribeToNotifications(userId, callback) {
    const listenerId = `notifications-${userId}`;
    
    this.unsubscribe(listenerId);

    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipients', 'array-contains', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(notificationsQuery,
        (querySnapshot) => {
          const notifications = [];
          
          querySnapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const notification = { id: change.doc.id, ...change.doc.data() };
              notifications.push(notification);
              
              // Show browser notification for new notifications
              this.showBrowserNotification(notification);
              
              // Trigger callback for new notifications
              this.notificationCallbacks.forEach(cb => cb(notification));
            }
          });

          querySnapshot.forEach((doc) => {
            const notification = { id: doc.id, ...doc.doc.data() };
            if (!notifications.find(n => n.id === notification.id)) {
              notifications.push(notification);
            }
          });

          callback(notifications);
        },
        (error) => {
          console.error('Notifications subscription error:', error);
        }
      );

      this.listeners.set(listenerId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      return null;
    }
  }

  /**
   * Send expense notification to trip members
   */
  async sendExpenseNotification(tripId, expense, action = 'added') {
    try {
      const trip = await this.getTripData(tripId);
      if (!trip) return;

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const memberIds = trip.members?.map(m => m.userId).filter(id => id !== currentUser.uid) || [];

      const notification = {
        type: 'expense',
        title: `${action === 'added' ? 'New' : 'Updated'} Expense`,
        message: `${currentUser.displayName || 'Someone'} ${action} expense: ${expense.description} ($${expense.amount})`,
        data: {
          tripId,
          expenseId: expense.id,
          action,
          amount: expense.amount,
          description: expense.description
        },
        recipients: memberIds,
        priority: 'normal',
        actionUrl: `/trips/${tripId}`
      };

      await realTimeService.sendNotification(tripId, notification);
    } catch (error) {
      console.error('Failed to send expense notification:', error);
    }
  }

  /**
   * Send settlement notification
   */
  async sendSettlementNotification(tripId, settlement, action = 'created') {
    try {
      const trip = await this.getTripData(tripId);
      if (!trip) return;

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const recipients = [settlement.fromUser, settlement.toUser].filter(id => id !== currentUser.uid);

      let message = '';
      if (action === 'created') {
        message = `Settlement created: $${settlement.amount} from ${settlement.fromUserName} to ${settlement.toUserName}`;
      } else if (action === 'completed') {
        message = `Settlement completed: $${settlement.amount} payment confirmed`;
      }

      const notification = {
        type: 'settlement',
        title: 'Settlement Update',
        message,
        data: {
          tripId,
          settlementId: settlement.id,
          action,
          amount: settlement.amount
        },
        recipients,
        priority: 'high',
        actionUrl: `/trips/${tripId}/settlements`
      };

      await realTimeService.sendNotification(tripId, notification);
    } catch (error) {
      console.error('Failed to send settlement notification:', error);
    }
  }

  /**
   * Send trip invitation notification
   */
  async sendTripInvitationNotification(tripId, invitedUserEmail) {
    try {
      const trip = await this.getTripData(tripId);
      if (!trip) return;

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      const notification = {
        type: 'invitation',
        title: 'Trip Invitation',
        message: `${currentUser.displayName || 'Someone'} invited you to join "${trip.name}"`,
        data: {
          tripId,
          tripName: trip.name,
          invitedBy: currentUser.uid,
          shareCode: trip.shareCode
        },
        recipients: [], // Will be sent via email
        priority: 'high',
        actionUrl: `/join-trip?code=${trip.shareCode}`
      };

      await realTimeService.sendNotification(tripId, notification);
    } catch (error) {
      console.error('Failed to send invitation notification:', error);
    }
  }

  /**
   * Send member activity notification
   */
  async sendMemberActivityNotification(tripId, activity) {
    try {
      const trip = await this.getTripData(tripId);
      if (!trip) return;

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const memberIds = trip.members?.map(m => m.userId).filter(id => id !== currentUser.uid) || [];

      let message = '';
      switch (activity.action) {
        case 'joined_trip':
          message = `${activity.userName} joined the trip`;
          break;
        case 'left_trip':
          message = `${activity.userName} left the trip`;
          break;
        case 'updated_trip':
          message = `${activity.userName} updated trip details`;
          break;
        default:
          message = `${activity.userName} performed an action`;
      }

      const notification = {
        type: 'activity',
        title: 'Trip Activity',
        message,
        data: {
          tripId,
          activity: activity.action,
          userId: activity.userId
        },
        recipients: memberIds,
        priority: 'low',
        actionUrl: `/trips/${tripId}`
      };

      await realTimeService.sendNotification(tripId, notification);
    } catch (error) {
      console.error('Failed to send activity notification:', error);
    }
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(notification) {
    if (this.permissions !== 'granted' || !('Notification' in window)) {
      return;
    }

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'high'
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Auto close after 5 seconds for normal priority
      if (notification.priority !== 'high') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    } catch (error) {
      console.warn('Failed to show browser notification:', error);
    }
  }

  /**
   * Show in-app toast notification
   */
  showToast(message, type = 'info', duration = 3000) {
    const toastEvent = new CustomEvent('showToast', {
      detail: { message, type, duration }
    });
    window.dispatchEvent(toastEvent);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        readAt: serverTimestamp(),
        isRead: true
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipients', 'array-contains', userId),
        where('isRead', '!=', true)
      );

      const snapshot = await getDocs(notificationsQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Subscribe to notification events
   */
  onNotification(callback) {
    this.notificationCallbacks.add(callback);
    
    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  /**
   * Get trip data helper
   */
  async getTripData(tripId) {
    try {
      const tripRef = doc(db, 'trips', tripId);
      const tripSnapshot = await getDocs(query(collection(db, 'trips'), where('__name__', '==', tripId)));
      
      if (!tripSnapshot.empty) {
        const tripDoc = tripSnapshot.docs[0];
        return { id: tripDoc.id, ...tripDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Failed to get trip data:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from listener
   */
  unsubscribe(listenerId) {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
    }
  }

  /**
   * Cleanup all listeners
   */
  cleanup() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
    this.notificationCallbacks.clear();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;