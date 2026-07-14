import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash } from 'lucide-react';

export const TagInput = ({ value = [], onChange }) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim().toLowerCase().replace(/^#/, '');
    if (trimmed && !value.includes(trimmed) && value.length < 10) {
      onChange([...value, trimmed]);
      setInput('');
    }
  };

  const removeTag = (tag) => {
    onChange(value.filter(t => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[36px] items-center bg-[#131822] border border-white/10 rounded-xl px-3 py-2 focus-within:border-[#00E5FF] focus-within:ring-1 focus-within:ring-[#00E5FF] transition-all">
        <AnimatePresence>
          {value.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-xs font-medium"
              data-testid={`tag-${tag}`}
            >
              <Hash className="w-3 h-3" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-red-400 transition-colors ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? "Add tags (press Enter)" : ""}
          data-testid="tag-input"
          className="flex-1 min-w-[120px] bg-transparent text-white placeholder:text-neutral-600 outline-none text-sm py-1"
        />
      </div>
      <p className="text-xs text-neutral-600">Press Enter to add. Max 10 tags.</p>
    </div>
  );
};

// Tag badge for display
export const TagBadge = ({ tag, onClick }) => {
  const Element = onClick ? 'button' : 'span';
  return (
    <Element
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00E5FF]/5 border border-[#00E5FF]/20 text-[#00E5FF]/80 text-[10px] font-medium hover:bg-[#00E5FF]/10 transition-colors"
    >
      <Hash className="w-2.5 h-2.5" />
      {tag}
    </Element>
  );
};
