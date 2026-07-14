import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const CreateEntryDialog = ({ open, onOpenChange, onEntryCreated }) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/entries`, { title, content });
      toast.success('Entry created successfully!');
      setTitle('');
      setContent('');
      onOpenChange(false);
      if (onEntryCreated) onEntryCreated(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          
          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-2xl pointer-events-auto"
              data-testid="create-entry-dialog"
            >
              {/* Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF]/30 via-transparent to-[#00E5FF]/30 rounded-2xl blur-2xl opacity-50" />
              
              <div className="relative bg-[#0B0E14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden">
                {/* Header accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />
                
                <form onSubmit={handleSubmit}>
                  {/* Header */}
                  <div className="flex items-start justify-between p-6 pb-4 border-b border-white/5">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-[#00E5FF]" />
                      </div>
                      <div>
                        <h2 className="font-serif text-2xl font-semibold text-white">
                          New Entry
                        </h2>
                        <p className="text-sm text-neutral-500 mt-0.5 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-[#00E5FF]" />
                          Capture this moment forever
                        </p>
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

                  {/* Body */}
                  <div className="p-6 space-y-5">
                    {/* Title */}
                    <div>
                      <label className="block text-xs uppercase tracking-[0.15em] text-neutral-500 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Give your entry a title..."
                        required
                        data-testid="entry-title-input"
                        className="w-full bg-[#131822] border border-white/10 rounded-xl px-4 py-3 text-white font-serif text-lg placeholder:text-neutral-600 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-xs uppercase tracking-[0.15em] text-neutral-500 mb-2">
                        Your Thoughts
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind today? Let your thoughts flow..."
                        required
                        rows={8}
                        data-testid="entry-content-input"
                        className="w-full bg-[#131822] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-white/5 bg-[#030508]/50">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:bg-white/5 hover:border-white/20 transition-all font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      data-testid="create-entry-submit"
                      className="px-6 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#33EEFF] text-black font-semibold text-sm transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Entry
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
