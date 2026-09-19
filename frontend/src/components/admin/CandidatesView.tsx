import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Eye,
  RefreshCw
} from 'lucide-react';
import { CandidateTableItem } from '../../types/index.js';
import { api } from '../../services/api.js';

interface CandidatesViewProps {
  onSelectCandidateResult: (attemptId: string) => void;
  selectedAssessmentId?: string;
}

export const CandidatesView: React.FC<CandidatesViewProps> = ({
  onSelectCandidateResult,
  selectedAssessmentId
}) => {
  const [candidates, setCandidates] = useState<CandidateTableItem[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assessmentFilter, setAssessmentFilter] = useState(selectedAssessmentId || 'all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [candRes, assessRes] = await Promise.all([
        api.getAllCandidates({
          search,
          status: statusFilter,
          assessmentId: assessmentFilter
        }),
        api.getAssessments()
      ]);

      if (candRes.success) setCandidates(candRes.candidates);
      if (assessRes.success) setAssessments(assessRes.assessments);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter, assessmentFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Candidates & Registered Students</h2>
          <p className="text-xs text-slate-400 mt-1">
            All registered students and test attempts. Registered-only students have not yet joined a test.
          </p>
        </div>
        <button
          onClick={loadData}
          title="Refresh candidates"
          className="p-2.5 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-2xl bg-dark-card border border-dark-border">
        {/* Search */}
        <div className="sm:col-span-5 flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-surface border border-dark-border">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name or email..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Assessment Dropdown */}
        <div className="sm:col-span-4">
          <select
            value={assessmentFilter}
            onChange={(e) => setAssessmentFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Assessments</option>
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.code})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="EXPIRED">Expired</option>
            <option value="REGISTERED">Registered (No Test)</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="rounded-2xl bg-dark-card border border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0f1624] text-slate-400 uppercase text-[10px] font-semibold border-b border-dark-border">
              <tr>
                <th className="px-4 py-3.5">Candidate</th>
                <th className="px-4 py-3.5">Assessment</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Final Score</th>
                <th className="px-4 py-3.5">Time Taken</th>
                <th className="px-4 py-3.5">Integrity Flags</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Loading candidates...
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No candidates found matching filter criteria.
                  </td>
                </tr>
              ) : (
                candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-dark-hover/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-white">{cand.name}</p>
                      <p className="text-[11px] text-slate-400">{cand.email}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="text-slate-200 font-medium">
                        {cand.assessmentTitle ?? <span className="text-slate-500 italic">No test joined yet</span>}
                      </p>
                      <p className="text-[10px] font-mono text-brand-400">{cand.assessmentCode ?? ''}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          cand.status === 'SUBMITTED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : cand.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            : cand.status === 'REGISTERED'
                            ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {cand.status === 'REGISTERED' ? '✦ Registered' : cand.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {cand.status === 'SUBMITTED' ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold text-sm ${
                              cand.isPassed ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {cand.score}/100
                          </span>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                              cand.isPassed
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {cand.isPassed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-400">
                      {cand.durationTakenMinutes !== null ? (
                        <span className="font-mono text-[11px]">{cand.durationTakenMinutes} mins</span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {cand.activityFlags > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 font-mono text-[11px] border border-rose-500/25">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>{cand.activityFlags} flags</span>
                          <span className="text-[10px] text-slate-400">
                            ({cand.tabSwitches} tabs, {cand.fullscreenExits} fs)
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Clean (0 flags)</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {(cand as any).hasAttempt !== false ? (
                        <button
                          onClick={() => onSelectCandidateResult(cand.id)}
                          className="px-3 py-1.5 rounded-lg bg-dark-surface hover:bg-dark-card border border-dark-border text-brand-300 hover:text-white font-medium transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Report</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-600 italic">Awaiting test</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
