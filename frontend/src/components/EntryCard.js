import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Calendar, ArrowUpRight, Lock, Share2, Download } from 'lucide-react';
import { MoodBadge, getMoodConfig } from '@/components/MoodPicker';
import { TagBadge } from '@/components/TagInput';
import { exportEntryToPDF } from '@/lib/pdfExport';
import { toast } from 'sonner';

export const EntryCard = ({ entry, onEdit, onDelete, onShare, onUnlock, index }) => {
  const formattedDate = format(new Date(entry.created_at), 'MMMM dd, yyyy');
  const formattedTime = format(new Date(entry.created_at), 'h:mm a');
  const dayNumber = format(new Date(entry.created_at), 'dd');
  const monthShort = format(new Date(entry.created_at), 'MMM');
  const moodConfig = getMoodConfig(entry.mood);
  const isLocked = entry.is_locked;

  const handleDownloadPDF = (e) => {
    e.stopPropagation();
    if (isLocked) {
      toast.error('Unlock the entry first to export');
      return;
    }
    try {
      exportEntryToPDF(entry);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('Failed to export PDF');
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    if (isLocked) {
      toast.error('Unlock the entry first to share');
      return;
    }
    onShare(entry);
  };

  const handleUnlockClick = () => {
    if (onUnlock) onUnlock(entry);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.5, delay: (index || 0) * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className="group relative"
      data-testid={`entry-card-${entry.id}`}
    >
      <div
        className="absolute -inset-0.5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${isLocked ? '#EAB308' : moodConfig.color}30, transparent)`,
        }}
      />

      <div className={`relative bg-gradient-to-br from-[#0B0E14] to-[#0B0E14]/95 border rounded-2xl overflow-hidden transition-all duration-500 ${
        isLocked
          ? 'border-yellow-500/20 group-hover:border-yellow-500/40'
          : 'border-white/5 group-hover:border-[#00E5FF]/30'
      }`}>
        {/* Mood colored top strip */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(to right, transparent, ${isLocked ? '#EAB308' : moodConfig.color}, transparent)` }}
        />

        {/* Image at top if present and not locked */}
        {entry.image_url && !isLocked && (
          <div className="relative w-full h-56 overflow-hidden bg-[#131822]">
            <motion.img
              src={entry.image_url}
              alt={entry.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent" />
          </div>
        )}

        <div className="relative p-6 sm:p-7">
          <div
            className="absolute top-0 right-0 w-40 h-40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at top right, ${isLocked ? 'rgba(234,179,8,0.08)' : 'rgba(0,229,255,0.08)'}, transparent 70%)`
            }}
          />

          <div className="relative flex items-start gap-5">
            {/* Date Badge */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: -3 }}
              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-[#131822] to-[#0B0E14] border flex flex-col items-center justify-center transition-colors ${
                isLocked
                  ? 'border-yellow-500/20 group-hover:border-yellow-500/50'
                  : 'border-[#00E5FF]/20 group-hover:border-[#00E5FF]/50'
              }`}
            >
              <span className={`text-[10px] uppercase tracking-[0.15em] font-medium ${
                isLocked ? 'text-yellow-500/70' : 'text-[#00E5FF]/70'
              }`}>
                {monthShort}
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-semibold text-white">
                {dayNumber}
              </span>
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3
                      className={`font-serif text-xl sm:text-2xl font-semibold leading-tight transition-colors flex-1 min-w-0 ${
                        isLocked
                          ? 'text-white group-hover:text-yellow-500'
                          : 'text-white group-hover:text-[#00E5FF]'
                      }`}
                      data-testid="entry-title"
                    >
                      {entry.title}
                    </h3>
                    {isLocked && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-medium uppercase tracking-wider">
                        <Lock className="w-2.5 h-2.5" />
                        Locked
                      </div>
                    )}
                    {entry.share_token && !isLocked && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-medium uppercase tracking-wider">
                        <Share2 className="w-2.5 h-2.5" />
                        Shared
                      </div>
                    )}
                    {entry.mood && entry.mood !== 'neutral' && !isLocked && (
                      <MoodBadge mood={entry.mood} />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 uppercase tracking-[0.15em]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-700" />
                    <span>{formattedTime}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 sm:gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {!isLocked && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleShareClick}
                        data-testid={`share-entry-${entry.id}`}
                        title="Share"
                        className="w-9 h-9 rounded-full bg-white/5 border border-white/5 hover:bg-[#00E5FF]/20 hover:border-[#00E5FF]/30 hover:text-[#00E5FF] flex items-center justify-center transition-all text-neutral-400"
                      >
                        <Share2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleDownloadPDF}
                        data-testid={`download-entry-${entry.id}`}
                        title="Download PDF"
                        className="w-9 h-9 rounded-full bg-white/5 border border-white/5 hover:bg-[#00E5FF]/20 hover:border-[#00E5FF]/30 hover:text-[#00E5FF] flex items-center justify-center transition-all text-neutral-400"
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>
                    </>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(entry)}
                    data-testid={`edit-entry-${entry.id}`}
                    title="Edit"
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/5 hover:bg-[#00E5FF]/20 hover:border-[#00E5FF]/30 hover:text-[#00E5FF] flex items-center justify-center transition-all text-neutral-400"
                  >
                    <Edit3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(entry)}
                    data-testid={`delete-entry-${entry.id}`}
                    title="Delete"
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/5 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 flex items-center justify-center transition-all text-neutral-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Content or Locked State */}
              {isLocked ? (
                <div className="mt-2">
                  <div className="p-6 rounded-xl bg-yellow-500/5 border border-yellow-500/10 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-3">
                      <Lock className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-sm text-neutral-400 mb-4">
                      This entry is password protected
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleUnlockClick}
                      data-testid={`unlock-entry-${entry.id}`}
                      className="px-5 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20 transition-all text-sm font-medium flex items-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Unlock
                    </motion.button>
                  </div>
                </div>
              ) : (
                <>
                  <p
                    className="text-neutral-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap line-clamp-3 group-hover:line-clamp-none transition-all"
                    data-testid="entry-content"
                  >
                    {entry.content}
                  </p>

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {entry.tags.map((tag) => (
                        <TagBadge key={tag} tag={tag} />
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-[#00E5FF]/20 to-transparent" />
                    <ArrowUpRight className="w-4 h-4 text-[#00E5FF]/40 group-hover:text-[#00E5FF] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
