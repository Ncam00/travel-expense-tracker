import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SimpleSignup from './pages/SimpleSignup';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<SimpleTest />} />
            <Route path="/debug" element={<DebugInfo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SimpleSignup />} />
            <Route path="/signup-test" element={<TestSignup />} />
            <Route path="/signup-original" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/trips" element={
              <ProtectedRoute>
                <TripsPage />
              </ProtectedRoute>
            } />
            <Route path="/trips/:tripId" element={
              <ProtectedRoute>
                <TripDashboard />
              </ProtectedRoute>
            } />
            <Route path="/trips/:tripId/planning" element={
              <ProtectedRoute>
                <TripPlanningPage />
              </ProtectedRoute>
            } />
            <Route path="/trips/:tripId/collaboration" element={
              <ProtectedRoute>
                <GroupCollaborationPage />
              </ProtectedRoute>
            } />
            <Route path="/trip-planning" element={
              <ProtectedRoute>
                <NewTripPlanningPage />
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute>
                <ExpenseTracker />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/travel-globe" element={
              <ProtectedRoute>
                <SimpleGlobePage />
              </ProtectedRoute>
            } />
            <Route path="/travel-globe-full" element={
              <ProtectedRoute>
                <SimpleGlobePage />
              </ProtectedRoute>
            } />
            <Route path="/testing" element={
              <ProtectedRoute>
                <TestingPage />
              </ProtectedRoute>
            } />
            <Route path="/test-trip-creation" element={
              <ProtectedRoute>
                <TripCreationTestPage />
              </ProtectedRoute>
            } />
            
            {/* Trip Sharing Routes */}
            <Route path="/join" element={<JoinTrip />} />
            <Route path="/join/:code" element={<JoinTrip />} />
            <Route path="/invite/:token" element={<JoinTrip />} />
          </Routes>
          
          {/* Global Toast Notifications */}
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
