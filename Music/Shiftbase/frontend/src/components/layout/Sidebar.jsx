import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Layers, Sparkles, History, ShieldCheck, ChevronRight, Database, X, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Hero Stage', icon: Sparkles, exact: true },
    { to: '/setup', label: 'Schema Setup', icon: Layers },
    { to: '/audit', label: 'Audit Trail', icon: History },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <div onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true" />
      )}
      <aside className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 sm:w-64 max-w-[85vw] p-3 sm:p-4 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="glass-panel-elevated rounded-2xl p-4 flex flex-col gap-4 shadow-card-spatial border border-white/50 backdrop-blur-xl h-full justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ruby to-ruby-dark flex items-center justify-center text-white font-bold shadow-sm text-sm">S</div>
                <div>
                  <div className="font-semibold text-ink text-sm tracking-tight flex items-center gap-1.5">
                    Shiftbase <span className="w-1.5 h-1.5 rounded-full bg-ruby animate-pulse" />
                  </div>
                  <div className="text-[10px] text-copy font-mono uppercase tracking-wider">Precision Engine</div>
                </div>
              </div>
              <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-black/5 text-copy transition active:scale-90" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            {user ? (
              <div className="px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-emerald-950 truncate">{user.username}</span>
                </div>
                <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-700 transition flex-shrink-0" title="Logout">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <NavLink to="/login" onClick={onClose}
                className="px-3 py-2.5 rounded-xl bg-ink/5 border border-black/10 flex items-center justify-center gap-1.5 text-xs font-medium text-ink hover:bg-ink hover:text-white transition-all">
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </NavLink>
            )}

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
                return (
                  <NavLink key={item.to} to={item.to} onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${isActive ? 'bg-ink text-white shadow-sm' : 'text-copy hover:text-ink hover:bg-white/60'}`}>
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-ruby-light' : 'text-copy'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-3 border-t border-black/5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-copy px-1">
              <span className="flex items-center gap-1.5 text-[11px]"><Database className="w-3 h-3 text-copy/60" /> SQLite WAL</span>
              <span className="text-[9px] text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono font-bold">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between text-xs text-copy px-1">
              <span className="flex items-center gap-1.5 text-[11px]"><ShieldCheck className="w-3 h-3 text-copy/60" /> Bounded Gate</span>
              <span className="text-[9px] text-ruby bg-ruby/10 px-1.5 py-0.5 rounded font-mono font-bold">ENFORCED</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
