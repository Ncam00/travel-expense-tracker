# Phase 4: Group Features - Implementation Plan

## 🚀 Overview
Transform the solo travel app into a collaborative group expense tracking platform with real-time sharing, smart debt splitting, and seamless collaboration.

## 📊 **API Architecture & Postman Testing**

### **Current Architecture**
- **Firebase Firestore**: Direct SDK integration (no REST APIs currently)
- **Mapbox API**: External REST API for geocoding/mapping
- **Frontend**: Direct Firebase SDK calls

### **Phase 4 API Strategy Options**

#### **Option A: Continue with Firebase SDK (Recommended)**
- ✅ **Pros**: Real-time updates, offline support, simple auth
- ✅ **Postman Testing**: Not needed (SDK handles everything)
- ✅ **Best for**: Rapid development, real-time collaboration

#### **Option B: Create REST API Layer**
- ✅ **Pros**: Better for Postman testing, API documentation
- ❌ **Cons**: More complex, loses real-time features
- 🔧 **Implementation**: Firebase Cloud Functions + Express

#### **Option C: Hybrid Approach**
- ✅ **Best of both**: Keep Firebase SDK + Add REST endpoints for external integrations
- ✅ **Postman Use Cases**: 
  - Trip invitation emails
  - Webhook integrations
  - Mobile app APIs
  - Third-party service integrations

### **Recommended: Option C - Hybrid Approach**

```javascript
// Current: Direct Firebase SDK
const addExpense = async (expense) => {
  return await db.collection('expenses').add(expense);
};

// New: REST API for external features
POST /api/trips/{tripId}/invite
POST /api/expenses/{expenseId}/split
GET /api/settlements/{tripId}
POST /api/notifications/send
```

## 🎯 **Phase 4A: Trip Sharing & Invitations**

### **Database Schema Updates**
```javascript
// Enhanced trips collection
{
  id: string,
  name: string,
  shareCode: string,      // 6-digit unique code
  isPublic: boolean,      // Can be joined via link
  inviteLink: string,     // Shareable URL
  members: [{
    userId: string,
    email: string,
    role: 'owner' | 'admin' | 'member',
    joinedAt: timestamp,
    invitedBy: string
  }],
  invitations: [{
    email: string,
    status: 'pending' | 'accepted' | 'declined',
    invitedAt: timestamp,
    invitedBy: string
  }]
}
```

### **Features to Implement**
1. **Trip Share Codes**
   - Generate unique 6-digit codes
   - Join trip via code input
   - Code expiration system

2. **Invitation System**
   - Email invitations (Firebase Cloud Functions)
   - Invitation links with tokens
   - Pending invitations management

3. **Member Management**
   - Role-based permissions
   - Remove/block members
   - Transfer ownership

### **API Endpoints for Postman Testing**
```
POST /api/trips/{tripId}/generateShareCode
POST /api/trips/{tripId}/invite
POST /api/trips/join/{shareCode}
GET /api/invitations/{userId}/pending
PUT /api/invitations/{inviteId}/accept
```

## 🎯 **Phase 4B: Group Expense Splitting**

### **Database Schema Updates**
```javascript
// Enhanced expenses collection
{
  // ... existing fields
  splitType: 'equal' | 'custom' | 'percentage',
  splitDetails: [{
    userId: string,
    amount: number,
    percentage?: number
  }],
  paidBy: string,
  totalAmount: number,
  isSettled: boolean,
  settlements: [{
    fromUserId: string,
    toUserId: string,
    amount: number,
    settledAt?: timestamp
  }]
}

// New: settlements collection
{
  id: string,
  tripId: string,
  fromUser: string,
  toUser: string,
  amount: number,
  reason: string,
  status: 'pending' | 'completed',
  createdAt: timestamp,
  settledAt?: timestamp
}
```

