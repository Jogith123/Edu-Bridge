import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PhoneCall, Play, Plus, Clock, CheckCircle2, User, Phone, PlayCircle, Loader2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New campaign form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [callScript, setCallScript] = useState('');
  const [targetState, setTargetState] = useState('All States');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCampaignsAndLeads = async () => {
    try {
      const campRes = await api.get('/admin/campaigns');
      setCampaigns(campRes.data.campaigns || []);

      const leadsRes = await api.get('/admin/leads');
      setLeads(leadsRes.data.leads || []);
    } catch (err: any) {
      toast.error('Failed to load campaigns data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignsAndLeads();
  }, []);

  const handleLaunchCampaign = async (campaignId: string) => {
    const loadingToast = toast.loading('Launching AI voice outreach campaign...');
    try {
      const response = await api.post(`/admin/campaigns/${campaignId}/launch`);
      toast.success(response.data.message || 'Campaign launched successfully!', { id: loadingToast });
      fetchCampaignsAndLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to launch campaign', { id: loadingToast });
    }
  };

  const handleResetCampaign = async (campaignId: string) => {
    const loadingToast = toast.loading('Resetting campaign status...');
    try {
      const response = await api.post(`/admin/campaigns/${campaignId}/reset`);
      toast.success(response.data.message || 'Campaign reset successfully!', { id: loadingToast });
      fetchCampaignsAndLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to reset campaign', { id: loadingToast });
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !callScript) {
      toast.error('Campaign Name and Prompt/Script are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/admin/campaigns', {
        name,
        description,
        call_script: callScript,
        target_criteria: { state: targetState },
      });
      toast.success('AI Call Campaign created successfully!');
      setName('');
      setDescription('');
      setCallScript('');
      setShowCreateModal(false);
      fetchCampaignsAndLeads();
    } catch (err: any) {
      toast.error('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
            <PhoneCall className="h-8 w-8 text-primary" />
            AI Voice Outreach Campaigns
          </h1>
          <p className="text-text-secondary text-sm">
            Launch awareness campaigns powered by automated Vapi AI voice calls to onboard and check up on rural students.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary-hover px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Plus className="h-5 w-5" />
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Campaigns */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-lg border-b border-white/5 pb-3">Active Outreach Campaigns</h3>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar">
            {campaigns.length > 0 ? (
              campaigns.map((camp, idx) => (
                <div key={idx} className="glass-panel p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-lg text-text-primary">{camp.name}</h4>
                      <p className="text-xs text-text-secondary mt-1">{camp.description || 'No description provided'}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full capitalize border ${
                        camp.status === 'active'
                          ? 'text-success bg-success/10 border-success/20'
                          : camp.status === 'completed'
                          ? 'text-primary bg-primary/10 border-primary/20'
                          : 'text-text-secondary bg-white/5 border-white/10'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>

                  {/* Campaign stats summary */}
                  <div className="grid grid-cols-3 gap-4 py-3 bg-white/5 border border-white/5 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-text-muted font-semibold block">Calls Made</span>
                      <span className="text-sm font-bold text-text-primary mt-0.5 block">{camp.calls_made}</span>
                    </div>
                    <div>
                      <span className="text-text-muted font-semibold block">Answered</span>
                      <span className="text-sm font-bold text-secondary mt-0.5 block">{camp.calls_answered}</span>
                    </div>
                    <div>
                      <span className="text-text-muted font-semibold block">Profiles Updated</span>
                      <span className="text-sm font-bold text-success mt-0.5 block">{camp.profiles_updated}</span>
                    </div>
                  </div>

                  {(camp.status === 'draft' || camp.status === 'active') && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleLaunchCampaign(camp.id)}
                        className="flex-1 bg-success hover:bg-success-hover py-2.5 rounded-xl font-semibold text-white flex items-center justify-center gap-1.5 text-sm shadow-md cursor-pointer transition-all"
                      >
                        <Play className="h-4 w-4" />
                        {camp.status === 'active' ? 'Call Students' : 'Launch Calling Agent'}
                      </button>
                      {camp.status === 'active' && (
                        <button
                          onClick={() => handleResetCampaign(camp.id)}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl font-semibold text-text-primary flex items-center justify-center gap-1.5 text-sm cursor-pointer transition-all"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reset
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="glass-panel p-12 text-center text-text-muted italic">
                No campaigns created yet. Click "Create Campaign" to launch an outreach agent.
              </div>
            )}
          </div>
        </div>

        {/* Lead Activity Logs */}
        <div className="glass-panel p-6 space-y-6">
          <h3 className="font-bold text-lg border-b border-white/5 pb-3">AI Outreach Call Log</h3>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 scrollbar">
            {leads.length > 0 ? (
              leads.map((lead, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-primary flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-primary" />
                      {lead.name || 'Student'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold capitalize ${
                        lead.status === 'answered'
                          ? 'text-success bg-success/10 border border-success/15'
                          : lead.status === 'called'
                          ? 'text-secondary bg-secondary/10 border border-secondary/15'
                          : 'text-text-muted bg-white/5 border-white/10'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-text-secondary">
                    <span className="flex items-center gap-0.5">
                      <Phone className="h-3 w-3" />
                      {lead.phone}
                    </span>
                    {lead.call_duration && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {lead.call_duration}s
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-text-muted text-xs italic">
                No active outreach call records.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg p-8 relative space-y-6">
            <h3 className="text-xl font-bold text-text-primary">Create Outreach Campaign</h3>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary">Campaign Name</label>
                <input
                  type="text"
                  placeholder="SC Category Out-Reach Scheme"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary">Description</label>
                <textarea
                  placeholder="Describe target goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input text-sm h-20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary">Target State</label>
                  <select
                    value={targetState}
                    onChange={(e) => setTargetState(e.target.value)}
                    className="glass-input text-sm"
                  >
                    <option value="All States">All States</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary">AI Call Prompt / Instructions</label>
                <textarea
                  placeholder="Instructions for Vapi AI Agent: e.g. Call student, check if they completed 12th, query family income, and confirm category..."
                  value={callScript}
                  onChange={(e) => setCallScript(e.target.value)}
                  className="glass-input text-sm h-24"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary-hover disabled:opacity-50 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-primary/20 flex items-center gap-1 cursor-pointer transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Create & Prepare
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
