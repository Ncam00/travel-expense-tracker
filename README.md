# travel
# Travel Expense Tracker

A comprehensive travel planning and expense tracking application with group expense splitting and 3D travel visualization.

## 🎯 Project Overview

This app helps travelers:
- Plan and budget trips effectively ✅
- Track daily spending and expenses by location ✅
- Split costs fairly among group members ✅ **COMPLETE!**
- Visualize travel history on an interactive 3D globe (coming in Phase 5)

**🚀 Current Status: Phase 5 Complete - Amazing 3D Globe!**
- Interactive 3D Earth with realistic textures and timeline controls
- Animated travel routes with transport mode visualization
- Advanced spending indicators and location plotting
- Phase 4: Complete group collaboration features
- Phase 3: Beautiful glass morphism design with gradient backgrounds
- Real-time collaborative expense tracking with live updates
- Smart expense splitting with debt settlement algorithms

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/travel-expense-tracker.git
cd travel-expense-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_MAPBOX_TOKEN=your_mapbox_token
```

4. **Run development server**
```bash
npm run dev
```

## 📋 Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Goal: Basic app structure and authentication**

- [x] Set up project with Vite + React
- [x] Install core dependencies (React Router, Firebase, TailwindCSS)
- [x] Configure Firebase project (Authentication, Firestore)
- [x] Create basic app layout and navigation
- [x] Implement user authentication (sign up, login, logout)
- [x] Create user profile page

### Phase 2: Core Features (Weeks 3-5) ✅ **COMPLETE**
**Goal: Trip creation and basic expense tracking**

- [x] Design and implement database schema
- [x] Create trip creation flow
- [x] Build expense entry form
- [x] Implement expense categories
- [x] Create trip dashboard with budget overview
- [x] Add expense list with filtering
- [x] Build daily spending view

### Phase 3: Location Tracking (Weeks 6-7) ✅ **COMPLETE**
**Goal: Associate expenses with locations**

- [x] Integrate Mapbox or Google Maps API
- [x] Add location picker to expense entry
- [x] Create location-based spending breakdown
- [x] Implement basic 2D map view of visited locations
- [x] Add transport mode selection (plane, train, car, etc.)
- [x] **BONUS**: Beautiful UI/UX design overhaul
- [x] **BONUS**: Glass morphism navigation and cards
- [x] **BONUS**: Gradient backgrounds with animations
- [x] **BONUS**: Modern typography and responsive design

### Phase 4: Group Features (Weeks 8-10) ✅ **COMPLETE**
**Goal: Multi-user trips and expense splitting**

- [x] Implement trip sharing/invitations
- [x] Create group member management
- [x] Build expense splitting logic (equal, custom, percentages)
- [x] Implement debt calculation algorithm
- [x] Create "Who owes whom" settlement view
- [x] Add payment tracking and settlement marking
- [x] Build notification system for shared expenses
- [x] **BONUS**: Real-time collaboration with live updates
- [x] **BONUS**: Activity feed and member status tracking
- [x] **BONUS**: Toast notification system

### Phase 5: 3D Visualization (Weeks 11-13) ✅ **COMPLETE**
**Goal: Interactive 3D globe of travel history**

- [x] Set up Three.js/React Three Fiber for 3D rendering
- [x] Create 3D globe component with realistic Earth textures
- [x] Plot visited locations on globe with interactive pins
- [x] Implement interactive controls (zoom, rotate, pan)
- [x] Create visual indicators for spending levels (cylinder height)
- [x] Add animated travel routes with transport mode visualization
- [x] Implement timeline controls to replay trips chronologically
- [x] Add advanced spending heat map overlay with color coding
- [x] Create trip animation sequences with smooth transitions
- [x] **BONUS**: Transport mode color coding (plane/train/car/boat/bus)
- [x] **BONUS**: Play/pause/reset timeline controls
- [x] **BONUS**: Interactive route animations and travel indicators
- [x] **BONUS**: Enhanced hover tooltips and location details

### Phase 6: Polish & Launch (Weeks 14-16) ✅ **COMPLETE!**
**Goal: Production-ready application**

- [x] Add receipt photo upload with Firebase Storage ✅ **DONE!**
- [x] Implement real-time currency conversion with 20+ currencies ✅ **DONE!**
- [x] Build comprehensive analytics dashboard with progress bars & alerts ✅ **DONE!**
- [x] Optimize mobile responsive design with hamburger menu ✅ **DONE!**
- [x] Add mobile touch controls for 3D globe (pinch-zoom, rotation) ✅ **DONE!**
- [x] Performance optimizations for mobile devices ✅ **DONE!**
- [x] Connect 3D globe to real Firebase data ✅ **DONE!**
- [x] Implement data export (PDF trip reports, CSV expense data) ✅ **DONE!**
- [ ] Add offline support (PWA) with service workers (Future Enhancement)
- [ ] Write comprehensive test suite (unit, integration, E2E) (Future Enhancement)
- [ ] Deploy to production (Vercel/Netlify) with CI/CD (Ready for Deployment!)

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Three.js/Cesium** - 3D visualization
- **Mapbox GL JS** - Mapping

### Backend
- **Firebase Authentication** - User management
- **Firestore** - Database
- **Firebase Storage** - File storage
- **Firebase Cloud Functions** - Serverless functions (if needed)

### Additional Libraries
- **date-fns** - Date manipulation
- **recharts** - Data visualization
- **react-query** - Data fetching
- **zustand** - State management

## 📊 Database Schema

### Collections

**users**
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: timestamp
}
```

