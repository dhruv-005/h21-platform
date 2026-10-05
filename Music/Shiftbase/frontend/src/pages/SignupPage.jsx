import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, error } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (password !== confirmPw) { setLocalError('Passwords do not match.'); return; }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const ok = await signup(username, email, password);
    setLoading(false);
    if (ok) navigate('/');
  };

  const displayError = localError || error;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="auth-stage">
        <video className="auth-video" autoPlay muted loop playsInline
          poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/0f4926a4-e660-4df2-9195-2bfb3e341bdd.webp">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_125242_daae1570-386d-4bd5-8896-80499e2371e0.mp4" type="video/mp4" />
        </video>
        <div className="auth-overlay" />
        <div className="auth-grain" />
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
        <div className="auth-orb auth-orb--3" />
      </div>

      <div className="auth-content">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-white/60 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Shiftbase
          </Link>

          <div className="glass-panel-auth rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amethyst to-amethyst-dark flex items-center justify-center text-white shadow-lg" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Create Account</h1>
                <p className="text-xs text-white/60 mt-0.5">Join the Shiftbase migration workspace</p>
              </div>
            </div>

            {displayError && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/25 text-xs font-mono text-red-300 backdrop-blur-sm">
                {displayError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/12 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amethyst/40 focus:border-amethyst/50 transition-all backdrop-blur-sm"
                  placeholder="Choose a username" />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/12 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amethyst/40 focus:border-amethyst/50 transition-all backdrop-blur-sm"
                  placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-white/8 border border-white/12 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amethyst/40 focus:border-amethyst/50 transition-all backdrop-blur-sm"
                    placeholder="Min 6 characters" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-white/40 hover:text-white/80 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">Confirm Password</label>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/12 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amethyst/40 focus:border-amethyst/50 transition-all backdrop-blur-sm"
                  placeholder="Re-enter password" />
                {confirmPw && password === confirmPw && (
                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Passwords match
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-ink text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-white/95 transition-all active:scale-[0.98] disabled:opacity-50 mt-2">
                <UserPlus className="w-4 h-4" />
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-xs text-white/50 text-center mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-white font-semibold hover:text-amethyst-light transition-colors">Sign in</Link>
            </p>
          </div>

          <p className="text-center text-[10px] font-mono text-white/25 mt-8 uppercase tracking-[0.2em]">
            Shiftbase Precision Engine v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
