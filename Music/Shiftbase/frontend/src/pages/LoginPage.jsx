import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff, ShieldCheck, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (ok) navigate('/');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Video Background Layer */}
      <div className="auth-stage">
        <video
          className="auth-video"
          autoPlay muted loop playsInline
          poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/5c3ec08f-2dbf-4c0a-8588-f6106a789443.webp"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_125226_45cb4f38-aa7e-47e1-885d-ae0b69745369.mp4" type="video/mp4" />
        </video>
        <div className="auth-overlay" />
        <div className="auth-grain" />
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
        <div className="auth-orb auth-orb--3" />
      </div>

      {/* Content Layer */}
      <div className="auth-content">
        <div className="w-full max-w-md">
          {/* Back Link */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-white/60 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Shiftbase
          </Link>

          {/* Glass Login Card */}
          <div className="glass-panel-auth rounded-3xl p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-7">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-ruby to-ruby-dark flex items-center justify-center text-white shadow-lg" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Welcome Back</h1>
                <p className="text-xs text-white/60 mt-0.5">Sign in to your migration workspace</p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/25 text-xs font-mono text-red-300 backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">Username</label>
                <input
                  type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/12 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-ruby/40 focus:border-ruby/50 transition-all backdrop-blur-sm"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-white/8 border border-white/12 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-ruby/40 focus:border-ruby/50 transition-all backdrop-blur-sm"
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-white/40 hover:text-white/80 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-ink text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-white/95 transition-all active:scale-[0.98] disabled:opacity-50 mt-2">
                <LogIn className="w-4 h-4" />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-xs text-white/50 text-center mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-white font-semibold hover:text-ruby-light transition-colors">Create one</Link>
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
