import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Award, BookOpen, Clock, ChevronRight, GraduationCap, Flame, ArrowUpRight, ClipboardList, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // First check if profile exists
        const profileRes = await api.get('/student/profile');
        if (!profileRes.data.profile) {
          setProfileExists(false);
          setLoading(false);
          return;
        }

        const [statsRes, timelineRes] = await Promise.all([
          api.get('/student/dashboard-stats'),
          api.get('/student/timeline'),
        ]);
        setStats(statsRes.data);
        setTimeline(timelineRes.data.timeline || []);
      } catch (err: any) {
        if (err.response?.status === 400) {
          setProfileExists(false);
        } else {
          toast.error(t('dashboard.error', 'Failed to load dashboard data'));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Profile not completed — show setup CTA
  if (!profileExists || !user?.profile_completed) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col items-center text-center space-y-8">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <ClipboardList className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold">
            {t('dashboard.welcome')}, <span style={{ color: 'var(--color-primary)' }}>{user?.name}</span>! 👋
          </h1>
          <p className="text-text-secondary max-w-lg leading-relaxed">
            {t('dashboard.onboarding_step_desc')}
          </p>
        </div>

        <div className="w-full glass-panel p-8 space-y-6 text-left">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-secondary" />
            {t('dashboard.what_happens_setup')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '🎓', title: t('dashboard.step_match_title'), desc: t('dashboard.step_match_desc') },
              { icon: '🏛️', title: t('dashboard.step_scheme_title'), desc: t('dashboard.step_scheme_desc') },
              { icon: '🗺️', title: t('dashboard.step_roadmap_title'), desc: t('dashboard.step_roadmap_desc') },
              { icon: '🤖', title: t('dashboard.step_coach_title'), desc: t('dashboard.step_coach_desc') },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">{item.title}</h3>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/onboarding')}
          style={{ backgroundColor: 'var(--color-primary)' }}
          className="px-10 py-4 rounded-xl font-bold text-white text-lg flex items-center gap-2 shadow-lg transition-all hover:opacity-90 cursor-pointer"
        >
          {t('dashboard.start_onboarding')}
          <ArrowUpRight className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="glass-panel p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(10,10,18,0) 60%)' }}>
        <div className="absolute top-0 right-0 w-[300px] h-[100%] rounded-full blur-[80px] pointer-events-none" style={{ background: 'rgba(99,102,241,0.05)' }}></div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">
          {t('dashboard.welcome_user', { name: user?.name })}
        </h1>
        <p className="text-text-secondary max-w-xl text-sm leading-relaxed mb-6">
          {t('dashboard.subtitle')}
        </p>
        <div className="flex gap-4 flex-wrap">
          <Link
            to="/scholarships"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-1 shadow-lg"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {t('dashboard.view_opportunities')}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            to="/chat"
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            {t('dashboard.ask_assistant')}
          </Link>
        </div>
      </div>

      {/* Stats Counter Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: t('dashboard.total_matches'), value: stats?.total_opportunities || 0, icon: <GraduationCap className="h-6 w-6" />, color: 'primary' },
          { label: t('dashboard.scholarships'), value: stats?.scholarships || 0, icon: <Award className="h-6 w-6" />, color: 'secondary' },
          { label: t('dashboard.schemes'), value: stats?.schemes || 0, icon: <BookOpen className="h-6 w-6" />, color: 'success' },
          { label: t('dashboard.avg_match'), value: `${stats?.avg_match_score || 0}%`, icon: <Flame className="h-6 w-6 text-orange-400" />, color: 'orange' },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-6 flex items-center justify-between">
            <div>
              <span className="text-text-secondary text-xs uppercase tracking-wider font-bold">{stat.label}</span>
              <h3 className="text-3xl font-extrabold mt-1">{stat.value}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: `rgba(99,102,241,0.1)`, color: `var(--color-${stat.color === 'orange' ? 'text-primary' : stat.color})` }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-secondary" />
              {t('dashboard.upcoming_deadlines')}
            </h3>
            <span className="text-xs text-text-muted">{t('dashboard.sorted_by_deadline')}</span>
          </div>

          <div className="space-y-4">
            {timeline.length > 0 ? (
              timeline.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/20 transition-all">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--color-secondary)' }}>
                    {idx + 1}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-text-primary">{item.title}</h4>
                      <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        {item.deadline}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Type: <span className="capitalize">{item.type}</span> • Match: {Math.round(item.match_score * 100)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-text-muted text-sm italic">
                {t('dashboard.no_deadlines')}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="glass-panel p-6 space-y-6">
          <h3 className="text-lg font-bold">{t('dashboard.platform_guide')}</h3>
          <div className="space-y-4">
            {[
              { to: '/chat', icon: '🤖', label: t('nav.aiCoach'), color: 'secondary', desc: t('dashboard.step_coach_desc') },
              { to: '/roadmap', icon: '🗺️', label: t('nav.roadmap'), color: 'primary', desc: t('dashboard.step_roadmap_desc') },
              { to: '/scholarships', icon: '🎓', label: t('nav.scholarships'), color: 'success', desc: t('dashboard.step_match_desc') },
            ].map((item) => (
              <div key={item.to} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-sm font-bold" style={{ color: `var(--color-${item.color})` }}>{item.icon} {item.label}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                <Link to={item.to} className="text-xs font-bold hover:underline flex items-center gap-0.5 pt-1" style={{ color: 'var(--color-primary)' }}>
                  {t('common.open', 'Open')} <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
