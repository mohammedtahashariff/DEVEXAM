import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileCode2,
  Users,
  Eye,
  Activity,
  Award,
  AlertTriangle,
  Clock,
  TrendingUp,
  Plus,
  RefreshCw,
  CheckCircle2,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { api } from '../../services/api.js';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenCreateAssessment: () => void;
  onSelectCandidateResult: (attemptId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenCreateAssessment,
  onSelectCandidateResult
}) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [recentCandidates, setRecentCandidates] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.stats);
        setCharts(res.charts);
        setRecentCandidates(res.recentCandidates || []);
      }
    } catch (e) {
      console.error('Failed to load dashboard metrics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#10b981'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Recruiter Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time assessment telemetry, candidate scoring distributions, and proctoring logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Refresh metrics"
            className="p-2.5 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenCreateAssessment}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assessment</span>
          </button>
        </div>
      </div>

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Assessments */}
        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Tests</span>
            <FileCode2 className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalAssessments ?? '—'}</p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {stats?.activeAssessments ?? 0} Active
          </p>
        </div>

        {/* Active Assessments */}
        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Active Tests</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.activeAssessments ?? '—'}</p>
          <p className="text-[11px] text-slate-400 mt-1">Accepting Candidates</p>
        </div>

        {/* Total Candidates */}
        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Candidates</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalCandidates ?? '—'}</p>
          <p className="text-[11px] text-brand-400 mt-1">Registered applicants</p>
        </div>

        {/* Completed Tests */}
        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.completedTests ?? '—'}</p>
          <p className="text-[11px] text-teal-400 mt-1">Submissions graded</p>
        </div>

        {/* Average Score */}
        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Avg Score</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300">{stats?.averageScore ?? '—'}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Cohort benchmark</p>
        </div>

        {/* Flagged Sessions */}
        <div className="p-4 rounded-2xl bg-dark-card border border-rose-500/30 bg-rose-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-300">Flagged</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400">{stats?.flaggedSessions ?? '0'}</p>
          <p className="text-[11px] text-rose-400 mt-1">Review required</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Assessment Participation & Score */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-400" />
                Assessment Participation & Average Scores
              </h3>
              <p className="text-xs text-slate-400">Candidate volume and cohort benchmark score by test</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {charts?.participationData?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.participationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="candidates" fill="#6366f1" radius={[6, 6, 0, 0]} name="Candidates" />
                  <Bar dataKey="avgScore" fill="#10b981" radius={[6, 6, 0, 0]} name="Avg Score (%)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No participation data available
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Score Distribution Breakdown */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-dark-card border border-dark-border">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Score Distribution
            </h3>
            <p className="text-xs text-slate-400">Candidate score brackets</p>
          </div>
          <div className="h-48 w-full">
            {charts?.scoreRanges ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.scoreRanges}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {charts.scoreRanges.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Loading charts...
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-dark-border text-[11px] text-slate-400">
            {charts?.scoreRanges?.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span>{item.range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions & Proctoring Table */}
      <div className="p-6 rounded-2xl bg-dark-card border border-dark-border">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              Recent Candidate Attempts
            </h3>
            <p className="text-xs text-slate-400">Latest active and completed assessments</p>
          </div>
          <button
            onClick={() => onNavigateTab('candidates')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>View All Candidates</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0f1624] text-slate-400 uppercase text-[10px] font-semibold border-b border-dark-border">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Candidate</th>
                <th className="px-4 py-3">Assessment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Violations</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40">
              {recentCandidates.map((candidate) => {
                const totalFlags = (candidate.tabSwitches || 0) + (candidate.fullscreenExits || 0);
                return (
                  <tr key={candidate.id} className="hover:bg-dark-hover/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-white">{candidate.name}</p>
                      <p className="text-[11px] text-slate-400">{candidate.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-200 font-medium">{candidate.assessmentTitle}</p>
                      <p className="text-[10px] font-mono text-brand-400">{candidate.assessmentCode}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          candidate.status === 'SUBMITTED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : candidate.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            : 'bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-sm">
                      {candidate.status === 'SUBMITTED' ? (
                        <span className={candidate.score >= 70 ? 'text-emerald-400' : 'text-rose-400'}>
                          {candidate.score}/100
                        </span>
                      ) : (
                        <span className="text-slate-500">In Progress</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {totalFlags > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 font-mono text-[11px] border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          {totalFlags} flags ({candidate.tabSwitches} tabs, {candidate.fullscreenExits} fs)
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">0 flags</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onSelectCandidateResult(candidate.id)}
                        className="px-3 py-1.5 rounded-lg bg-dark-surface hover:bg-dark-card border border-dark-border text-brand-300 hover:text-white font-medium transition-colors"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
