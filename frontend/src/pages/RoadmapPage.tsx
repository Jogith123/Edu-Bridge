import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, HelpCircle, Lightbulb, Map, Star, Target, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

export const RoadmapPage: React.FC = () => {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const profileRes = await api.get('/student/profile');
        if (!profileRes.data.profile) {
          setNoProfile(true);
          setLoading(false);
          return;
        }
        const response = await api.get('/student/roadmap');
        setRoadmap(response.data.roadmap);
      } catch (err: any) {
        if (err.response?.status === 400) {
          setNoProfile(true);
        } else {
          toast.error('Failed to generate roadmap.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

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
        <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <ClipboardList className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Profile Required</h2>
        <p className="text-text-secondary leading-relaxed">
          Your personalized roadmap is generated once you complete the onboarding profile. It takes under 2 minutes!
        </p>
        <Link
          to="/onboarding"
          className="px-8 py-3 rounded-xl font-bold text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Complete Profile Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
      <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 p-6 rounded-2xl">
        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
          <Map className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {roadmap?.title || 'Your Personalized Learning Roadmap'}
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Core Target: <span className="text-secondary font-semibold capitalize">{roadmap?.career_focus || 'Your chosen field'}</span>
          </p>
        </div>
      </div>

      {/* Main Roadmap phases */}
      <div className="relative border-l border-white/10 pl-6 ml-6 space-y-10">
        {roadmap?.phases?.map((phase: any, idx: number) => (
          <div key={idx} className="relative">
            {/* Timeline bullet dot */}
            <div className="absolute -left-[35px] top-1.5 h-6 w-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary">
              {phase.phase}
            </div>

            <div className="glass-panel p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-3">
                <h3 className="text-lg font-bold text-text-primary">{phase.title}</h3>
                <span className="inline-flex items-center gap-1 text-xs text-secondary font-bold bg-secondary/10 px-2.5 py-1 rounded-full border border-secondary/20">
                  <Calendar className="h-3.5 w-3.5" />
                  {phase.duration}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Key Milestones & Tasks</h4>
                  <ul className="space-y-2">
                    {phase.tasks?.map((task: string, tIdx: number) => (
                      <li key={tIdx} className="flex items-start gap-2.5 text-sm text-text-secondary">
                        <Target className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>

                {phase.resources?.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Recommended Study Resources</h4>
                    <div className="flex flex-wrap gap-2">
                      {phase.resources.map((res: string, rIdx: number) => (
                        <span key={rIdx} className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-text-secondary font-medium">
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Box Tips */}
      {roadmap?.key_tips?.length > 0 && (
        <div className="glass-panel p-6 space-y-4 bg-gradient-to-r from-success/5 to-transparent border-success/20">
          <h3 className="text-lg font-bold text-success flex items-center gap-2">
            <Lightbulb className="h-5 w-5 fill-success/15" />
            AI Guidance Tips
          </h3>
          <ul className="space-y-2">
            {roadmap.key_tips.map((tip: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed">
                <Star className="h-4 w-4 text-success shrink-0 mt-0.5 fill-success/10" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
