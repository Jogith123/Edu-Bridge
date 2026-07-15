import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, ShieldCheck, Cpu, PhoneCall, Globe2, Award, Zap } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-73px)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto flex flex-col items-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 text-sm text-secondary font-medium">
            <Zap className="h-4 w-4 fill-secondary" />
            AI-Powered Discovery Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-text-primary to-white/70 bg-clip-text text-transparent leading-tight">
            One Profile.<br className="md:hidden" /> Every Opportunity.
          </h1>

          <p className="text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed">
            EduBridge AI simplifies eligibility matching for rural and underserved students. Enter your profile once and unlock scholarships, government schemes, and personalized learning roadmaps instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-primary hover:bg-primary-hover px-8 py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-lg group"
            >
              Get Started for Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-xl text-text-primary font-semibold flex items-center justify-center transition-all text-lg"
            >
              Access Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Key Features & Platform Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel glass-panel-hover p-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Eligibility Engine</h3>
            <p className="text-text-secondary leading-relaxed">
              No more searching hundreds of government PDFs. The AI system matches your academic score, category, location, and income directly with current opportunities.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel glass-panel-hover p-8">
            <div className="h-12 w-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mb-6">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Recommendations</h3>
            <p className="text-text-secondary leading-relaxed">
              Receive matched scholarships and government schemes with plain English, AI-generated explanations on why you qualify and exactly how to apply.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel glass-panel-hover p-8">
            <div className="h-12 w-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success mb-6">
              <PhoneCall className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Voice Call Outreach</h3>
            <p className="text-text-secondary leading-relaxed">
              NGOs and local schools can trigger AI Voice calls to check in on students, collect missing documents, and update profiles in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-text-muted text-sm mt-auto">
        <p>© 2026 EduBridge AI. Supporting rural education and opportunity access across India.</p>
      </footer>
    </div>
  );
};
