import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, Users, PhoneCall, CheckSquare, Layers, Award, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/admin/analytics');
        setData(response.data);
      } catch (err: any) {
        toast.error('Failed to load admin analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { overview, state_distribution = {}, category_distribution = {} } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-secondary via-text-primary to-primary bg-clip-text text-transparent">
          NGO & Admin Analytics Dashboard
        </h1>
        <p className="text-text-secondary text-sm">
          Monitor student registrations, profile completions, and AI Voice campaigns.
        </p>
      </div>

      {/* Stats Counter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <span className="text-text-secondary text-xs uppercase tracking-wider font-bold">Total Students</span>
            <h3 className="text-3xl font-extrabold mt-1">{overview?.total_students || 0}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <span className="text-text-secondary text-xs uppercase tracking-wider font-bold">Profile Completion Rate</span>
            <h3 className="text-3xl font-extrabold mt-1">{overview?.completion_rate || 0}%</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
            <CheckSquare className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <span className="text-text-secondary text-xs uppercase tracking-wider font-bold">Active Campaigns</span>
            <h3 className="text-3xl font-extrabold mt-1">{overview?.total_campaigns || 0}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <PhoneCall className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <span className="text-text-secondary text-xs uppercase tracking-wider font-bold">Leads Contacted</span>
            <h3 className="text-3xl font-extrabold mt-1">{overview?.total_leads || 0}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-white">
            <Layers className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Detailed charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* State distribution */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <Landmark className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">State-wise Distribution</h3>
          </div>

          <div className="space-y-4">
            {Object.keys(state_distribution).length > 0 ? (
              Object.entries(state_distribution).map(([state, count]: any) => {
                const total = overview?.total_students || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={state} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-text-primary">{state}</span>
                      <span className="text-text-secondary">{count} students ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-text-muted text-sm italic">
                No students registered yet.
              </div>
            )}
          </div>
        </div>

        {/* Category distribution */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <Award className="h-5 w-5 text-secondary" />
            <h3 className="font-bold text-lg">Social Category Distribution</h3>
          </div>

          <div className="space-y-4">
            {Object.keys(category_distribution).length > 0 ? (
              Object.entries(category_distribution).map(([cat, count]: any) => {
                const total = overview?.total_students || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold uppercase text-text-primary">{cat}</span>
                      <span className="text-text-secondary">{count} students ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-text-muted text-sm italic">
                No students registered yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
