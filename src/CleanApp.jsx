import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SimpleSignup from './pages/SimpleSignup';
import Home from './pages/Home';

function CleanApp() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SimpleSignup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default CleanApp;
