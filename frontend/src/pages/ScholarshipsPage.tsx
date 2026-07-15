import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Award, BookOpen, GraduationCap, Calendar, CheckCircle, ExternalLink, HelpCircle, Info, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

type Tab = 'scholarships' | 'schemes' | 'colleges';

export const ScholarshipsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('scholarships');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const profileRes = await api.get('/student/profile');
        if (!profileRes.data.profile) {
          setNoProfile(true);
          setLoading(false);
          return;
        }
        const response = await api.get('/student/recommendations');
        setRecommendations(response.data.recommendations || []);
      } catch (err: any) {
        if (err.response?.status === 400) {
          setNoProfile(true);
        } else {
          toast.error('Failed to load eligible opportunities');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const filteredRecs = recommendations.filter((r) => {
    if (activeTab === 'scholarships') return r.type === 'scholarship';
    if (activeTab === 'schemes') return r.type === 'scheme';
    if (activeTab === 'colleges') return r.type === 'college';
    return false;
  });

  const getTabIcon = (tab: Tab) => {
    switch (tab) {
      case 'scholarships': return <Award className="h-5 w-5" />;
      case 'schemes': return <BookOpen className="h-5 w-5" />;
      case 'colleges': return <GraduationCap className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (noProfile) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 flex flex-col items-center text-center space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
          <ClipboardList className="h-8 w-8 text-secondary" />
        </div>
        <h2 className="text-2xl font-bold">{t('scholarships.no_profile')}</h2>
        <p className="text-text-secondary leading-relaxed">
          {t('scholarships.no_profile_desc')}
        </p>
        <Link
          to="/onboarding"
          className="px-8 py-3 rounded-xl font-bold text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {t('scholarships.complete_profile')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-primary via-text-primary to-secondary bg-clip-text text-transparent">
          {t('scholarships.title')}
        </h1>
        <p className="text-text-secondary text-sm">
          {t('scholarships.subtitle')}
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex gap-4 border-b border-white/5 pb-1">
        {(['scholarships', 'schemes', 'colleges'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedItem(null);
            }}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold tracking-wider transition-all border-b-2 cursor-pointer capitalize ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {getTabIcon(tab)}
            {t(`nav.${tab}`) || tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {filteredRecs.length > 0 ? (
            filteredRecs.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedItem(item)}
                className={`glass-panel p-6 cursor-pointer text-left transition-all ${
                  selectedItem?.item_name === item.item_name
                    ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/30'
                    : 'glass-panel-hover'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-text-primary">{item.item_name}</h3>
                    <p className="text-xs text-text-secondary">
                      {activeTab === 'scholarships' && `Provider: ${item.item_data?.provider}`}
                      {activeTab === 'schemes' && `Ministry: ${item.item_data?.ministry}`}
                      {activeTab === 'colleges' && `Location: ${item.item_data?.city}, ${item.item_data?.state}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                      {Math.round(item.match_score * 100)}% {t('scholarships.match')}
                    </span>
                    {item.item_data?.amount && (
                      <span className="text-xs font-bold text-secondary">
                        {item.item_data.amount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/5">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {item.ai_explanation}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
                  {item.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-secondary" />
                      {t('scholarships.deadline')}: {item.deadline}
                    </span>
                  )}
                  <span className="text-primary font-bold hover:underline">{t('scholarships.click_view')}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel p-12 text-center text-text-muted italic">
              {t('scholarships.no_results', { tab: activeTab })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="glass-panel p-6 space-y-6">
          {selectedItem ? (
            <>
              <div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 capitalize">
                  {selectedItem.type} {t('scholarships.details')}
                </span>
                <h3 className="font-extrabold text-xl mt-3 text-text-primary">{selectedItem.item_name}</h3>
              </div>

              {selectedItem.item_data?.description && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-text-secondary uppercase">{t('scholarships.description')}</h4>
                  <p className="text-xs text-text-primary leading-relaxed bg-white/5 p-3 rounded-lg">
                    {selectedItem.item_data.description}
                  </p>
                </div>
              )}

              {selectedItem.item_data?.benefits && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-text-secondary uppercase">{t('scholarships.benefits')}</h4>
                  <p className="text-xs text-text-primary leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                    {selectedItem.item_data.benefits}
                  </p>
                </div>
              )}

              {selectedItem.action_items?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-text-secondary uppercase">{t('scholarships.actions')}</h4>
                  <ul className="space-y-1.5">
                    {selectedItem.action_items.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
                        <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedItem.item_data?.documents_required?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-text-secondary uppercase">{t('scholarships.documents')}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.item_data.documents_required.map((doc: string, idx: number) => (
                      <span key={idx} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-text-secondary">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.item_data?.apply_url && (
                <a
                  href={selectedItem.item_data.apply_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-primary hover:bg-primary-hover py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all text-sm cursor-pointer"
                >
                  {t('scholarships.apply_now')}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 text-text-muted space-y-3">
              <HelpCircle className="h-10 w-10 text-white/25" />
              <p className="text-sm italic max-w-[200px]">{t('scholarships.select_desc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
