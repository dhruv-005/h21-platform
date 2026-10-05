import React, { useEffect, useState } from 'react';
import { Menu, X, Cpu } from 'lucide-react';
import axios from 'axios';

export default function TopBar({ onToggleSidebar }) {
  const [healthy, setHealthy] = useState(false);
  const [aiProvider, setAiProvider] = useState('gemini');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const r = await axios.get('/api/health');
        if (r.data.status === 'healthy') { setHealthy(true); setAiProvider(r.data.ai_provider || 'gemini'); }
      } catch { setHealthy(false); }
    }
    check();
    const iv = setInterval(check, 20000);
    return () => clearInterval(iv);
  }, []);

  const toggle = () => { setMenuOpen(!menuOpen); onToggleSidebar(); };

  return (
    <header className="relative z-30 w-full px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        <button onClick={toggle} type="button"
          className="lg:hidden p-2 rounded-xl bg-white/75 hover:bg-white border border-white/50 text-ink shadow-sm transition-all active:scale-90"
          aria-label="Toggle menu">
          {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-copy">Shiftbase</span>
          <span className="text-xs text-ink/30">/</span>
          <span className="text-[10px] sm:text-xs font-semibold text-ink truncate max-w-[120px] sm:max-w-none">Migration Stage</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="glass-panel-elevated px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] sm:text-xs border border-white/60 shadow-sm">
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${healthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-copy font-mono text-[10px] sm:text-[11px] font-medium">{healthy ? 'Online' : 'Offline'}</span>
        </div>
        <div className="hidden sm:flex glass-panel-elevated px-2.5 py-1 rounded-full items-center gap-1 text-[10px] sm:text-[11px] font-mono text-copy border border-white/60 shadow-sm">
          <Cpu className="w-3 h-3 text-ruby" />
          <span className="uppercase">{aiProvider}</span>
        </div>
      </div>
    </header>
  );
}
