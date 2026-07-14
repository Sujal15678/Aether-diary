import React from 'react';
import { motion } from 'framer-motion';

// Mood configuration matching design guidelines
export const MOODS = [
  { key: 'happy', label: 'Happy', emoji: '😊', color: '#00E5FF', bgColor: 'rgba(0,229,255,0.15)' },
  { key: 'calm', label: 'Calm', emoji: '😌', color: '#818CF8', bgColor: 'rgba(129,140,248,0.15)' },
  { key: 'neutral', label: 'Neutral', emoji: '😐', color: '#94A3B8', bgColor: 'rgba(148,163,184,0.15)' },
  { key: 'anxious', label: 'Anxious', emoji: '😰', color: '#FBBF24', bgColor: 'rgba(251,191,36,0.15)' },
  { key: 'sad', label: 'Sad', emoji: '😢', color: '#64748B', bgColor: 'rgba(100,116,139,0.15)' },
];

export const getMoodConfig = (moodKey) => {
  return MOODS.find(m => m.key === moodKey) || MOODS[2]; // Default to neutral
};

export const MoodPicker = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {MOODS.map((mood) => {
        const isSelected = value === mood.key;
        return (
          <motion.button
            key={mood.key}
            type="button"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(mood.key)}
            data-testid={`mood-${mood.key}`}
            className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${
              isSelected
                ? 'border-transparent'
                : 'border-white/10 hover:border-white/20 bg-[#131822]'
            }`}
            style={isSelected ? {
              backgroundColor: mood.bgColor,
              borderColor: mood.color,
              boxShadow: `0 0 20px ${mood.color}40`,
            } : {}}
          >
            <span className="text-2xl mb-1">{mood.emoji}</span>
            <span
              className="text-[10px] uppercase tracking-wider font-medium"
              style={{ color: isSelected ? mood.color : '#94A3B8' }}
            >
              {mood.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

// Small mood badge for display in cards
export const MoodBadge = ({ mood }) => {
  const config = getMoodConfig(mood);
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: config.bgColor,
        borderColor: `${config.color}40`,
        color: config.color,
      }}
    >
      <span>{config.emoji}</span>
      <span className="uppercase tracking-wider">{config.label}</span>
    </div>
  );
};
