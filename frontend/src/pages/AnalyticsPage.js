import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  BookOpen, ChevronLeft, LogOut, ChevronDown, Flame, Calendar,
  BarChart3, TrendingUp, Hash, Award, Sparkles, Activity, Brain, Loader2, RefreshCw,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, Area, AreaChart,
} from 'recharts';
import { MOODS, getMoodConfig } from '@/components/MoodPicker';
import { Toaster, toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatCard = ({ title, value, icon: Icon, color, subtitle, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -4 }}
    className="relative group"
    data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <div
      className="absolute -inset-0.5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
      style={{ background: `linear-gradient(to right, transparent, ${color}30, transparent)` }}
    />
    <div className="relative bg-[#0B0E14] border border-white/5 group-hover:border-white/10 rounded-2xl p-6 transition-all overflow-hidden">
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 blur-2xl"
        style={{ backgroundColor: color }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}15`, borderColor: `${color}30`, borderWidth: '1px' }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
        <div className="font-serif text-4xl font-semibold text-white mb-1">{value}</div>
        <div className="text-xs uppercase tracking-[0.15em] text-neutral-500">{title}</div>
        {subtitle && (
          <div className="text-xs text-neutral-600 mt-1">{subtitle}</div>
        )}
      </div>
    </div>
  </motion.div>
);

export const AnalyticsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAIInsight = async () => {
    setAiLoading(true);
    try {
      const response = await axios.post(`${API}/insights/ai`);
      setAiInsight(response.data);
      toast.success('AI insight generated!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate insight');
    } finally {
      setAiLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/analytics/me`);
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (loading || !analytics) {
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

  // Prepare mood timeline for line chart
  const timelineData = analytics.mood_timeline.map(item => ({
    date: format(parseISO(item.date), 'MMM d'),
    fullDate: item.date,
    score: item.score,
    entries: item.entries,
  }));

  // Prepare mood distribution for pie chart
  const pieData = MOODS
    .map(m => ({
      name: m.label,
      value: analytics.mood_distribution[m.key] || 0,
      color: m.color,
      emoji: m.emoji,
    }))
    .filter(item => item.value > 0);

  // Custom tooltip for line chart
  const LineTooltip = ({ active, payload }) => {
    if (active && payload && payload.length && payload[0].value !== null) {
      const data = payload[0].payload;
      const moodLabels = ['', 'Sad', 'Anxious', 'Neutral', 'Calm', 'Happy'];
      const score = data.score;
      const label = score ? moodLabels[Math.round(score)] : 'No entry';
      return (
        <div className="bg-[#0B0E14] border border-[#00E5FF]/20 rounded-xl p-3 shadow-xl">
          <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{data.date}</div>
          <div className="text-sm text-white font-medium">Mood: {label}</div>
          <div className="text-xs text-neutral-400 mt-0.5">{data.entries} {data.entries === 1 ? 'entry' : 'entries'}</div>
        </div>
      );
    }
    return null;
  };

  // Streak flame color based on streak length
  const getStreakColor = (streak) => {
    if (streak >= 30) return '#EF4444'; // Red
    if (streak >= 14) return '#F97316'; // Orange
    if (streak >= 7) return '#FBBF24';  // Yellow
    if (streak >= 3) return '#00E5FF';  // Cyan
    return '#94A3B8'; // Gray
  };

  return (
    <div className="min-h-screen bg-[#030508] relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(0,229,255,0.08),_transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(249,115,22,0.05),_transparent_70%)]" />
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
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#0EA5E9] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                  <BarChart3 className="w-5 h-5 text-black" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="font-serif text-xl font-semibold text-white leading-none">Insights</h1>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-0.5">Your Journey</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] flex items-center justify-center text-black text-xs font-semibold">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#00E5FF]">Your Personal Insights</span>
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl font-semibold tracking-tight gradient-text mb-2">
            Your Journey
          </h1>
          <p className="text-neutral-400 text-base sm:text-lg">
            A visual story of your thoughts, emotions, and growth
          </p>
          <div className="mt-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>

        {/* Streak Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mb-6"
          data-testid="streak-card"
        >
          <div className="absolute -inset-1 rounded-2xl blur-2xl opacity-40"
            style={{ background: `linear-gradient(to right, ${getStreakColor(analytics.current_streak)}, transparent)` }} />
          <div className="relative bg-gradient-to-br from-[#0B0E14] to-[#131822] border border-white/10 rounded-2xl p-8 overflow-hidden">
            {/* Background flame */}
            <div className="absolute -bottom-16 -right-16 opacity-10">
              <Flame className="w-64 h-64" style={{ color: getStreakColor(analytics.current_streak) }} />
            </div>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs uppercase tracking-[0.15em] text-neutral-500">Current Streak</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.3 }}
                  >
                    <Flame
                      className="w-16 h-16"
                      style={{ color: getStreakColor(analytics.current_streak) }}
                      strokeWidth={2}
                    />
                  </motion.div>
                  <div>
                    <div className="font-serif text-7xl font-semibold text-white leading-none">
                      {analytics.current_streak}
                    </div>
                    <div className="text-sm text-neutral-500 mt-1">
                      {analytics.current_streak === 1 ? 'day' : 'days'} of consistency
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:min-w-[280px]">
                <div className="text-center px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="font-serif text-3xl font-semibold text-white">{analytics.longest_streak}</div>
                  <div className="text-xs uppercase tracking-wider text-neutral-500 mt-1">Best Streak</div>
                </div>
                <div className="text-center px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="font-serif text-3xl font-semibold text-white">{analytics.days_written}</div>
                  <div className="text-xs uppercase tracking-wider text-neutral-500 mt-1">Days Written</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Entries"
            value={analytics.total_entries}
            icon={BookOpen}
            color="#00E5FF"
            delay={0.2}
            subtitle="Words matter"
          />
          <StatCard
            title="This Month"
            value={analytics.entries_this_month}
            icon={Calendar}
            color="#818CF8"
            delay={0.3}
            subtitle="Keep going!"
          />
          <StatCard
            title="Best Streak"
            value={`${analytics.longest_streak} ${analytics.longest_streak === 1 ? 'day' : 'days'}`}
            icon={Award}
            color="#FBBF24"
            delay={0.4}
            subtitle="Personal record"
          />
        </div>

        {/* AI Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="relative mb-8"
          data-testid="ai-insights-card"
        >
          <div className="absolute -inset-1 rounded-2xl blur-2xl opacity-30 bg-gradient-to-r from-purple-500 via-[#00E5FF] to-purple-500" />
          <div className="relative bg-gradient-to-br from-[#0B0E14] to-[#131822] border border-white/10 rounded-2xl p-6 overflow-hidden">
            {/* Background icon */}
            <div className="absolute -top-8 -right-8 opacity-5">
              <Brain className="w-48 h-48 text-[#00E5FF]" />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-[#00E5FF]/20 border border-[#00E5FF]/30 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-[#00E5FF]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-white">AI Reflection</h3>
                    <p className="text-xs text-neutral-500 uppercase tracking-[0.15em] mt-0.5">Powered by Claude</p>
                  </div>
                </div>
                {aiInsight && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchAIInsight}
                    disabled={aiLoading}
                    data-testid="regenerate-ai-button"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/30 hover:text-[#00E5FF] transition-all text-xs font-medium"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                    Regenerate
                  </motion.button>
                )}
              </div>

              {aiInsight ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <p className="font-serif text-base sm:text-lg text-neutral-200 leading-relaxed whitespace-pre-wrap italic">
                    "{aiInsight.insight}"
                  </p>
                  <div className="flex items-center gap-4 pt-2 text-xs text-neutral-500 uppercase tracking-[0.15em]">
                    <span>Analyzed {aiInsight.entries_analyzed} entries</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-700" />
                    <span>Dominant mood: {aiInsight.dominant_mood}</span>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-neutral-400 mb-5 max-w-lg mx-auto leading-relaxed">
                    Let Claude AI reflect on your recent journal entries and offer warm, thoughtful insights about your emotional patterns.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchAIInsight}
                    disabled={aiLoading}
                    data-testid="generate-ai-insight-button"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-[#00E5FF] text-black font-semibold text-sm transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)] disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Reflecting...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        Get AI Reflection
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Mood Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-3 bg-[#0B0E14] border border-white/5 rounded-2xl p-6"
            data-testid="mood-timeline-chart"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-white">Mood Journey</h3>
                <p className="text-xs text-neutral-500 uppercase tracking-[0.15em] mt-1">Last 30 days</p>
              </div>
              <TrendingUp className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    axisLine={{ stroke: '#1F2937' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    stroke="#475569"
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    axisLine={{ stroke: '#1F2937' }}
                    tickFormatter={(v) => {
                      const labels = ['', '😢', '😰', '😐', '😌', '😊'];
                      return labels[v] || '';
                    }}
                    width={35}
                  />
                  <Tooltip content={<LineTooltip />} cursor={{ stroke: '#00E5FF', strokeOpacity: 0.3 }} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#00E5FF"
                    strokeWidth={2}
                    fill="url(#colorMood)"
                    dot={{ fill: '#00E5FF', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#00E5FF', stroke: '#0B0E14', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Mood Distribution Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-[#0B0E14] border border-white/5 rounded-2xl p-6"
            data-testid="mood-distribution-chart"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-white">Mood Palette</h3>
                <p className="text-xs text-neutral-500 uppercase tracking-[0.15em] mt-1">Distribution</p>
              </div>
              <Activity className="w-5 h-5 text-[#818CF8]" />
            </div>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="w-40 h-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={35}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B0E14" strokeWidth={2} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {pieData.map((item) => {
                    const total = pieData.reduce((sum, d) => sum + d.value, 0);
                    const percent = ((item.value / total) * 100).toFixed(0);
                    return (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{item.emoji}</span>
                          <span className="text-neutral-400">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{item.value}</span>
                          <span className="text-xs text-neutral-600">({percent}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-neutral-500 text-sm">
                No mood data yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Top Tags */}
        {analytics.top_tags && analytics.top_tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-[#0B0E14] border border-white/5 rounded-2xl p-6"
            data-testid="top-tags"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-white">Popular Themes</h3>
                <p className="text-xs text-neutral-500 uppercase tracking-[0.15em] mt-1">Most used tags</p>
              </div>
              <Hash className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div className="flex flex-wrap gap-3">
              {analytics.top_tags.map((item, i) => {
                const maxCount = analytics.top_tags[0].count;
                const size = 0.6 + (item.count / maxCount) * 0.6; // 0.6 to 1.2
                return (
                  <motion.div
                    key={item.tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                    whileHover={{ scale: size * 1.1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00E5FF]/5 border border-[#00E5FF]/20 hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/40 transition-all"
                    style={{ fontSize: `${size}rem` }}
                  >
                    <Hash className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span className="text-white font-medium">{item.tag}</span>
                    <span className="text-xs text-neutral-500">×{item.count}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {analytics.total_entries === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 mb-6">
              <BarChart3 className="w-9 h-9 text-[#00E5FF]" />
            </div>
            <h3 className="font-serif text-3xl font-semibold text-white mb-3">Your story begins</h3>
            <p className="text-neutral-400 mb-6">Write your first entry to see beautiful insights here.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00E5FF] hover:bg-[#33EEFF] text-black font-semibold text-sm transition-all shadow-[0_0_30px_rgba(0,229,255,0.4)]"
            >
              Go to Dashboard
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
};
