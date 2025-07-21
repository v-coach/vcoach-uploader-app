import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudentDashboard from './components/StudentDashboard';
import CoachDashboard from './components/CoachDashboard';
import AdminDashboard from './components/AdminDashboard';
import vcoachlg from '../public/vcoachlg.jpg'; // Import the logo

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white" style={{ backgroundImage: `url(/vcoachbg.jpg)`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
        <nav className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex justify-between items-center border-b border-gray-700">
          <Link to="/">
            <img src={vcoachlg} alt="V-Coach Central Logo" className="h-16" />
          </Link>
          <div className="space-x-4">
            <Link to="/" className="text-lg font-semibold hover:text-blue-400">Student</Link>
            <Link to="/coach" className="text-lg font-semibold hover:text-blue-400">Coach</Link>
            <Link to="/admin" className="text-lg font-semibold hover:text-blue-400">Admin</Link>
          </div>
        </nav>

        <main className="p-8">
          <Routes>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/coach" element={<CoachDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
