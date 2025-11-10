import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ExpenseTracker from './pages/ExpenseTracker';
import TripsPage from './pages/TripsPage';
import TripDashboard from './pages/TripDashboard';
import TripPlanningPage from './pages/TripPlanningPage';
import NewTripPlanningPage from './pages/NewTripPlanningPage';
import GroupCollaborationPage from './pages/GroupCollaborationPage';
import SimpleGlobePage from './pages/SimpleGlobePage';
import TestGlobePage from './pages/TestGlobePage';
import Analytics from './pages/Analytics';
import TestingPage from './pages/TestingPage';
import JoinTrip from './pages/JoinTrip';
import TripCreationTestPage from './pages/TripCreationTestPage';
import DebugInfo from './pages/DebugInfo';
import SimpleTest from './pages/SimpleTest';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<SimpleTest />} />
            <Route path="/debug" element={<DebugInfo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
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
