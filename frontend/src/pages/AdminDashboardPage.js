import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  BookOpen, Shield, Users, FileText, Activity, TrendingUp,
  ChevronLeft, LogOut, ChevronDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { getMoodConfig, MOODS } from '@/components/MoodPicker';
import { Toaster, toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatCard = ({ title, value, icon: Icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -4 }}
    className="relative group"
    data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <div className="absolute -inset-0.5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
      style={{ background: `linear-gradient(to right, transparent, ${color}30, transparent)` }}
    />
    <div className="relative bg-[#0B0E14] border border-white/5 group-hover:border-white/10 rounded-2xl p-6 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, borderColor: `${color}30`, borderWidth: '1px' }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <TrendingUp className="w-4 h-4 text-neutral-600" />
      </div>
      <div className="font-serif text-4xl font-semibold text-white mb-1">{value}</div>
      <div className="text-xs uppercase tracking-[0.15em] text-neutral-500">{title}</div>
    </div>
  </motion.div>
);

export const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/users`),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Redirect if not admin (after all hooks)
  if (user && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Prepare mood chart data
  const moodChartData = stats
    ? MOODS.map(m => ({
        name: m.label,
        emoji: m.emoji,
        count: stats.entries_by_mood[m.key] || 0,
        color: m.color,
      }))
    : [];

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-[#030508] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030508] relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(168,85,247,0.08),_transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(0,229,255,0.05),_transparent_70%)]" />
      </div>

      <Toaster position="top-right" toastOptions={{ style: { background: '#0B0E14', border: '1px solid rgba(0, 229, 255, 0.2)', color: '#F8FAFC' } }} />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#030508]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                data-testid="back-to-diary-button"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="font-serif text-xl font-semibold text-white leading-none">Admin</h1>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-0.5">Console</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-semibold">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-neutral-300 hidden sm:inline max-w-[150px] truncate">{user?.email}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0B0E14]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-white/5">
                        <div className="text-sm text-white font-medium truncate">{user?.email}</div>
                        <div className="text-xs text-purple-400 mt-1 uppercase tracking-wider">Administrator</div>
                      </div>
                      <button
                        onClick={handleLogout}
                        data-testid="admin-logout-button"
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
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs uppercase tracking-[0.15em] text-purple-400">Administrator Access</span>
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl font-semibold tracking-tight gradient-text mb-2">
            Admin Console
          </h1>
          <p className="text-neutral-400 text-base sm:text-lg">
            System overview and user management
          </p>
          <div className="mt-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard title="Total Users" value={stats.total_users} icon={Users} color="#00E5FF" delay={0.1} />
          <StatCard title="Total Entries" value={stats.total_entries} icon={FileText} color="#818CF8" delay={0.2} />
          <StatCard title="Administrators" value={stats.total_admins} icon={Shield} color="#A855F7" delay={0.3} />
          <StatCard title="Last 7 Days" value={stats.entries_last_7_days} icon={Activity} color="#FBBF24" delay={0.4} />
        </div>

        {/* Charts and Users */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Mood Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-3 bg-[#0B0E14] border border-white/5 rounded-2xl p-6"
            data-testid="mood-chart"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl font-semibold text-white">Emotional Landscape</h3>
                <p className="text-xs text-neutral-500 uppercase tracking-[0.15em] mt-1">Entries by mood</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodChartData}>
                  <XAxis
                    dataKey="name"
                    stroke="#475569"
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={{ stroke: '#1F2937' }}
                  />
                  <YAxis
                    stroke="#475569"
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={{ stroke: '#1F2937' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0E14',
                      border: '1px solid rgba(0, 229, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                    }}
                    cursor={{ fill: 'rgba(0, 229, 255, 0.05)' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {moodChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-[#0B0E14] border border-white/5 rounded-2xl p-6"
            data-testid="recent-users"
          >
            <div className="mb-5">
              <h3 className="font-serif text-xl font-semibold text-white">Recent Sign-ups</h3>
              <p className="text-xs text-neutral-500 uppercase tracking-[0.15em] mt-1">Latest members</p>
            </div>
            <div className="space-y-3">
              {stats.recent_users.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    u.role === 'admin'
                      ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white'
                      : 'bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] text-black'
                  }`}>
                    {u.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{u.email}</div>
                    <div className="text-xs text-neutral-500">
                      {format(new Date(u.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  {u.role === 'admin' && (
                    <div className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] uppercase tracking-wider">
                      Admin
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* All Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-[#0B0E14] border border-white/5 rounded-2xl overflow-hidden"
          data-testid="all-users-table"
        >
          <div className="p-6 border-b border-white/5">
            <h3 className="font-serif text-xl font-semibold text-white">All Users</h3>
            <p className="text-xs text-neutral-500 uppercase tracking-[0.15em] mt-1">
              {users.length} registered members
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-[#030508]/30">
                  <th className="text-left py-3 px-6 text-[10px] uppercase tracking-[0.15em] text-neutral-500 font-medium">User</th>
                  <th className="text-left py-3 px-6 text-[10px] uppercase tracking-[0.15em] text-neutral-500 font-medium">Role</th>
                  <th className="text-left py-3 px-6 text-[10px] uppercase tracking-[0.15em] text-neutral-500 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 + i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                          u.role === 'admin'
                            ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white'
                            : 'bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] text-black'
                        }`}>
                          {u.email[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-white">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium ${
                        u.role === 'admin'
                          ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                          : 'bg-white/5 border border-white/10 text-neutral-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-neutral-400">
                        {format(new Date(u.created_at), 'MMM dd, yyyy • h:mm a')}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
