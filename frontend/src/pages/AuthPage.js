import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

// Floating diary cards for the background
const FloatingDiaries = () => {
  const diaries = [
    { top: '10%', left: '5%', delay: 0, duration: 6, rotate: -8 },
    { top: '20%', right: '8%', delay: 1, duration: 7, rotate: 12 },
    { top: '55%', left: '3%', delay: 2, duration: 8, rotate: 5 },
    { top: '70%', right: '5%', delay: 0.5, duration: 6.5, rotate: -10 },
    { top: '85%', left: '15%', delay: 1.5, duration: 7.5, rotate: 8 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {diaries.map((diary, i) => (
        <motion.div
          key={i}
          className="absolute w-32 h-40 sm:w-40 sm:h-52 rounded-2xl bg-gradient-to-br from-[#0B0E14] to-[#131822] border border-[#00E5FF]/10 shadow-[0_10px_40px_rgba(0,229,255,0.08)]"
          style={{
            top: diary.top,
            left: diary.left,
            right: diary.right,
            transform: `rotate(${diary.rotate}deg)`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [diary.rotate, diary.rotate + 3, diary.rotate],
          }}
          transition={{
            duration: diary.duration,
            delay: diary.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="p-4 h-full flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-1 w-3/4 bg-[#00E5FF]/20 rounded-full" />
              <div className="h-1 w-1/2 bg-white/10 rounded-full" />
              <div className="h-1 w-2/3 bg-white/10 rounded-full" />
            </div>
            <BookOpen className="w-6 h-6 text-[#00E5FF]/40" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = mode === 'login'
      ? await login(email, password)
      : await register(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030508]">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,229,255,0.15),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,229,255,0.1),_transparent_50%)]" />
      
      {/* Floating diaries background */}
      <FloatingDiaries />

      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Logo & Title */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] mb-6 shadow-[0_0_40px_rgba(0,229,255,0.4)]"
            >
              <BookOpen className="w-10 h-10 text-black" strokeWidth={2.5} />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-serif text-5xl font-semibold tracking-tight gradient-text mb-3"
            >
              Aether Diary
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-neutral-400 text-base flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#00E5FF]" />
              Your private sanctuary of thoughts
            </motion.p>
          </div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00E5FF]/20 via-transparent to-[#00E5FF]/20 rounded-2xl blur-xl opacity-50" />
            
            <div className="relative bg-[#0B0E14]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              {/* Tab Switcher */}
              <div className="flex bg-[#131822] rounded-xl p-1 mb-8">
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  data-testid="login-tab"
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    mode === 'login'
                      ? 'bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('register'); setError(''); }}
                  data-testid="register-tab"
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    mode === 'register'
                      ? 'bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="font-serif text-2xl font-semibold text-white mb-1">
                      {mode === 'login' ? 'Welcome Back' : 'Begin Your Journey'}
                    </h2>
                    <p className="text-sm text-neutral-500">
                      {mode === 'login' ? 'Enter your credentials to continue' : 'Create your private space'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs uppercase tracking-[0.15em] text-neutral-500 mb-2">
                        Email
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-[#00E5FF] transition-colors" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="you@example.com"
                          data-testid={mode === 'login' ? 'login-email-input' : 'register-email-input'}
                          className="w-full bg-[#131822] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-neutral-600 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs uppercase tracking-[0.15em] text-neutral-500 mb-2">
                        Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-[#00E5FF] transition-colors" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          data-testid={mode === 'login' ? 'login-password-input' : 'register-password-input'}
                          className="w-full bg-[#131822] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-neutral-600 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Confirm Password (Register only) */}
                    {mode === 'register' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-xs uppercase tracking-[0.15em] text-neutral-500 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-[#00E5FF] transition-colors" />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            data-testid="register-confirm-password-input"
                            className="w-full bg-[#131822] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-neutral-600 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Error */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5"
                        data-testid="error-message"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      data-testid={mode === 'login' ? 'login-submit-button' : 'register-submit-button'}
                      className="w-full bg-[#00E5FF] hover:bg-[#33EEFF] text-black font-semibold rounded-xl px-6 py-3.5 mt-2 transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:shadow-[0_0_40px_rgba(0,229,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          {mode === 'login' ? 'Sign In' : 'Create Account'}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs text-neutral-600 mt-8 tracking-wider"
          >
            YOUR THOUGHTS. YOUR SPACE. ENCRYPTED.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};
