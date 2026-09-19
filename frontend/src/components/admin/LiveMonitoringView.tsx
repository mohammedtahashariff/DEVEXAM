import React, { useState, useEffect } from 'react';
import {
  Eye,
  Camera,
  CameraOff,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Video,
  ShieldAlert,
  Activity,
  UserCheck
} from 'lucide-react';
import { LiveCandidate } from '../../types/index.js';
import { api } from '../../services/api.js';

export const LiveMonitoringView: React.FC<{
  onSelectCandidateResult: (attemptId: string) => void;
}> = ({ onSelectCandidateResult }) => {
  const [candidates, setCandidates] = useState<LiveCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadLiveData = async () => {
    try {
      const res = await api.getLiveCandidates();
      if (res.success) {
        setCandidates(res.candidates);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveData();
    if (!autoRefresh) return;
    const interval = setInterval(loadLiveData, 5000); // 5s live polling
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Live Proctoring Room</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time surveillance feeds, session timers, and instant violation flags for active test takers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-dark-card border border-dark-border px-3 py-2 rounded-xl">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-dark-surface border-dark-border text-brand-600 focus:ring-0"
            />
            <span>Auto-Refresh (5s)</span>
          </label>
          <button
            onClick={loadLiveData}
            className="p-2.5 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Candidate Cards */}
      {candidates.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-dark-card border border-dark-border">
          <UserCheck className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-base font-semibold text-white">No active candidate sessions currently</p>
          <p className="text-xs text-slate-400 mt-1">
            When candidates start a test, their live video and telemetry streams will appear here immediately.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((cand) => (
            <div
              key={cand.id}
              className={`rounded-2xl bg-dark-card border overflow-hidden flex flex-col justify-between shadow-xl transition-all ${
                cand.riskLevel === 'REVIEW_REQUIRED'
                  ? 'border-rose-500/50 shadow-rose-500/10'
                  : cand.riskLevel === 'WARNING'
                  ? 'border-amber-500/50 shadow-amber-500/10'
                  : 'border-dark-border hover:border-brand-500/30'
              }`}
            >
              {/* Card Video Header */}
              <div className="relative aspect-video bg-[#090d16] flex items-center justify-center border-b border-dark-border overflow-hidden">
                {cand.cameraStatus === 'CONNECTED' ? (
                  <div className="w-full h-full relative bg-gradient-to-tr from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold text-lg">
                      {cand.candidateName.charAt(0)}
                    </div>
                    {/* Simulated live video wave */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                      <span className="w-1.5 h-3 bg-emerald-400 animate-pulse rounded-full" />
                      <span className="w-1.5 h-5 bg-emerald-400 animate-pulse delay-75 rounded-full" />
                      <span className="w-1.5 h-2 bg-emerald-400 animate-pulse delay-150 rounded-full" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-rose-400 p-4 text-center">
                    <CameraOff className="w-8 h-8 mb-2 opacity-80" />
                    <span className="text-xs font-semibold">Camera Disconnected</span>
                  </div>
                )}

                {/* Risk Level Badge */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md ${
                      cand.riskLevel === 'REVIEW_REQUIRED'
                        ? 'bg-rose-600 text-white'
                        : cand.riskLevel === 'WARNING'
                        ? 'bg-amber-500 text-black'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {cand.riskLevel === 'REVIEW_REQUIRED'
                      ? '🔴 Review Required'
                      : cand.riskLevel === 'WARNING'
                      ? '🟡 Warning'
                      : '🟢 Active'}
                  </span>
                </div>

                {/* Timer Badge */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-amber-300 font-mono text-[11px] font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatSeconds(cand.remainingSeconds)}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{cand.candidateName}</h3>
                    <p className="text-[11px] text-slate-400">{cand.candidateEmail}</p>
                  </div>
                  <span className="text-xs font-mono text-brand-400 font-semibold">
                    {cand.questionsSolved} Solved
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs flex items-center justify-between">
                  <span className="text-slate-400">Test:</span>
                  <span className="font-semibold text-slate-200">{cand.assessmentTitle}</span>
                </div>

                {/* Violation Counters */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-dark-surface border border-dark-border">
                    <span className="text-[10px] text-slate-400 block">Tab Switches</span>
                    <span
                      className={`font-mono font-bold ${
                        cand.tabSwitches > 0 ? 'text-amber-400' : 'text-slate-300'
                      }`}
                    >
                      {cand.tabSwitches}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-dark-surface border border-dark-border">
                    <span className="text-[10px] text-slate-400 block">Fullscreen Exits</span>
                    <span
                      className={`font-mono font-bold ${
                        cand.fullscreenExits > 0 ? 'text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      {cand.fullscreenExits}
                    </span>
                  </div>
                </div>

                {/* Recent Event Feed */}
                {cand.recentEvents?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Latest Activity
                    </span>
                    <div className="text-[11px] text-slate-300 font-mono p-1.5 rounded bg-dark-surface border border-dark-border/60 flex items-center justify-between">
                      <span className="text-brand-300">{cand.recentEvents[0].eventType}</span>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(cand.recentEvents[0].timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-[#0e1422] border-t border-dark-border flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Total Events: <strong className="text-white">{cand.totalEvents}</strong>
                </span>
                <button
                  onClick={() => onSelectCandidateResult(cand.id)}
                  className="px-3 py-1 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 text-xs font-semibold transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
