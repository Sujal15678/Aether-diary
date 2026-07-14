import React from 'react';
import { motion } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';
import { MOODS } from '@/components/MoodPicker';

export const SearchBar = ({ searchQuery, onSearchChange, moodFilter, onMoodFilterChange }) => {
  const clearSearch = () => onSearchChange('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-[#00E5FF] transition-colors" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search your entries by title, content, or tags..."
          data-testid="search-input"
          className="w-full bg-[#0B0E14] border border-white/10 rounded-full pl-11 pr-11 py-3 text-white text-sm placeholder:text-neutral-600 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Mood Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-neutral-500 mr-1">
          <Filter className="w-3 h-3" />
          Filter:
        </div>
        <button
          onClick={() => onMoodFilterChange('all')}
          data-testid="filter-all"
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            moodFilter === 'all' || !moodFilter
              ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF]'
              : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
          }`}
        >
          All
        </button>
        {MOODS.map((mood) => {
          const isActive = moodFilter === mood.key;
          return (
            <button
              key={mood.key}
              onClick={() => onMoodFilterChange(mood.key)}
              data-testid={`filter-${mood.key}`}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'border-transparent'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
              }`}
              style={isActive ? {
                backgroundColor: mood.bgColor,
                borderColor: mood.color,
                color: mood.color,
              } : {}}
            >
              <span>{mood.emoji}</span>
              {mood.label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
