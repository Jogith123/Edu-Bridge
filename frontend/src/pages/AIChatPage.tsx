import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Send, Sparkles, GraduationCap, Loader2, User, BookOpen, ChevronDown, ChevronUp, ExternalLink, Search, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  isKey?: boolean;
}

interface RagSource {
  name: string;
  type: string;
  amount?: string;
  deadline?: string;
  apply_url?: string;
  provider?: string;
}

interface RagResult {
  answer: string;
  sources: RagSource[];
  total_eligible: number;
}

const SourceCard: React.FC<{ source: RagSource; index: number }> = ({ source, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.08 }}
    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all"
  >
    <div className="h-6 w-6 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
      <span className="text-xs font-bold text-primary">{index + 1}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-text-primary truncate">{source.name}</p>
      <p className="text-xs text-text-secondary mt-0.5">
        {source.type === 'scholarship' ? '🎓 Scholarship' : '🏛️ Govt Scheme'}
        {source.amount && source.amount !== 'Check portal' && <span className="ml-2 text-green-400 font-medium">{source.amount}</span>}
        {source.deadline && source.deadline !== 'Check official portal' && <span className="ml-2 text-orange-400">• {source.deadline}</span>}
      </p>
    </div>
    {source.apply_url && (
      <a href={source.apply_url} target="_blank" rel="noopener noreferrer"
        className="text-primary hover:text-primary-hover transition-colors shrink-0 mt-0.5">
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    )}
  </motion.div>
);

