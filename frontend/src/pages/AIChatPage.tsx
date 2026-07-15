import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Send, Sparkles, GraduationCap, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const QUICK_SUGGESTIONS = [
  "What scholarships can I apply for with an income under 2 lakhs?",
  "How do I apply for the NSP post-matric scholarship?",
  "Tell me about NIT Trichy courses and cutoffs.",
  "Which government schemes help rural students learn skills?"
];

export const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I am your EduBridge AI Coach. You can ask me anything about scholarships, eligibility, colleges, entrance exams, or career advice. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', { message: text });
      setMessages((prev) => [...prev, { sender: 'ai', text: response.data.response }]);
    } catch (err: any) {
      toast.error('Could not get response from AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 h-[calc(100vh-100px)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg">AI Coach Assistant</h1>
          <p className="text-xs text-text-secondary">Ask questions about scholarships, careers & exams</p>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6 scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === 'user'
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-secondary/20 border-secondary text-secondary'
              }`}
            >
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
            </div>
            <div
              className={`p-4 rounded-2xl text-sm leading-relaxed border whitespace-pre-line ${
                msg.sender === 'user'
                  ? 'bg-primary text-white border-primary/20 rounded-tr-none'
                  : 'bg-white/5 text-text-primary border-white/10 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 mr-auto items-center text-text-secondary text-xs">
            <div className="h-8 w-8 rounded-full bg-secondary/20 border border-secondary/15 flex items-center justify-center text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <span>Thinking...</span>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="mb-6 space-y-3">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Suggested Questions</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item)}
                className="text-left p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/20 hover:bg-white/10 text-xs text-text-secondary font-semibold transition-all cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex gap-3"
      >
        <input
          type="text"
          placeholder="Ask about scholarships, schemes, entrance exams..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="glass-input flex-1 pr-4"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 px-5 rounded-xl text-white font-bold flex items-center justify-center cursor-pointer shadow-lg shadow-primary/20 transition-all"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
