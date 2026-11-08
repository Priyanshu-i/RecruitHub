// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfileModal from './components/ProfileModal';

export default function App() {
  const { isAuthenticated, user, fetchMe } = useAuthStore();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // If token exists, load latest user profile on startup
    if (isAuthenticated) {
      fetchMe();
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onOpenProfile={() => setIsProfileOpen(true)} />

      <main className="flex-1">
        {!isAuthenticated || !user ? (
          authView === 'login' ? (
            <Login onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <Register onSwitchToLogin={() => setAuthView('login')} />
          )
        ) : (
          <>
            {user.role === 'STUDENT' && (
              <StudentDashboard onOpenProfile={() => setIsProfileOpen(true)} />
            )}

            {user.role === 'RECRUITER' && (
              <RecruiterDashboard />
            )}

            {user.role === 'TPO_ADMIN' && (
              <AdminDashboard />
            )}

            <ProfileModal
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>RecruitHub &copy; 2026 • Campus Placement Automation System</span>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Clean Architecture</span>
            <span>•</span>
            <span>Zero-Library Custom JWT (HMAC-SHA256)</span>
            <span>•</span>
            <span>Zustand State Store</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
