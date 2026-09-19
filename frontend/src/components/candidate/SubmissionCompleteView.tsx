import React, { useEffect } from 'react';
import {
  CheckCircle2,
  Award,
  Clock,
  Code2,
  ArrowRight,
  ShieldCheck,
  Check,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { stopAllMediaStreams } from '../../utils/mediaStream.js';

interface SubmissionCompleteViewProps {
  submissionData: any;
  onReturnHome: () => void;
  onGoToDashboard?: () => void;
}

export const SubmissionCompleteView: React.FC<SubmissionCompleteViewProps> = ({
  submissionData,
  onReturnHome,
  onGoToDashboard
}) => {
  useEffect(() => {
    // Explicitly shut down all camera and audio streams upon test completion
    stopAllMediaStreams();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  }, []);

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-lg bg-dark-card border border-dark-border rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-white">Assessment Submitted Successfully</h1>
          <p className="text-xs text-slate-400 mt-1">
            Your solutions and execution metrics have been securely submitted for evaluation.
          </p>
        </div>

        {/* Receipt Box */}
        <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-3 text-xs text-left">
          <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
            <span className="text-slate-400">Candidate:</span>
            <span className="font-semibold text-white">{submissionData?.candidateName || 'Candidate'}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
            <span className="text-slate-400">Assessment:</span>
            <span className="font-semibold text-white">{submissionData?.assessmentTitle || 'Technical Test'}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
            <span className="text-slate-400">Submission Time:</span>
            <span className="font-mono text-slate-300">
              {submissionData?.submittedAt ? new Date(submissionData.submittedAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
            </span>
          </div>

          {submissionData?.score !== undefined && (
            <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
              <span className="text-slate-400">Score Achieved:</span>
              <span className="font-bold text-brand-400 font-mono text-sm">
                {submissionData.score} pts
              </span>
            </div>
          )}

          {submissionData?.passedQuestions !== undefined && (
            <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
              <span className="text-slate-400">Problems Solved:</span>
              <span className="font-semibold text-white font-mono">
                {submissionData.passedQuestions} / {submissionData.totalQuestions || '—'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
              <Check className="w-3.5 h-3.5" /> Graded & Recorded
            </span>
          </div>
        </div>

        {/* Notice */}
        <div className="p-3 rounded-xl bg-[#090d16] border border-dark-border text-[11px] text-slate-400 leading-relaxed">
          <p>
            Your results have been updated to your student dashboard. You can review your scores, problem breakdowns, and history at any time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onGoToDashboard && (
            <button
              onClick={onGoToDashboard}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Go to Student Dashboard</span>
            </button>
          )}

          <button
            onClick={onReturnHome}
            className="py-3 px-4 rounded-xl bg-dark-surface hover:bg-dark-hover border border-dark-border text-slate-300 font-semibold text-xs transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
