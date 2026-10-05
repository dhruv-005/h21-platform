import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, GitBranch, Database, Eye, RotateCcw, Sparkles, CheckCircle2, Layers, Lock } from 'lucide-react';
import Masthead from '../components/theme/Masthead';
import CardShell from '../components/theme/CardShell';
import SpeedGauge from '../components/theme/SpeedGauge';
import ContextWindow from '../components/theme/ContextWindow';
import ConnectionsMap from '../components/theme/ConnectionsMap';
import TileWall from '../components/theme/TileWall';
import LearnMoreButton from '../components/theme/LearnMoreButton';
import LedDotText from '../components/theme/LedDotText';

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function HomePage() {
  const navigate = useNavigate();
  const go = () => navigate('/setup');
  const s1 = useReveal(), s2 = useReveal(), s3 = useReveal(), s4 = useReveal();

  const features = [
    { icon: Sparkles, color: 'from-amethyst to-amethyst-dark', title: 'AI-Powered Mapping', desc: 'Intelligent field matching with confidence scores and risk detection across schemas.' },
    { icon: Shield, color: 'from-ruby to-ruby-dark', title: 'Human Approval Gate', desc: 'No AI execution without explicit human sign-off. Full control over every migration.' },
    { icon: Eye, color: 'from-blue-500 to-blue-700', title: 'Deterministic Dry Run', desc: 'Simulate entire migrations in memory before touching a single database row.' },
    { icon: Database, color: 'from-emerald-500 to-emerald-700', title: 'Quarantine Isolation', desc: 'Failed records are safely isolated with detailed error diagnostics for review.' },
    { icon: RotateCcw, color: 'from-terracotta to-terracotta-dark', title: 'Instant Rollback', desc: 'One-click undo for any executed migration. Full data recovery guaranteed.' },
    { icon: Lock, color: 'from-ink to-gray-700', title: 'Immutable Audit Trail', desc: 'Tamper-proof chronological log of every action, approval, and execution.' },
  ];

  const steps = [
    { num: '01', title: 'Define Schemas', desc: 'Upload source and target blueprints with sample records.' },
    { num: '02', title: 'AI Proposes', desc: 'Intelligent mapping engine analyzes fields and suggests transformations.' },
    { num: '03', title: 'Review & Approve', desc: 'Human oversight gate ensures accuracy before any data moves.' },
    { num: '04', title: 'Execute Safely', desc: 'Dry-run simulation, live migration, quarantine, and rollback support.' },
  ];

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* HERO SECTION */}
      <div className="flex-1 flex flex-col justify-between w-full max-w-[var(--content-max)] mx-auto py-2 sm:py-4 px-3 sm:px-0">
        <Masthead
          headlineLine1="Built for"
          dotWord="Intelligent"
          headlineLine2="Performance"
          intro="Every capability is engineered for speed, scale and contextual understanding, giving your migration pipeline the intelligence to reason, adapt and perform in production."
        />
        <section className="cards" aria-label="Core Performance Pillars">
          <CardShell variant="speed">
            <div className="card__title">Inference Speed<span className="block text-[0.7em] font-normal opacity-85 mt-0.5">AI Response Latency</span></div>
            <SpeedGauge activeValue={118} />
            <div className="card__metric"><LedDotText text="118" color="#ffffff" dotRadius={2.2} pitchX={5} pitchY={4} /><span className="card__unit">ms</span></div>
            <div className="card__caption">Average global<br />response</div>
            <LearnMoreButton label="Get Started" onClick={go} />
          </CardShell>
          <CardShell variant="context">
            <TileWall />
            <div className="card__title">Context Window<span className="block text-[0.7em] font-normal opacity-85 mt-0.5">Long-form Understanding</span></div>
            <ContextWindow />
            <div className="card__metric"><LedDotText text="2.4" color="#ffffff" dotRadius={2.2} pitchX={5} pitchY={4} /><span className="card__unit">M</span></div>
            <div className="card__caption">Tokens processed<br />simultaneously</div>
            <LearnMoreButton label="Review Schema" onClick={go} />
          </CardShell>
          <CardShell variant="connections">
            <div className="card__title">Intelligent Connections<span className="block text-[0.7em] font-normal opacity-85 mt-0.5">Cross-Source Context</span></div>
            <ConnectionsMap />
            <div className="card__metric"><LedDotText text="16" color="#ffffff" dotRadius={2.2} pitchX={5} pitchY={4} /><span className="card__unit">K</span></div>
            <div className="card__caption">Connected data<br />sources</div>
            <LearnMoreButton label="Initialize" onClick={go} />
          </CardShell>
        </section>
      </div>

      {/* STATS SECTION */}
      <div ref={s1} className="section-reveal w-full bg-white/50 border-y border-black/5 py-12 sm:py-16 mt-8 sm:mt-16">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          {[
            { val: '12', unit: 'Transformations', sub: 'Bounded rules' },
            { val: '100%', unit: 'Deterministic', sub: 'No AI execution' },
            { val: '<1s', unit: 'Dry Run', sub: 'In-memory sim' },
            { val: '0', unit: 'Data Loss', sub: 'Quarantine safe' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-ink stat-counter">{s.val}</span>
              <span className="text-xs sm:text-sm font-semibold text-copy">{s.unit}</span>
              <span className="text-[10px] sm:text-xs text-copy/60 font-mono">{s.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div ref={s2} className="section-reveal w-full max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">Enterprise-Grade Migration Engine</h2>
          <p className="text-sm sm:text-base text-copy mt-2 max-w-xl mx-auto">Six core capabilities designed for zero-downtime schema transitions with full human oversight.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="feature-card glass-panel-elevated rounded-2xl p-5 sm:p-6 border border-white/50 flex flex-col gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-ink">{f.title}</h3>
                <p className="text-xs text-copy leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div ref={s3} className="section-reveal w-full bg-white/40 border-y border-black/5 py-12 sm:py-20">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">How Shiftbase Works</h2>
            <p className="text-sm text-copy mt-2">From schema definition to production migration in four steps.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col gap-3 relative">
                <span className="text-4xl sm:text-5xl font-bold text-ink/8 font-mono">{s.num}</span>
                <h3 className="text-sm font-semibold text-ink">{s.title}</h3>
                <p className="text-xs text-copy leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 -right-4 text-ink/15">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div ref={s4} className="section-reveal w-full max-w-[var(--content-max)] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #8c1320 0%, #ad314d 40%, #9d4f72 70%, #793246 100%)' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">Ready to Migrate?</h2>
            <p className="text-sm text-white/80 max-w-md mx-auto mb-6">Start your first schema migration with AI-powered mapping, deterministic execution, and complete rollback safety.</p>
            <button onClick={go}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-ink font-bold text-sm shadow-lg hover:shadow-xl hover:bg-white/95 transition-all active:scale-[0.98]">
              <Zap className="w-4 h-4 text-ruby" /> Start Migration
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full border-t border-black/5 py-6 sm:py-8">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-copy/60 font-mono">
          <span>Shiftbase Precision Engine v1.0</span>
          <span>100% Free Tier | Bounded Execution | Zero Data Loss</span>
        </div>
      </footer>
    </div>
  );
}
