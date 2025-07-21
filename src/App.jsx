import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import StudentDashboard from './components/StudentDashboard';
import CoachDashboard from './components/CoachDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthButton from './components/AuthButton';
import ProtectedRoute from './components/ProtectedRoute';
import vcoachlg from '../public/vcoachlg.jpg';

function App() {
  const activeLinkStyle = {
    backgroundColor: 'hsl(var(--accent))',
    color: 'hsl(var(--accent-foreground))'
  };

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
              <Link to="/" className="mr-6 flex items-center space-x-2">
                <img src={vcoachlg} alt="V-Coach Central Logo" className="h-12" />
              </Link>
              <nav className="flex items-center gap-4 text-sm">
                <NavLink to="/" className="transition-colors hover:text-foreground/80 text-foreground/60 px-3 py-2 rounded-md" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Student</NavLink>
                <ProtectedRoute roles={['Coach', 'Head Coach']}>
                  <NavLink to="/coach" className="transition-colors hover:text-foreground/80 text-foreground/60 px-3 py-2 rounded-md" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Coach</NavLink>
                </ProtectedRoute>
                 <ProtectedRoute roles={['Founders']}>
                  <NavLink to="/admin" className="transition-colors hover:text-foreground/80 text-foreground/60 px-3 py-2 rounded-md" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Admin</NavLink>
                </ProtectedRoute>
              </nav>
              <div className="flex flex-1 items-center justify-end">
                <AuthButton />
              </div>
            </div>
          </header>

          <main className="container max-w-screen-2xl p-8">
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
