/**
 * Real-time Update Service
 * Manages live synchronization of trip data using Firebase listeners
 */

import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../config/firebase';

class RealTimeService {
  constructor() {
    this.listeners = new Map(); // Track active listeners
    this.connectionStatus = 'connected';
    this.activityCallbacks = new Set();
  }

  /**
   * Subscribe to real-time trip updates
   */
  subscribeToTrip(tripId, callbacks) {
    const listenerId = `trip-${tripId}`;
    
    // Unsubscribe from existing listener
    this.unsubscribe(listenerId);

    try {
      const tripRef = doc(db, 'trips', tripId);
      const unsubscribe = onSnapshot(tripRef, 
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const tripData = { id: docSnapshot.id, ...docSnapshot.data() };
            callbacks.onTripUpdate?.(tripData);
            this.logActivity(tripId, 'trip_updated', { tripName: tripData.name });
          }
        },
        (error) => {
          console.error('Trip subscription error:', error);
          callbacks.onError?.(error);
          this.connectionStatus = 'error';
        }
      );

      this.listeners.set(listenerId, unsubscribe);
      this.connectionStatus = 'connected';
      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to trip:', error);
      callbacks.onError?.(error);
      return null;
    }
  }

  /**
   * Subscribe to real-time expense updates for a trip
   */
  subscribeToExpenses(tripId, callbacks) {
    const listenerId = `expenses-${tripId}`;
    
    this.unsubscribe(listenerId);

    try {
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('tripId', '==', tripId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(expensesQuery,
        (querySnapshot) => {
          const expenses = [];
          const changes = [];

          querySnapshot.docChanges().forEach((change) => {
            const expenseData = { id: change.doc.id, ...change.doc.data() };
            
            if (change.type === 'added') {
              changes.push({ type: 'added', expense: expenseData });
              this.logActivity(tripId, 'expense_added', {
                expenseId: expenseData.id,
                amount: expenseData.amount,
                description: expenseData.description
              });
            } else if (change.type === 'modified') {
              changes.push({ type: 'modified', expense: expenseData });
              this.logActivity(tripId, 'expense_updated', {
                expenseId: expenseData.id,
                description: expenseData.description
              });
            } else if (change.type === 'removed') {
              changes.push({ type: 'removed', expense: expenseData });
              this.logActivity(tripId, 'expense_deleted', {
                expenseId: expenseData.id,
                description: expenseData.description
              });
            }
          });

          querySnapshot.forEach((doc) => {
            expenses.push({ id: doc.id, ...doc.data() });
          });

          callbacks.onExpensesUpdate?.(expenses);
          if (changes.length > 0) {
            callbacks.onExpenseChanges?.(changes);
          }
        },
        (error) => {
          console.error('Expenses subscription error:', error);
          callbacks.onError?.(error);
          this.connectionStatus = 'error';
        }
      );

      this.listeners.set(listenerId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to expenses:', error);
      callbacks.onError?.(error);
      return null;
    }
  }

  /**
   * Subscribe to real-time member activity
   */
  subscribeToMemberActivity(tripId, callbacks) {
    const listenerId = `activity-${tripId}`;
    
    this.unsubscribe(listenerId);

    try {
      const activityQuery = query(
        collection(db, 'tripActivity'),
        where('tripId', '==', tripId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(activityQuery,
        (querySnapshot) => {
          const activities = [];
          
          querySnapshot.forEach((doc) => {
            activities.push({ id: doc.id, ...doc.data() });
          });

          callbacks.onActivityUpdate?.(activities);
        },
        (error) => {
          console.error('Activity subscription error:', error);
          callbacks.onError?.(error);
        }
      );

      this.listeners.set(listenerId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to activity:', error);
      callbacks.onError?.(error);
      return null;
    }
  }

  /**
   * Subscribe to settlement updates
   */
  subscribeToSettlements(tripId, callbacks) {
    const listenerId = `settlements-${tripId}`;
    
    this.unsubscribe(listenerId);

    try {
      const settlementsQuery = query(
        collection(db, 'settlements'),
        where('tripId', '==', tripId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(settlementsQuery,
        (querySnapshot) => {
          const settlements = [];
          
          querySnapshot.docChanges().forEach((change) => {
            const settlementData = { id: change.doc.id, ...change.doc.data() };
            
            if (change.type === 'added' || change.type === 'modified') {
              if (settlementData.status === 'completed') {
                this.logActivity(tripId, 'settlement_completed', {
                  fromUser: settlementData.fromUser,
                  toUser: settlementData.toUser,
                  amount: settlementData.amount
                });
              }
            }
          });

          querySnapshot.forEach((doc) => {
            settlements.push({ id: doc.id, ...doc.data() });
          });

          callbacks.onSettlementsUpdate?.(settlements);
        },
        (error) => {
          console.error('Settlements subscription error:', error);
          callbacks.onError?.(error);
        }
      );

      this.listeners.set(listenerId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to settlements:', error);
      callbacks.onError?.(error);
      return null;
    }
  }

  /**
   * Log activity for trip members
   */
  async logActivity(tripId, action, data = {}) {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const activity = {
        tripId,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email || 'Unknown User',
        action,
        data,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'tripActivity'), activity);
      
      // Notify activity callbacks
      this.activityCallbacks.forEach(callback => {
        callback(activity);
      });
    } catch (error) {
      console.warn('Failed to log activity:', error);
    }
  }

  /**
   * Subscribe to activity notifications
   */
  onActivity(callback) {
    this.activityCallbacks.add(callback);
    
    return () => {
      this.activityCallbacks.delete(callback);
    };
  }

  /**
   * Update trip member status (online/offline)
   */
  async updateMemberStatus(tripId, status = 'online') {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const tripRef = doc(db, 'trips', tripId);

      await updateDoc(tripRef, {
        [`memberStatus.${currentUser.uid}`]: {
          status,
          lastSeen: serverTimestamp()
        }
      });
    } catch (error) {
      console.warn('Failed to update member status:', error);
    }
  }

  /**
   * Send notification to trip members
   */
  async sendNotification(tripId, notification) {
    try {
      const notificationData = {
        tripId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        recipients: notification.recipients || [],
        createdBy: JSON.parse(localStorage.getItem('currentUser') || '{}').uid,
        createdAt: serverTimestamp(),
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      
      // Log as activity
      this.logActivity(tripId, 'notification_sent', {
        type: notification.type,
        title: notification.title
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return this.connectionStatus;
  }

  /**
   * Unsubscribe from a specific listener
   */
  unsubscribe(listenerId) {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
    }
  }

  /**
   * Unsubscribe from all listeners
   */
  unsubscribeAll() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
    this.activityCallbacks.clear();
  }

  /**
   * Subscribe to all trip data at once
   */
  subscribeToTripData(tripId, callbacks) {
    const subscriptions = [];

    // Subscribe to trip updates
    subscriptions.push(this.subscribeToTrip(tripId, {
      onTripUpdate: callbacks.onTripUpdate,
      onError: callbacks.onError
    }));

    // Subscribe to expenses
    subscriptions.push(this.subscribeToExpenses(tripId, {
      onExpensesUpdate: callbacks.onExpensesUpdate,
      onExpenseChanges: callbacks.onExpenseChanges,
      onError: callbacks.onError
    }));

    // Subscribe to activity
    subscriptions.push(this.subscribeToMemberActivity(tripId, {
      onActivityUpdate: callbacks.onActivityUpdate,
      onError: callbacks.onError
    }));

    // Subscribe to settlements
    subscriptions.push(this.subscribeToSettlements(tripId, {
      onSettlementsUpdate: callbacks.onSettlementsUpdate,
      onError: callbacks.onError
    }));

    // Update member status
    this.updateMemberStatus(tripId, 'online');

    return () => {
      subscriptions.forEach(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
      this.updateMemberStatus(tripId, 'offline');
    };
  }
}

// Export singleton instance
export const realTimeService = new RealTimeService();
export default realTimeService;