export const AIChatPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'chat' | 'rag'>('chat');

  // ── Chat tab state ────────────────────────────────────────────────────────
  const QUICK_SUGGESTIONS = ['chat.q1', 'chat.q2', 'chat.q3', 'chat.q4'];
  const [messages, setMessages] = useState<Message[]>([{ sender: 'ai', text: 'chat.greeting', isKey: true }]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: text });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]);
    } catch {
      toast.error('Could not get response from AI. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  // ── RAG tab state ─────────────────────────────────────────────────────────
  const RAG_EXAMPLES = [
    t('chat.q1'), t('chat.q2'), t('chat.q3'), t('chat.q4'),
  ];
  const [ragInput, setRagInput] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState<RagResult | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(true);

  const handleRagSearch = async (question: string) => {
    if (!question.trim()) return;
    setRagInput(question);
    setRagLoading(true);
    setRagResult(null);
    try {
      const res = await api.post('/ai/rag-query', { question });
      setRagResult(res.data);
      setSourcesOpen(true);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Knowledge Base search failed. Please try again.');
    } finally {
      setRagLoading(false);
    }
  };

  const tabs = [
    { id: 'chat' as const, label: t('chat.tab_chat'), icon: <Sparkles className="h-4 w-4" /> },
    { id: 'rag' as const, label: t('chat.tab_kb'), icon: <Database className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/5">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg">{t('chat.title')}</h1>
          <p className="text-xs text-text-secondary">{t('chat.subtitle')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 p-1 bg-white/5 rounded-xl border border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── AI Chat Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                    msg.sender === 'user' ? 'bg-primary/20 border-primary text-primary' : 'bg-secondary/20 border-secondary text-secondary'
                  }`}>
                    {msg.sender === 'user' ? <User className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed border whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white border-primary/20 rounded-tr-none'
                      : 'bg-white/5 text-text-primary border-white/10 rounded-tl-none'
                  }`}>
                    {msg.isKey ? t(msg.text) : msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3 mr-auto items-center text-text-secondary text-xs">
                  <div className="h-8 w-8 rounded-full bg-secondary/20 border border-secondary/15 flex items-center justify-center text-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <span>{t('chat.thinking')}</span>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {messages.length === 1 && (
              <div className="mb-4 space-y-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">{t('chat.suggested_title')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_SUGGESTIONS.map((key, idx) => (
                    <button key={idx} onClick={() => handleSend(t(key))}
                      className="text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-white/10 text-xs text-text-secondary font-semibold transition-all cursor-pointer">
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={e => { e.preventDefault(); handleSend(chatInput); }} className="flex gap-3">
              <input type="text" placeholder={t('chat.placeholder')} value={chatInput}
                onChange={e => setChatInput(e.target.value)} disabled={chatLoading}
                className="glass-input flex-1 pr-4" />
              <button type="submit" disabled={chatLoading || !chatInput.trim()}
                className="bg-primary hover:bg-primary-hover disabled:opacity-50 px-5 rounded-xl text-white font-bold flex items-center justify-center cursor-pointer shadow-lg shadow-primary/20 transition-all">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}

        {/* ── Knowledge Base (RAG) Tab ─────────────────────────────────────── */}
        {activeTab === 'rag' && (
          <motion.div
            key="rag"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col min-h-0 overflow-y-auto"
          >
            {/* Search bar */}
            <form onSubmit={e => { e.preventDefault(); handleRagSearch(ragInput); }} className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input type="text" placeholder={t('chat.rag_placeholder')} value={ragInput}
                  onChange={e => setRagInput(e.target.value)} disabled={ragLoading}
                  className="glass-input w-full pl-10" />
              </div>
              <button type="submit" disabled={ragLoading || !ragInput.trim()}
                className="bg-primary hover:bg-primary-hover disabled:opacity-50 px-5 rounded-xl text-white font-bold flex items-center justify-center cursor-pointer shadow-lg shadow-primary/20 transition-all">
                {ragLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>
            </form>

            {/* Example queries */}
            {!ragResult && !ragLoading && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{t('chat.rag_examples')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {RAG_EXAMPLES.map((q, i) => (
                    <button key={i} onClick={() => handleRagSearch(q)}
                      className="text-left p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/5 text-xs text-text-secondary font-semibold transition-all group cursor-pointer">
                      <span className="text-primary mr-2 group-hover:translate-x-0.5 inline-block transition-transform">→</span>{q}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{t('chat.rag_info_title')}</p>
                      <p className="text-xs text-text-secondary mt-1">{t('chat.rag_info_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading */}
            {ragLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-7 w-7 text-primary animate-spin" />
                </div>
                <p className="text-sm text-text-secondary">{t('chat.rag_searching')}</p>
              </div>
            )}

            {/* Results */}
            {ragResult && !ragLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Eligibility badge */}
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Database className="h-3.5 w-3.5 text-primary" />
                  <span>{ragResult.total_eligible} {t('chat.rag_eligible_count')}</span>
                  <span className="ml-auto text-primary font-semibold cursor-pointer underline-offset-2 hover:underline" onClick={() => { setRagResult(null); setRagInput(''); }}>
                    {t('chat.rag_clear')}
                  </span>
                </div>

                {/* Answer */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <GraduationCap className="h-3.5 w-3.5 text-secondary" />
                    </div>
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">{t('chat.rag_answer_label')}</span>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold border border-primary/20">
                      RAG · Grounded
                    </span>
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">{ragResult.answer}</p>
                </div>

                {/* Sources */}
                {ragResult.sources.length > 0 && (
                  <div className="rounded-2xl border border-white/10 overflow-hidden">
                    <button onClick={() => setSourcesOpen(o => !o)}
                      className="w-full flex items-center justify-between p-4 text-sm font-semibold text-text-primary hover:bg-white/5 transition-all cursor-pointer">
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {t('chat.rag_sources_label')} ({ragResult.sources.length})
                      </span>
                      {sourcesOpen ? <ChevronUp className="h-4 w-4 text-text-secondary" /> : <ChevronDown className="h-4 w-4 text-text-secondary" />}
                    </button>
                    <AnimatePresence>
                      {sourcesOpen && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                          className="overflow-hidden">
                          <div className="p-4 pt-0 space-y-2 border-t border-white/5">
                            {ragResult.sources.map((src, i) => <SourceCard key={i} source={src} index={i} />)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

