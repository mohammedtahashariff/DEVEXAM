import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  UserCircle,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  KeyRound,
  ArrowRight,
  AlertCircle,
  BookOpen,
  Clock,
  ShieldCheck,
  Trophy,
  CheckCircle2,
  XCircle,
  Timer,
  Code2,
  Sparkles,
  Menu,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  X as XIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { DevlustroLogo } from '../common/DevlustroLogo.js';

interface StudentDashboardProps {
  onStartAssessment?: () => void;
}

type Tab = 'dashboard' | 'attend' | 'results' | 'profile';

/* ─── avatar initials helper ─── */
const initials = (name: string) =>
  (name || 'S')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/* ─── colour for avatar ─── */
const avatarGradient = 'from-brand-500 to-indigo-600';

export const StudentDashboard: React.FC<StudentDashboardProps> = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Live data from backend */
  const [stats, setStats] = useState({
    testsTaken: 0,
    testsPassed: 0,
    avgScore: '—',
    avgDuration: '—'
  });
  const [attempts, setAttempts] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  /* Selected attempt for details modal */
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null);

  /* attend-assessment form */
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications] = useState(1);

  /* profile dropdown */
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadResults = async () => {
    setDataLoading(true);
    try {
      const res = await api.getMyResults();
      if (res.success) {
        setStats(res.stats || {
          testsTaken: 0,
          testsPassed: 0,
          avgScore: '—',
          avgDuration: '—'
        });
        setAttempts(res.attempts || []);
      }
    } catch (e) {
      console.error('Failed to load candidate results:', e);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError('Please enter an assessment code.'); return; }
    setLoading(true);
    try {
      const data = await api.joinAssessment(trimmed);
      if (data.success && data.token) {
        localStorage.setItem('devexam_token', data.token);
        window.location.reload();
      } else {
        setError(data.message || 'Invalid assessment code.');
      }
    } catch {
      setError('Could not reach server — is the backend running?');
    }
    setLoading(false);
  };

  /* ─── nav items ─── */
  const nav: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard',          icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'attend',    label: 'Attend Assessment',  icon: <ClipboardList   className="w-4 h-4" /> },
    { id: 'results',   label: 'Results & History',   icon: <BarChart3       className="w-4 h-4" /> },
    { id: 'profile',   label: 'Profile',             icon: <UserCircle      className="w-4 h-4" /> },
  ];

  /* ─── sidebar ─── */
  const Sidebar = () => (
    <aside className={`
      fixed md:static inset-y-0 left-0 z-40
      w-60 shrink-0 flex flex-col
      bg-[#0d1121] border-r border-dark-border
      transform transition-transform duration-300
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-dark-border">
        <DevlustroLogo variant="full" size="sm" />
        <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map(item => (
          <button
            key={item.id}
            onClick={() => { setTab(item.id); setSidebarOpen(false); }}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all
              ${tab === item.id
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
          >
            {item.icon}
            {item.label}
            {item.id === 'attend' && (
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            {item.id === 'results' && attempts.length > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-bold">
                {attempts.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User mini-card at bottom */}
      <div className="p-3 border-t border-dark-border">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white/5">
          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
            {initials(user?.name || 'S')}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );

  /* ─── header ─── */
  const Header = () => (
    <header className="h-14 px-4 md:px-6 flex items-center justify-between border-b border-dark-border bg-[#0B0F19]/80 backdrop-blur-sm sticky top-0 z-30">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <p className="text-xs text-slate-500">Student Portal</p>
          <p className="text-sm font-semibold text-white capitalize">{tab === 'attend' ? 'Attend Assessment' : tab === 'results' ? 'Results & History' : tab}</p>
        </div>
      </div>

      {/* Right: Refresh + notifications + avatar dropdown */}
      <div className="flex items-center gap-2">
        <button
          onClick={loadResults}
          disabled={dataLoading}
          title="Refresh Dashboard Data"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin text-brand-400' : ''}`} />
        </button>

        {/* Notification bell */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <Bell className="w-4 h-4" />
          {notifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
          )}
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-[10px] font-bold text-white`}>
              {initials(user?.name || 'S')}
            </div>
            <span className="hidden sm:block text-xs font-semibold text-white">{user?.name?.split(' ')[0]}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden py-1 animate-fade-in z-50">
              <div className="px-4 py-3 border-b border-dark-border">
                <p className="text-xs font-semibold text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setTab('profile'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <UserCircle className="w-3.5 h-3.5" /> Profile
              </button>
              <button
                onClick={() => { setTab('results'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5" /> My Results
              </button>
              <div className="border-t border-dark-border my-1" />
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  /* ─── Dashboard tab ─── */
  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-brand-600/30 via-indigo-600/20 to-transparent border border-brand-500/20 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">Student Dashboard</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Hello, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-sm text-slate-400 max-w-sm">
              {stats.testsTaken > 0
                ? `You have completed ${stats.testsTaken} assessment${stats.testsTaken > 1 ? 's' : ''}. Great work!`
                : 'No active assessment right now. Enter a code when you\'re ready to begin.'}
            </p>
          </div>
          <div className={`hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarGradient} items-center justify-center text-xl font-bold text-white shrink-0`}>
            {initials(user?.name || 'S')}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            onClick={() => setTab('attend')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all shadow-lg shadow-brand-600/30"
          >
            <ClipboardList className="w-3.5 h-3.5" /> Attend Assessment
          </button>
          {attempts.length > 0 && (
            <button
              onClick={() => setTab('results')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-200 text-xs font-semibold transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5" /> View Past Results ({attempts.length})
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tests Taken',   value: String(stats.testsTaken), icon: <BookOpen className="w-5 h-5" />,      color: 'text-blue-400',    bg: 'bg-blue-500/10'   },
          { label: 'Tests Passed',  value: String(stats.testsPassed), icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Average Score', value: stats.avgScore,           icon: <Trophy className="w-5 h-5" />,        color: 'text-amber-400',   bg: 'bg-amber-500/10'  },
          { label: 'Avg. Duration', value: stats.avgDuration,        icon: <Timer className="w-5 h-5" />,         color: 'text-violet-400',  bg: 'bg-violet-500/10' },
        ].map(s => (
          <div key={s.label} className="bg-dark-card border border-dark-border rounded-2xl p-4 sm:p-5 flex flex-col gap-2 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">{s.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-white font-mono mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Assessment Activity */}
      {attempts.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-bold text-white">Recent Assessment Activity</h2>
            </div>
            <button
              onClick={() => setTab('results')}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-dark-border">
            {attempts.slice(0, 3).map(att => (
              <div key={att.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-white truncate">{att.assessmentTitle}</p>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-dark-surface border border-dark-border text-slate-400">
                      {att.assessmentCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {att.submittedAt ? new Date(att.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'In Progress'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-white">{att.score} pts</span>
                    <span className="text-[10px] text-slate-500 block">Pass: {att.passingScore}%</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    att.status === 'SUBMITTED'
                      ? att.isPassed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {att.status === 'SUBMITTED' ? (att.isPassed ? 'Passed' : 'Needs Review') : 'In Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Before you start</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: <BookOpen className="w-4 h-4 text-blue-400" />,    tip: 'Read each problem carefully before coding.' },
            { icon: <Clock className="w-4 h-4 text-amber-400" />,      tip: 'Timer starts the moment you begin the test.' },
            { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, tip: 'Camera & mic are required for proctoring.' },
          ].map(({ icon, tip }) => (
            <div key={tip} className="flex items-start gap-2.5 p-3 rounded-xl bg-dark-surface">
              <div className="mt-0.5 shrink-0">{icon}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ─── Attend Assessment tab ─── */
  const AttendTab = () => (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Attend Assessment</h2>
        <p className="text-sm text-slate-400">Enter the assessment code provided by your recruiter or institution to begin.</p>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-white">Enter Assessment Code</h3>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Assessment Code</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. DEVEXAM-7F82K"
              className="w-full px-4 py-3 rounded-xl bg-dark-surface border border-dark-border text-sm font-mono text-brand-300 uppercase tracking-widest font-bold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><ArrowRight className="w-4 h-4" /> Start Assessment</>}
          </button>
        </form>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Clock className="w-4 h-4 text-amber-400" />,       title: 'Timed',     desc: 'Timer begins on start' },
          { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, title: 'Proctored', desc: 'Camera required'       },
          { icon: <XCircle className="w-4 h-4 text-rose-400" />,      title: 'One Shot',  desc: 'Submit carefully'      },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-dark-card border border-dark-border rounded-xl p-3 flex flex-col items-center gap-1.5 text-center">
            {icon}
            <p className="text-xs font-semibold text-white">{title}</p>
            <p className="text-[11px] text-slate-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  /* ─── Results tab ─── */
  const ResultsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">My Results & Assessments</h2>
          <p className="text-sm text-slate-400">View all your completed assessment attempts, graded scores, and evaluations.</p>
        </div>
        <button
          onClick={loadResults}
          disabled={dataLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-xs text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3">
          <BarChart3 className="w-10 h-10 text-slate-700" />
          <p className="text-sm font-semibold text-slate-400">No results recorded yet</p>
          <p className="text-xs text-slate-500 max-w-xs">Once you complete an assessment, your scores, test case metrics, and reports will show up here automatically.</p>
          <button onClick={() => setTab('attend')} className="mt-2 px-4 py-2 rounded-xl bg-brand-600/20 border border-brand-500/30 text-brand-300 text-xs font-semibold hover:bg-brand-600/30 transition-colors">
            Attend your first assessment →
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {attempts.map(att => (
            <div
              key={att.id}
              className="bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-brand-500/40 transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-white truncate">{att.assessmentTitle}</h3>
                  <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                    {att.assessmentCode}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    att.status === 'SUBMITTED'
                      ? att.isPassed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {att.status === 'SUBMITTED' ? (att.isPassed ? '✓ Passed' : '✕ Needs Review') : 'In Progress'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                  {att.submittedAt && (
                    <span className="flex items-center gap-1 font-sans">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(att.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {att.totalQuestions > 0 && (
                    <span>
                      Problems Solved: <strong className="text-white">{att.passedQuestions || 0} / {att.totalQuestions}</strong>
                    </span>
                  )}
                  <span>
                    Passing Requirement: <strong className="text-slate-300">{att.passingScore}%</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-dark-border">
                <div className="text-left sm:text-right font-mono">
                  <span className="text-xl sm:text-2xl font-black text-brand-400">{att.score}</span>
                  <span className="text-xs text-slate-500 block">Total Score</span>
                </div>

                <button
                  onClick={() => setSelectedAttempt(att)}
                  className="px-3.5 py-2 rounded-xl bg-dark-surface hover:bg-dark-hover border border-dark-border text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <span>Details</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attempt Details Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-dark-card border border-dark-border rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border">
              <div>
                <h3 className="text-base font-bold text-white">{selectedAttempt.assessmentTitle}</h3>
                <p className="text-xs font-mono text-brand-400 mt-0.5">{selectedAttempt.assessmentCode}</p>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-dark-surface border border-dark-border space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Final Score:</span>
                <span className="font-bold text-white font-mono text-sm">{selectedAttempt.score} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Passing Score:</span>
                <span className="font-mono text-slate-300">{selectedAttempt.passingScore} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Problems Solved:</span>
                <span className="font-mono text-white">{selectedAttempt.passedQuestions} / {selectedAttempt.totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={`font-bold ${selectedAttempt.isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedAttempt.isPassed ? 'Passed' : 'Needs Review'}
                </span>
              </div>
              {selectedAttempt.submittedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Submitted:</span>
                  <span className="font-mono text-slate-300">{new Date(selectedAttempt.submittedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedAttempt(null)}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );

  /* ─── Profile tab ─── */
  const ProfileTab = () => (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Profile</h2>
        <p className="text-sm text-slate-400">Your account information.</p>
      </div>

      {/* Avatar card */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 flex items-center gap-5">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-2xl font-bold text-white shrink-0`}>
          {initials(user?.name || 'S')}
        </div>
        <div>
          <p className="text-lg font-bold text-white">{user?.name}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-[10px] font-semibold">Candidate Account</span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-dark-card border border-dark-border rounded-2xl divide-y divide-dark-border overflow-hidden">
        {[
          { label: 'Full Name',   value: user?.name  || '—' },
          { label: 'Email',       value: user?.email || '—' },
          { label: 'Role',        value: 'Candidate'        },
          { label: 'Assessments Taken', value: String(stats.testsTaken) },
          { label: 'Assessments Passed', value: String(stats.testsPassed) },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs text-slate-500">{row.label}</span>
            <span className="text-xs font-medium text-white">{row.value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={logout}
        className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-3.5 h-3.5" /> Sign Out
      </button>
    </div>
  );

  const tabContent: Record<Tab, React.ReactNode> = {
    dashboard: <DashboardTab />,
    attend:    <AttendTab />,
    results:   <ResultsTab />,
    profile:   <ProfileTab />,
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex">
      {/* Sidebar backdrop (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl">
            {tabContent[tab]}
          </div>
        </main>
      </div>
    </div>
  );
};

