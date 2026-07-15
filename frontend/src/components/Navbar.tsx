import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, LayoutDashboard, User as UserIcon, BookOpen, Briefcase, Map, BarChart3, PhoneCall, HelpCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <GraduationCap className="h-8 w-8 text-primary" />
        <span className="font-extrabold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          EduBridge AI
        </span>
      </Link>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            {user.role === 'student' ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/scholarships"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    isActive('/scholarships') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Scholarships
                </Link>
                <Link
                  to="/roadmap"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    isActive('/roadmap') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Map className="h-4 w-4" />
                  Study Roadmap
                </Link>
                <Link
                  to="/chat"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    isActive('/chat') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <HelpCircle className="h-4 w-4" />
                  AI Coach
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    isActive('/admin/dashboard') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Link>
                <Link
                  to="/admin/students"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    isActive('/admin/students') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <UserIcon className="h-4 w-4" />
                  Students
                </Link>
                <Link
                  to="/admin/campaigns"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    isActive('/admin/campaigns') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <PhoneCall className="h-4 w-4" />
                  AI Calling
                </Link>
              </>
            )}

            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <span className="text-sm font-medium text-text-secondary">
                Hi, <span className="text-text-primary">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm hover:bg-red-500/10 hover:border-red-500/20 text-red-400 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-text-secondary hover:text-text-primary font-medium">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-primary hover:bg-primary-hover px-4 py-2 rounded-xl text-white font-medium shadow-lg shadow-primary/20 transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
