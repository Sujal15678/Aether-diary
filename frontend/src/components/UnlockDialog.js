import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Loader2, Unlock } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const UnlockDialog = ({ open, onOpenChange, entry, onUnlocked }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entry) return;
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/entries/${entry.id}/unlock`, { password });
      toast.success('Entry unlocked!');
      onOpenChange(false);
      setPassword('');
      if (onUnlocked) onUnlocked(response.data);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to unlock');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setPassword('');
      setError('');
    }
  };

  if (!entry) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-md pointer-events-auto"
              data-testid="unlock-dialog"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/30 via-transparent to-yellow-500/30 rounded-2xl blur-2xl opacity-50" />

              <div className="relative bg-[#0B0E14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

                <form onSubmit={handleSubmit}>
                  <div className="flex items-start justify-between p-6 pb-4 border-b border-white/5">
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0"
                      >
                        <Lock className="w-5 h-5 text-yellow-500" />
                      </motion.div>
                      <div>
                        <h2 className="font-serif text-2xl font-semibold text-white">Locked Entry</h2>
                        <p className="text-sm text-neutral-500 mt-0.5">Enter password to unlock</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="p-3 rounded-xl bg-[#131822] border border-white/5">
                      <div className="text-xs uppercase tracking-[0.15em] text-neutral-500 mb-1">Locked entry</div>
                      <div className="font-serif text-lg text-white truncate">{entry.title}</div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.15em] text-neutral-500 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          required
                          autoFocus
                          data-testid="unlock-password-input"
                          className="w-full bg-[#131822] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-neutral-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5"
                      >
                        {error}
                      </motion.div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      data-testid="unlock-submit-button"
                      className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-sm transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                      Unlock Entry
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
