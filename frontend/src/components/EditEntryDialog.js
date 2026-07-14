import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { MoodPicker } from '@/components/MoodPicker';
import { ImageUpload } from '@/components/ImageUpload';
import { TagInput } from '@/components/TagInput';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const EditEntryDialog = ({ open, onOpenChange, entry, onEntryUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [imageUrl, setImageUrl] = useState(null);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setMood(entry.mood || 'neutral');
      setImageUrl(entry.image_url || null);
      setTags(entry.tags || []);
    }
  }, [entry]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entry) return;
    setLoading(true);

    try {
      const response = await axios.put(`${API}/entries/${entry.id}`, {
        title,
        content,
        mood,
        image_url: imageUrl,
        tags,
      });
      toast.success('Entry updated successfully!');
      onOpenChange(false);
      if (onEntryUpdated) onEntryUpdated(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update entry');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
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

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-2xl pointer-events-auto my-8"
              data-testid="edit-entry-dialog"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF]/30 via-transparent to-[#00E5FF]/30 rounded-2xl blur-2xl opacity-50" />

              <div className="relative bg-[#0B0E14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />

                <form onSubmit={handleSubmit}>
                  <div className="flex items-start justify-between p-6 pb-4 border-b border-white/5">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center flex-shrink-0">
                        <Edit3 className="w-5 h-5 text-[#00E5FF]" />
                      </div>
                      <div>
                        <h2 className="font-serif text-2xl font-semibold text-white">Edit Entry</h2>
                        <p className="text-sm text-neutral-500 mt-0.5">Refine your thoughts and memories</p>
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

                  <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.15em] text-neutral-500 mb-2">Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        data-testid="edit-title-input"
                        className="w-full bg-[#131822] border border-white/10 rounded-xl px-4 py-3 text-white font-serif text-lg placeholder:text-neutral-600 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.15em] text-neutral-500 mb-2">Mood</label>
                      <MoodPicker value={mood} onChange={setMood} />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.15em] text-neutral-500 mb-2">Your Thoughts</label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={6}
                        data-testid="edit-content-input"
                        className="w-full bg-[#131822] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all resize-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.15em] text-neutral-500 mb-2">Image</label>
                      <ImageUpload value={imageUrl} onChange={setImageUrl} />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.15em] text-neutral-500 mb-2">Tags</label>
                      <TagInput value={tags} onChange={setTags} />
                    </div>
                  </div>

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
                      data-testid="edit-entry-submit"
                      className="px-6 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#33EEFF] text-black font-semibold text-sm transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Changes
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
