import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import toast from 'react-hot-toast';
import { GraduationCap, Mail, Lock, User as UserIcon, Phone, ArrowRight, Loader2, Award, ShieldAlert } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error(t('auth.error_required_fields', 'Please fill in all required fields'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        phone: phone || undefined,
        role,
      });
      const { access_token, user } = response.data;
      login(access_token, user);
      toast.success(t('auth.register_success', 'Account registered successfully!'));

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t('auth.error_failed', 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="glass-panel w-full max-w-lg p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-center">{t('auth.register_title')}</h2>
          <p className="text-sm text-text-secondary mt-1">{t('auth.register_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-sm cursor-pointer ${
                role === 'student'
                  ? 'bg-primary/10 border-primary text-primary font-bold'
                  : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'
              }`}
            >
              <Award className="h-5 w-5" />
              {t('auth.role_student')}
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-sm cursor-pointer ${
                role === 'admin'
                  ? 'bg-secondary/10 border-secondary text-secondary font-bold'
                  : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'
              }`}
            >
              <ShieldAlert className="h-5 w-5" />
              {t('auth.role_admin')}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">{t('auth.name')}</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
              <input
                type="text"
                placeholder="Rohan Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input glass-input-icon"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
              <input
                type="email"
                placeholder="rohan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input glass-input-icon"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">{t('auth.phone')}</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
              <input
                type="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="glass-input glass-input-icon"
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
            className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-secondary hover:bg-secondary-hover shadow-secondary/20 hover:shadow-secondary/30'
                : 'bg-primary hover:bg-primary-hover shadow-primary/20 hover:shadow-primary/30'
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {t('auth.register_btn')}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          {t('auth.have_account')}{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            {t('auth.sign_in_here')}
          </Link>
        </p>
      </div>
    </div>
  );
};
