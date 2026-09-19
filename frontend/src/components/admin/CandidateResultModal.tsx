import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Code,
  Shield,
  FileCode,
  Check,
  ChevronRight,
  Terminal,
  Activity
} from 'lucide-react';
import { api } from '../../services/api.js';

interface CandidateResultModalProps {
  attemptId: string | null;
  onClose: () => void;
}

export const CandidateResultModal: React.FC<CandidateResultModalProps> = ({
  attemptId,
  onClose
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestionTab, setActiveQuestionTab] = useState<number>(0);

  useEffect(() => {
    if (!attemptId) return;

    const loadResult = async () => {
      setLoading(true);
      try {
        const res = await api.getCandidateResult(attemptId);
        if (res.success) {
          setData(res.result);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [attemptId]);

  if (!attemptId) return null;

  const currentQ = data?.questions ? data.questions[activeQuestionTab] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between bg-[#101726]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{data?.candidateName || 'Candidate Result'}</span>
                <span className="text-xs text-slate-400 font-normal">({data?.candidateEmail})</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {data?.assessmentTitle} · <span className="font-mono text-brand-400">{data?.assessmentCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center text-slate-400 text-xs">
            <div className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading candidate evaluation report...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top Score & Integrity Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-dark-surface border border-dark-border">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Final Score</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-extrabold ${data?.isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {data?.finalScore}/100
                  </span>
                  <span className="text-xs text-slate-400">
                    ({data?.isPassed ? 'Passed' : 'Failed'})
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-dark-surface border border-dark-border">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Time Elapsed</span>
                <div className="flex items-center gap-1.5 text-xl font-bold text-white font-mono">
                  <Clock className="w-4 h-4 text-brand-400" />
                  <span>{data?.timeTakenMinutes ? `${data.timeTakenMinutes} mins` : '—'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-dark-surface border border-dark-border">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Questions Passed</span>
                <div className="text-xl font-bold text-white">
                  {data?.questions?.filter((q: any) => q.status === 'PASSED').length || 0} / {data?.questions?.length || 0}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-dark-surface border border-dark-border">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Integrity Flags</span>
                <div className="flex items-center gap-1.5 text-xl font-bold text-rose-400 font-mono">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{(data?.tabSwitches || 0) + (data?.fullscreenExits || 0)}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({data?.tabSwitches} tabs, {data?.fullscreenExits} fs)
                  </span>
                </div>
              </div>
            </div>

            {/* Questions Breakdown Section */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Question Breakdown & Code Inspection
              </h3>

              {/* Question Selection Tabs */}
              <div className="flex flex-wrap gap-2">
                {data?.questions?.map((q: any, idx: number) => (
                  <button
                    key={q.questionId}
                    onClick={() => setActiveQuestionTab(idx)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      activeQuestionTab === idx
                        ? 'bg-brand-600/20 border-brand-500 text-white'
                        : 'bg-dark-surface border-dark-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {q.status === 'PASSED' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span>Q{idx + 1}: {q.title}</span>
                    <span className="font-mono text-[10px] text-slate-400">({q.scoreEarned} pts)</span>
                  </button>
                ))}
              </div>

              {/* Active Question Details & Code Diff */}
              {currentQ && (
                <div className="rounded-xl bg-[#090d16] border border-dark-border overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#101726] border-b border-dark-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white">{currentQ.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#1f293d] text-brand-300 font-mono uppercase font-bold">
                        {currentQ.candidateLanguage}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span>Test cases: <strong className="text-emerald-400">{currentQ.testCasesPassed}/{currentQ.testCasesTotal}</strong></span>
                      <span>Runtime: <strong className="text-slate-200">{currentQ.executionTime}</strong></span>
                      <span>Memory: <strong className="text-slate-200">{currentQ.memoryUsage}</strong></span>
                    </div>
                  </div>

                  {/* Code Block */}
                  <div className="p-4">
                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 font-mono">
                      Candidate Submitted Code:
                    </div>
                    <pre className="p-3.5 rounded-lg bg-dark-card border border-dark-border font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-60">
                      <code>{currentQ.candidateCode || '// No code was submitted for this question.'}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Proctoring Activity Stream for this attempt */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-brand-400" />
                Session Proctoring Activity Stream ({data?.proctoringEvents?.length || 0})
              </h3>

              <div className="rounded-xl bg-dark-surface border border-dark-border p-3 divide-y divide-dark-border/40 max-h-48 overflow-y-auto">
                {data?.proctoringEvents?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No proctoring violations recorded for this candidate.</p>
                ) : (
                  data?.proctoringEvents?.map((ev: any) => (
                    <div key={ev.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            ev.severity === 'DANGER' || ev.severity === 'CRITICAL'
                              ? 'bg-rose-500'
                              : ev.severity === 'WARNING'
                              ? 'bg-amber-500'
                              : 'bg-brand-500'
                          }`}
                        />
                        <span className="font-semibold text-slate-200 font-mono text-[11px]">{ev.eventType}</span>
                        <span className="text-[11px] text-slate-400 truncate max-w-xs">{JSON.stringify(ev.details)}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
