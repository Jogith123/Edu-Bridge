import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import toast from 'react-hot-toast';
import { GraduationCap, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('auth.error_required_fields', 'Please enter both email and password'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      login(access_token, user);
      toast.success(`${t('dashboard.welcome')}, ${user.name}!`);

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(user.profile_completed ? '/dashboard' : '/onboarding');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t('auth.error_failed', 'Authentication failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="glass-panel w-full max-w-md p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-center">{t('auth.login_title')}</h2>
          <p className="text-sm text-text-secondary mt-1">{t('auth.login_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
              <input
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input glass-input-icon"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input glass-input-icon"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {t('auth.login_btn')}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          {t('auth.no_account')}{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            {t('auth.register_here')}
          </Link>
        </p>
      </div>
    </div>
  );
};
