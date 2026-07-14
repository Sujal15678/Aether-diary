import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export const ImageUpload = ({ value, onChange }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setUploading(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      onChange(event.target.result);
      setUploading(false);
      toast.success('Image uploaded!');
    };
    reader.onerror = () => {
      toast.error('Failed to read image');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        data-testid="image-upload-input"
      />

      {value ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-xl overflow-hidden border border-white/10 bg-[#131822] group"
        >
          <img
            src={value}
            alt="Entry attachment"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={handleRemove}
            data-testid="remove-image-button"
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-red-500/80 hover:border-red-500 transition-all"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </motion.div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          data-testid="upload-image-button"
          className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-white/10 hover:border-[#00E5FF]/50 bg-[#131822]/50 hover:bg-[#131822] transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center group-hover:bg-[#00E5FF]/20 transition-colors">
            {uploading ? (
              <div className="w-5 h-5 border-2 border-[#00E5FF]/30 border-t-[#00E5FF] rounded-full animate-spin" />
            ) : (
              <ImageIcon className="w-5 h-5 text-[#00E5FF]" />
            )}
          </div>
          <div className="text-center">
            <div className="text-sm text-white font-medium">Add an image</div>
            <div className="text-xs text-neutral-500 mt-0.5">Click to upload (max 2MB)</div>
          </div>
        </motion.button>
      )}
    </div>
  );
};
