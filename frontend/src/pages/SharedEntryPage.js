import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { BookOpen, Calendar, User as UserIcon, AlertCircle, Sparkles } from 'lucide-react';
import { MoodBadge } from '@/components/MoodPicker';
import { TagBadge } from '@/components/TagInput';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const SharedEntryPage = () => {
  const { token } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        // Use axios without auth header
        const response = await axios.get(`${API}/shared/${token}`, {
          headers: { Authorization: '' },
        });
        setEntry(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load shared entry');
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030508] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030508] relative overflow-hidden flex items-center justify-center p-4">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(239,68,68,0.05),_transparent_70%)]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center max-w-md"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="font-serif text-4xl font-semibold text-white mb-3">Link not found</h1>
          <p className="text-neutral-400 mb-8 leading-relaxed">{error}</p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00E5FF] hover:bg-[#33EEFF] text-black font-semibold text-sm transition-all shadow-[0_0_30px_rgba(0,229,255,0.4)]"
          >
            Go to Aether Diary
          </Link>
        </motion.div>
      </div>
    );
  }

  const formattedDate = format(new Date(entry.created_at), 'MMMM dd, yyyy');
  const formattedTime = format(new Date(entry.created_at), 'h:mm a');

  return (
    <div className="min-h-screen bg-[#030508] relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(0,229,255,0.08),_transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(0,229,255,0.05),_transparent_70%)]" />
      </div>

      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      {/* Header */}
      <header className="relative border-b border-white/5 bg-[#030508]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                <BookOpen className="w-5 h-5 text-black" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-serif text-xl font-semibold text-white leading-none">Aether</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-0.5">Diary</p>
              </div>
            </Link>
            <Link
              to="/auth"
              data-testid="join-aether-button"
              className="px-4 py-2 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] hover:bg-[#00E5FF]/20 hover:border-[#00E5FF]/40 transition-all text-xs font-medium uppercase tracking-wider"
            >
              Join Aether
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Shared with you badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#00E5FF]">Shared with you</span>
          </div>

          {/* Author + date */}
          <div className="flex items-center gap-4 mb-6 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] flex items-center justify-center text-black text-xs font-semibold">
                {entry.author?.[0]?.toUpperCase()}
              </div>
              <span>{entry.author}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-neutral-700" />
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>

          {/* Title */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1
              className="font-serif text-4xl sm:text-5xl font-semibold text-white leading-tight gradient-text flex-1"
              data-testid="shared-entry-title"
            >
              {entry.title}
            </h1>
            {entry.mood && entry.mood !== 'neutral' && (
              <MoodBadge mood={entry.mood} />
            )}
          </div>

          <div className="text-xs text-neutral-500 uppercase tracking-[0.15em] mb-8">
            {formattedTime}
          </div>

          {/* Divider */}
          <div className="mb-8 h-px bg-gradient-to-r from-[#00E5FF]/40 via-white/10 to-transparent" />

          {/* Image */}
          {entry.image_url && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 rounded-2xl overflow-hidden border border-white/5"
            >
              <img
                src={entry.image_url}
                alt={entry.title}
                className="w-full max-h-[500px] object-cover"
              />
            </motion.div>
          )}

          {/* Content */}
          <div
            className="font-serif text-lg sm:text-xl text-neutral-200 leading-relaxed whitespace-pre-wrap"
            data-testid="shared-entry-content"
          >
            {entry.content}
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10">
              {entry.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 pt-8 border-t border-white/5 text-center"
          >
            <p className="text-sm text-neutral-500 mb-4">
              This is a private moment shared with you from someone's diary.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/30 hover:text-[#00E5FF] transition-all text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Start your own journal
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};
