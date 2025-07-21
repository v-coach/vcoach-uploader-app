import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import StudentDashboard from './components/StudentDashboard';
import CoachDashboard from './components/CoachDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthButton from './components/AuthButton';
import ProtectedRoute from './components/ProtectedRoute';
import vcoachlg from '../public/vcoachlg.jpg';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900 text-white" style={{ backgroundImage: `url(/vcoachbg.jpg)`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
          <nav className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex justify-between items-center border-b border-gray-700">
            <Link to="/">
              <img src={vcoachlg} alt="V-Coach Central Logo" className="h-16" />
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-lg font-semibold hover:text-blue-400">Student</Link>
              <ProtectedRoute roles={['Coach', 'Head Coach']}>
                <Link to="/coach" className="text-lg font-semibold hover:text-blue-400">Coach</Link>
              </ProtectedRoute>
              <ProtectedRoute roles={['Founders']}>
                <Link to="/admin" className="text-lg font-semibold hover:text-blue-400">Admin</Link>
              </ProtectedRoute>
              <AuthButton />
            </div>
          </nav>

          <main className="p-8">
            <Routes>
              <Route path="/" element={<StudentDashboard />} />
              <Route path="/coach" element={<ProtectedRoute roles={['Coach', 'Head Coach']}><CoachDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute roles={['Founders']}><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
