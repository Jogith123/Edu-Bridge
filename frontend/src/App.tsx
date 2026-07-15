import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { StudentDashboard } from './pages/StudentDashboard';
import { ScholarshipsPage } from './pages/ScholarshipsPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { AIChatPage } from './pages/AIChatPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentsPage } from './pages/StudentsPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { Toaster } from 'react-hot-toast';

// Route Guard for authenticated users
const PrivateRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'student' | 'admin' }> = ({
  children,
  allowedRole,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
              ) : (
                <RegisterPage />
              )
            }
          />

          {/* Student Protected Routes */}
          <Route
            path="/onboarding"
            element={
              <PrivateRoute allowedRole="student">
                <OnboardingWizard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRole="student">
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/scholarships"
            element={
              <PrivateRoute allowedRole="student">
                <ScholarshipsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/roadmap"
            element={
              <PrivateRoute allowedRole="student">
                <RoadmapPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute allowedRole="student">
                <AIChatPage />
              </PrivateRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <PrivateRoute allowedRole="admin">
                <StudentsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/campaigns"
            element={
              <PrivateRoute allowedRole="admin">
                <CampaignsPage />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1c1c28', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}
