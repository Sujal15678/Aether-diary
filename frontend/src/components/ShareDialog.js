import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Check, Link2, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ShareDialog = ({ open, onOpenChange, entry, onShareUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && entry) {
      if (entry.share_token) {
        setShareUrl(`${window.location.origin}/shared/${entry.share_token}`);
      } else {
        setShareUrl('');
      }
    }
  }, [open, entry]);

  const handleCreateLink = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/entries/${entry.id}/share`);
      const url = `${window.location.origin}/shared/${response.data.share_token}`;
      setShareUrl(url);
      if (onShareUpdated) onShareUpdated({ ...entry, share_token: response.data.share_token });
      toast.success('Share link created!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API}/entries/${entry.id}/share`);
      setShareUrl('');
      if (onShareUpdated) onShareUpdated({ ...entry, share_token: null });
      toast.success('Share link revoked');
    } catch (error) {
      toast.error('Failed to revoke link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    if (!loading) onOpenChange(false);
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-md pointer-events-auto"
              data-testid="share-dialog"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF]/30 via-transparent to-[#00E5FF]/30 rounded-2xl blur-2xl opacity-50" />

              <div className="relative bg-[#0B0E14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />

                <div className="flex items-start justify-between p-6 pb-4 border-b border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center flex-shrink-0">
                      <Share2 className="w-5 h-5 text-[#00E5FF]" />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl font-semibold text-white">Share Entry</h2>
                      <p className="text-sm text-neutral-500 mt-0.5">Share this moment with someone special</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Entry preview */}
                  <div className="mb-5 p-4 rounded-xl bg-[#131822] border border-white/5">
                    <div className="text-xs uppercase tracking-[0.15em] text-neutral-500 mb-1">You're sharing</div>
                    <div className="font-serif text-lg text-white truncate">{entry.title}</div>
                  </div>

                  {shareUrl ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-[0.15em] text-neutral-500 mb-2">
                          Public Share Link
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1 flex items-center gap-2 bg-[#131822] border border-[#00E5FF]/20 rounded-xl px-3 py-2.5 min-w-0">
                            <Link2 className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
                            <input
                              type="text"
                              value={shareUrl}
                              readOnly
                              className="flex-1 bg-transparent text-white text-xs outline-none min-w-0"
                              onClick={(e) => e.target.select()}
                              data-testid="share-url-input"
                            />
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopy}
                            data-testid="copy-share-link-button"
                            className="px-3 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#33EEFF] text-black font-semibold text-sm transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy'}
                          </motion.button>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                        <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-yellow-500 text-xs">!</span>
                        </div>
                        <div className="text-xs text-neutral-400 leading-relaxed">
                          Anyone with this link can view your entry. Your email will be shown partially masked.
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <a
                          href={shareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:bg-white/5 hover:border-white/20 transition-all text-sm font-medium flex items-center justify-center gap-1.5"
                          data-testid="preview-share-link"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Preview
                        </a>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleRevoke}
                          disabled={loading}
                          data-testid="revoke-share-button"
                          className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          Revoke
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-neutral-400 mb-5 leading-relaxed">
                        Create a public link to share this entry with anyone.
                        You can revoke access anytime.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCreateLink}
                        disabled={loading}
                        data-testid="create-share-link-button"
                        className="w-full py-3 rounded-xl bg-[#00E5FF] hover:bg-[#33EEFF] text-black font-semibold text-sm transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                        Generate Share Link
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
