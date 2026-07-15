import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { GraduationCap, LogOut, LayoutDashboard, User as UserIcon, BookOpen, Map, BarChart3, PhoneCall, HelpCircle, Globe, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  const LanguageSelector = () => (
    <div ref={langRef} className="relative">
      <button
        onClick={() => setLangOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/40 transition-all text-sm font-medium text-text-secondary hover:text-text-primary"
        title="Change Language"
      >
        <Globe className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">{currentLang.nativeName}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
      </button>

      {langOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-surface border border-white/10 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden backdrop-blur-xl">
          <div className="p-1.5">
            <p className="text-xs text-text-secondary px-2 py-1 font-medium uppercase tracking-wider">Choose Language</p>
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                  language === lang.code
                    ? 'bg-primary/20 text-primary font-semibold'
                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium leading-none">{lang.nativeName}</span>
                  <span className="text-xs text-text-secondary mt-0.5">{lang.name}</span>
                </div>
                {language === lang.code && (
                  <span className="ml-auto text-xs bg-primary/30 text-primary px-1.5 py-0.5 rounded-full">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <GraduationCap className="h-8 w-8 text-primary" />
        <span className="font-extrabold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          EduBridge AI
        </span>
      </Link>

      <div className="flex items-center gap-4">
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
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/scholarships"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    isActive('/scholarships') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  {t('nav.scholarships')}
                </Link>
                <Link
                  to="/roadmap"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    isActive('/roadmap') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Map className="h-4 w-4" />
                  {t('nav.roadmap')}
                </Link>
                <Link
                  to="/chat"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    isActive('/chat') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <HelpCircle className="h-4 w-4" />
                  {t('nav.aiCoach')}
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
                  {t('nav.analytics')}
                </Link>
                <Link
                  to="/admin/students"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    isActive('/admin/students') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <UserIcon className="h-4 w-4" />
                  {t('nav.students')}
                </Link>
                <Link
                  to="/admin/campaigns"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    isActive('/admin/campaigns') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <PhoneCall className="h-4 w-4" />
                  {t('nav.aiCalling')}
                </Link>
              </>
            )}

            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <LanguageSelector />
              <span className="text-sm font-medium text-text-secondary hidden md:block">
                {t('nav.hi')}, <span className="text-text-primary">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm hover:bg-red-500/10 hover:border-red-500/20 text-red-400 transition-all"
              >
                <LogOut className="h-4 w-4" />
                {t('nav.logout')}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link to="/login" className="text-text-secondary hover:text-text-primary font-medium">
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="bg-primary hover:bg-primary-hover px-4 py-2 rounded-xl text-white font-medium shadow-lg shadow-primary/20 transition-all"
            >
              {t('nav.getStarted')}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
