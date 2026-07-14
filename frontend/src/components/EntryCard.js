import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Calendar, ArrowUpRight } from 'lucide-react';
import { MoodBadge, getMoodConfig } from '@/components/MoodPicker';
import { TagBadge } from '@/components/TagInput';

export const EntryCard = ({ entry, onEdit, onDelete, index }) => {
  const formattedDate = format(new Date(entry.created_at), 'MMMM dd, yyyy');
  const formattedTime = format(new Date(entry.created_at), 'h:mm a');
  const dayNumber = format(new Date(entry.created_at), 'dd');
  const monthShort = format(new Date(entry.created_at), 'MMM');
  const moodConfig = getMoodConfig(entry.mood);

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
          background: `linear-gradient(to right, transparent, ${moodConfig.color}30, transparent)`,
        }}
      />

      <div className="relative bg-gradient-to-br from-[#0B0E14] to-[#0B0E14]/95 border border-white/5 group-hover:border-[#00E5FF]/30 rounded-2xl overflow-hidden transition-all duration-500">
        {/* Mood colored top strip */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(to right, transparent, ${moodConfig.color}, transparent)` }}
        />

        {/* Image at top if present */}
        {entry.image_url && (
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
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,_rgba(0,229,255,0.08),_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative flex items-start gap-5">
            {/* Date Badge */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: -3 }}
              className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-[#131822] to-[#0B0E14] border border-[#00E5FF]/20 flex flex-col items-center justify-center group-hover:border-[#00E5FF]/50 transition-colors"
            >
              <span className="text-[10px] uppercase tracking-[0.15em] text-[#00E5FF]/70 font-medium">
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
                      className="font-serif text-xl sm:text-2xl font-semibold text-white leading-tight group-hover:text-[#00E5FF] transition-colors flex-1 min-w-0"
                      data-testid="entry-title"
                    >
                      {entry.title}
                    </h3>
                    {entry.mood && entry.mood !== 'neutral' && (
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

                <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(entry)}
                    data-testid={`edit-entry-${entry.id}`}
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/5 hover:bg-[#00E5FF]/20 hover:border-[#00E5FF]/30 hover:text-[#00E5FF] flex items-center justify-center transition-all text-neutral-400"
                  >
                    <Edit3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(entry)}
                    data-testid={`delete-entry-${entry.id}`}
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/5 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 flex items-center justify-center transition-all text-neutral-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

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
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