**trips**
```javascript
{
  id: string,
  name: string,
  startDate: timestamp,
  endDate: timestamp,
  totalBudget: number,
  currency: string,
  createdBy: string,
  members: [userId],
  createdAt: timestamp
}
```

**expenses**
```javascript
{
  id: string,
  tripId: string,
  amount: number,
  currency: string,
  category: string,
  description: string,
  location: {
    name: string,
    coordinates: { lat: number, lng: number }
  },
  paidBy: userId,
  splitBetween: [userId],
  transportMode: string,
  date: timestamp,
  receiptURL: string
}
```

**settlements**
```javascript
{
  id: string,
  tripId: string,
  from: userId,
  to: userId,
  amount: number,
  settled: boolean,
  settledAt: timestamp
}
```

## 🧮 Debt Settlement Algorithm

The app uses a simplified debt settlement algorithm:

1. Calculate net balance for each person (total paid - total owed)
2. Separate into creditors (positive balance) and debtors (negative balance)
3. Match largest debtor with largest creditor
4. Create settlement transactions to minimize total number of payments

## 🗺️ 3D Globe Features

- Interactive 3D Earth visualization
- Location pins with spending data
- Animated travel routes
- Color-coded by transport mode (plane, car, train, boat)
- Timeline scrubber to replay trips
- Spending heat map overlay

## � Data Export Features ✅ **NEW!**

### PDF Trip Reports
- **Professional Formatting**: Multi-page reports with branded headers
- **Comprehensive Sections**:
  - Trip metadata (dates, duration, destination)
  - Financial summary (budget, spent, remaining, % used)
  - Category breakdown table with percentages
  - Detailed expense list (date, description, location, amount)
  - Daily spending timeline
- **Smart Pagination**: Automatic page breaks and page numbering
- **Color Coding**: Gradient headers, striped tables, visual hierarchy
- **Export from**: Individual trip cards in Trips page

### CSV Exports
- **Expense CSV**: All expense details in spreadsheet format
  - 13 columns including location coordinates
  - Compatible with Excel, Google Sheets, accounting software
  - Proper date and currency formatting
  - Array/object data flattened appropriately
- **Trip Summary CSV**: Financial overview
  - Budget and spending stats
  - Category breakdown with percentages
  - Daily spending timeline
- **Settlement CSV**: Debt tracking for group trips
- **Export Options**: Available in Trips page and Expense Tracker

### Use Cases
- 📋 Tax records and expense reimbursement
- 🤝 Sharing trip details with travel companions
- 💼 Import into QuickBooks, Excel, etc.
- 📁 Offline archival of travel history
- 📈 Custom analysis in spreadsheet software

## �📱 Features List

### MVP Features
- ✅ User authentication
- ✅ Trip creation and management
- ✅ Expense tracking
- ✅ Budget monitoring
- ✅ Basic expense splitting

### Advanced Features
- ✅ Location-based spending
- ✅ Group debt calculation
- ✅ Real-time collaboration
- ✅ Trip sharing & invitations
- ✅ Smart expense splitting
- ✅ Activity feeds & notifications
- ✅ 3D travel visualization with interactive globe
- ✅ Receipt storage with Firebase Storage photo upload ✅ **DONE!**
- ✅ Currency conversion with real-time exchange rates (20+ currencies) ✅ **DONE!**
- ✅ Mobile responsive design with hamburger navigation ✅ **DONE!**
- ✅ Touch-optimized 3D globe controls (pinch-zoom, rotation) ✅ **DONE!**
- ✅ Advanced analytics dashboard with budget tracking ✅ **DONE!**
- ✅ 3D globe connected to real Firebase data ✅ **DONE!**
- ✅ Professional PDF trip reports ✅ **DONE!**
- ✅ CSV data exports (expenses, summary, settlements) ✅ **DONE!**
- [ ] Offline support (PWA) (Future Enhancement)
- [ ] Automated testing suite (Future Enhancement)

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 📦 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🔗 Resources

- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Mapbox Documentation](https://docs.mapbox.com)
- [Three.js Documentation](https://threejs.org/docs)
- [Cesium Documentation](https://cesium.com/learn/)


**Happy Traveling! ✈️🗺️**