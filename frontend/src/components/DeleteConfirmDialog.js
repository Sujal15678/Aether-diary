import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

export const DeleteConfirmDialog = ({ open, onOpenChange, onConfirm, loading }) => {
  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-md pointer-events-auto"
              data-testid="delete-confirm-dialog"
            >
              {/* Red glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 via-transparent to-red-500/30 rounded-2xl blur-2xl opacity-50" />
              
              <div className="relative bg-[#0B0E14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                
                <div className="p-6">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-7 h-7 text-red-400" />
                  </div>

                  <h2 className="font-serif text-2xl font-semibold text-white text-center mb-2">
                    Delete Entry?
                  </h2>
                  <p className="text-sm text-neutral-400 text-center mb-6 leading-relaxed">
                    This action is permanent. Your entry will be gone forever from your journal.
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleClose}
                      disabled={loading}
                      className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-neutral-300 hover:bg-white/5 hover:border-white/20 transition-all font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onConfirm}
                      disabled={loading}
                      data-testid="confirm-delete-button"
                      className="flex-1 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {loading ? 'Deleting...' : 'Delete'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