### **Smart Debt Algorithm**
```javascript
// Debt settlement algorithm
const calculateOptimalSettlements = (expenses, members) => {
  // 1. Calculate net balance for each person
  const balances = calculateNetBalances(expenses, members);
  
  // 2. Separate creditors and debtors
  const creditors = balances.filter(b => b.amount > 0);
  const debtors = balances.filter(b => b.amount < 0);
  
  // 3. Minimize number of transactions
  return minimizeTransactions(creditors, debtors);
};
```

### **Features to Implement**
1. **Expense Splitting UI**
   - Visual splitting interface
   - Equal/Custom/Percentage options
   - Real-time calculation preview

2. **Debt Dashboard**
   - "Who owes whom" visualization
   - Settlement suggestions
   - Payment tracking

3. **Settlement System**
   - Mark payments as complete
   - Settlement history
   - Dispute resolution

## 🎯 **Phase 4C: Collaboration Features**

### **Real-time Updates**
```javascript
// Firebase real-time listeners
const subscribeToTripUpdates = (tripId, callback) => {
  return db.collection('expenses')
    .where('tripId', '==', tripId)
    .onSnapshot(callback);
};
```

### **Notification System**
```javascript
// Cloud Functions for notifications
exports.sendExpenseNotification = functions.firestore
  .document('expenses/{expenseId}')
  .onCreate(async (snap, context) => {
    // Send notifications to trip members
  });
```

### **Features to Implement**
1. **Real-time Sync**
   - Live expense updates
   - Member activity feed
   - Connection status indicators

2. **Notifications**
   - New expense alerts
   - Settlement reminders
   - Trip updates

3. **Comments & Notes**
   - Expense comments
   - Trip announcements
   - Member mentions

## 🧪 **Testing Strategy with Postman**

### **Postman Collections to Create**
1. **Trip Management**
   - Create trip
   - Generate share codes
   - Send invitations
   - Manage members

2. **Expense Operations**
   - Add group expenses
   - Split calculations
   - Settlement tracking

3. **Notifications**
   - Email invitations
   - Push notifications
   - Webhook testing

### **Sample Postman Tests**
```javascript
// Test expense splitting
pm.test("Expense split calculation is correct", function () {
    const response = pm.response.json();
    const totalSplit = response.splitDetails.reduce((sum, split) => sum + split.amount, 0);
    pm.expect(totalSplit).to.equal(response.totalAmount);
});

// Test debt settlement
pm.test("Settlements minimize transactions", function () {
    const settlements = pm.response.json().settlements;
    pm.expect(settlements.length).to.be.lessThan(4); // For 4 people, max 3 transactions
});
```

## 📅 **Implementation Timeline**

### **Week 1-2: Foundation**
- [ ] Set up Cloud Functions for APIs
- [ ] Create Postman collection structure
- [ ] Implement trip sharing backend

### **Week 3-4: Splitting Logic**
- [ ] Build expense splitting UI
- [ ] Implement debt calculation algorithm
- [ ] Create settlement tracking system

### **Week 5-6: Collaboration**
- [ ] Add real-time notifications
- [ ] Implement member management
- [ ] Create activity feeds

### **Week 7-8: Testing & Polish**
- [ ] Comprehensive Postman testing
- [ ] Performance optimization
- [ ] UI/UX refinements

## 🔧 **Development Setup for Phase 4**

### **Firebase Cloud Functions Setup**
```bash
npm install -g firebase-tools
firebase init functions
cd functions && npm install express cors
```

### **Postman Environment Variables**
```json
{
  "firebase_url": "https://your-project.firebaseapp.com",
  "auth_token": "{{firebase_id_token}}",
  "test_trip_id": "{{trip_id}}",
  "test_user_id": "{{user_id}}"
}
```

## 🎯 **Success Metrics**

### **Technical**
- [ ] Real-time updates under 500ms
- [ ] Debt algorithm efficiency (O(n²) max)
- [ ] API response times under 200ms
- [ ] 99.9% uptime for notifications

### **User Experience**
- [ ] Trip invitation acceptance rate > 80%
- [ ] Settlement completion rate > 90%
- [ ] User retention in group trips > 75%
- [ ] Average time to split expense < 30 seconds

---

**Ready to build the future of group travel expense tracking! 🚀**