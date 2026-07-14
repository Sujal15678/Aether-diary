import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, Plus, Sparkles, Feather, ChevronDown } from 'lucide-react';
import { CreateEntryDialog } from '@/components/CreateEntryDialog';
import { EditEntryDialog } from '@/components/EditEntryDialog';
import { EntryCard } from '@/components/EntryCard';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Toaster, toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Empty State with Floating Diaries
const EmptyState = ({ onCreate }) => {
  const diaries = [
    { delay: 0, duration: 5, x: -80, rotate: -12 },
    { delay: 0.5, duration: 6, x: 80, rotate: 8 },
    { delay: 1, duration: 5.5, x: 0, rotate: 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative min-h-[60vh] flex flex-col items-center justify-center py-16"
    >
      {/* Floating diaries visualization */}
      <div className="relative h-56 w-full max-w-lg mb-12">
        {diaries.map((diary, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 w-32 h-40 rounded-2xl bg-gradient-to-br from-[#0B0E14] to-[#131822] border border-[#00E5FF]/20 shadow-[0_10px_40px_rgba(0,229,255,0.15)]"
            style={{
              marginLeft: `${diary.x - 64}px`,
              marginTop: '-80px',
              transform: `rotate(${diary.rotate}deg)`,
              zIndex: i === 2 ? 3 : i === 0 ? 1 : 2,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [diary.rotate, diary.rotate + 4, diary.rotate],
            }}
            transition={{
              duration: diary.duration,
              delay: diary.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="p-4 h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-1.5 w-3/4 bg-[#00E5FF]/30 rounded-full" />
                <div className="h-1 w-1/2 bg-white/10 rounded-full" />
                <div className="h-1 w-2/3 bg-white/10 rounded-full" />
                <div className="h-1 w-1/3 bg-white/10 rounded-full" />
              </div>
              <div className="flex justify-between items-end">
                <Feather className="w-5 h-5 text-[#00E5FF]/50" />
                <div className="text-[8px] text-[#00E5FF]/40 font-serif italic">Day {i + 1}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center max-w-md"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span className="text-xs uppercase tracking-[0.15em] text-[#00E5FF]">Your Journey Begins</span>
        </div>

        <h3 className="font-serif text-4xl font-semibold text-white mb-3">
          A blank canvas awaits
        </h3>
        <p className="text-neutral-400 mb-8 leading-relaxed">
          Every extraordinary story starts with a single word.
          What will your first entry reveal?
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreate}
          data-testid="empty-state-create-button"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#00E5FF] hover:bg-[#33EEFF] text-black font-semibold text-sm transition-all shadow-[0_0_40px_rgba(0,229,255,0.4)]"
        >
          <Plus className="w-4 h-4" />
          Write Your First Entry
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/entries`);
      setEntries(response.data);
    } catch (error) {
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleEntryCreated = (newEntry) => setEntries([newEntry, ...entries]);
  const handleEntryUpdated = (updatedEntry) => {
    setEntries(entries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
  };
  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setEditDialogOpen(true);
  };
  const handleDeleteClick = (entry) => {
    setSelectedEntry(entry);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!selectedEntry) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${API}/entries/${selectedEntry.id}`);
      setEntries(entries.filter(e => e.id !== selectedEntry.id));
      toast.success('Entry deleted');
      setDeleteDialogOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      toast.error('Failed to delete entry');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030508] relative overflow-hidden">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(0,229,255,0.08),_transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(0,229,255,0.05),_transparent_70%)]" />
      </div>

      {/* Noise overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0B0E14',
            border: '1px solid rgba(0, 229, 255, 0.2)',
            color: '#F8FAFC',
          },
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#030508]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                <BookOpen className="w-5 h-5 text-black" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-serif text-xl font-semibold text-white leading-none">Aether</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-0.5">Diary</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  data-testid="user-menu-button"
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] flex items-center justify-center text-black text-xs font-semibold">
                    {user?.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-neutral-300 hidden sm:inline">{user?.email}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0B0E14]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-white/5">
                          <div className="text-sm text-white font-medium">{user?.email}</div>
                          {user?.role === 'admin' && (
                            <div className="text-xs text-[#00E5FF] mt-1 uppercase tracking-wider">Administrator</div>
                          )}
                        </div>
                        <button
                          onClick={handleLogout}
                          data-testid="logout-button"
                          className="w-full px-4 py-3 flex items-center gap-3 text-sm text-neutral-300 hover:bg-red-500/10 hover:text-red-400 transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                <span className="text-xs uppercase tracking-[0.15em] text-[#00E5FF]">
                  {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
                </span>
              </div>
              <h1 className="font-serif text-5xl sm:text-6xl font-semibold tracking-tight gradient-text mb-2">
                Your Diary
              </h1>
              <p className="text-neutral-400 text-base sm:text-lg">
                A private collection of moments, thoughts, and memories
              </p>
            </div>

            {entries.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCreateDialogOpen(true)}
                data-testid="create-entry-button"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00E5FF] hover:bg-[#33EEFF] text-black font-semibold text-sm transition-all shadow-[0_0_30px_rgba(0,229,255,0.4)] whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                New Entry
              </motion.button>
            )}
          </div>

          {/* Decorative line */}
          <div className="mt-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>

        {/* Entries List or Empty State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full"
            />
          </div>
        ) : entries.length === 0 ? (
          <EmptyState onCreate={() => setCreateDialogOpen(true)} />
        ) : (
          <motion.div
            layout
            className="space-y-5"
            data-testid="entries-list"
          >
            <AnimatePresence mode="popLayout">
              {entries.map((entry, index) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Dialogs */}
      <CreateEntryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onEntryCreated={handleEntryCreated}
      />
      <EditEntryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        entry={selectedEntry}
        onEntryUpdated={handleEntryUpdated}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
};
