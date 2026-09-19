import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Maximize2, ShieldAlert, X, AlertOctagon, Send } from 'lucide-react';
import { api } from '../../services/api.js';

interface ProctoringWatchdogProps {
  currentQuestionId?: string;
  onViolation?: (type: string) => void;
  onAutoSubmit?: () => void;
}

const MAX_TAB_SWITCHES = 5;

export const ProctoringWatchdog: React.FC<ProctoringWatchdogProps> = ({
  currentQuestionId,
  onViolation,
  onAutoSubmit
}) => {
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [fullscreenExited, setFullscreenExited] = useState<boolean>(false);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [isTerminating, setIsTerminating] = useState<boolean>(false);

  const hasAutoSubmittedRef = useRef<boolean>(false);
  const tabCountRef = useRef<number>(0);

  useEffect(() => {
    // 1. Tab switch / visibility change listener
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        if (hasAutoSubmittedRef.current) return;

        const newCount = tabCountRef.current + 1;
        tabCountRef.current = newCount;
        setTabSwitchCount(newCount);

        const remaining = MAX_TAB_SWITCHES - newCount;

        try {
          await api.logProctoringEvent(
            'TAB_SWITCH',
            newCount >= MAX_TAB_SWITCHES ? 'CRITICAL' : 'WARNING',
            currentQuestionId,
            { switchCount: newCount, maxAllowed: MAX_TAB_SWITCHES, timestamp: new Date().toISOString() }
          );
        } catch (e) {
          console.error('Failed to log tab switch', e);
        }

        if (newCount >= MAX_TAB_SWITCHES) {
          hasAutoSubmittedRef.current = true;
          setIsTerminating(true);
          setWarningMessage(`Maximum tab switch limit reached (${MAX_TAB_SWITCHES}/${MAX_TAB_SWITCHES}). Your assessment is now being automatically submitted.`);
          setShowWarningModal(true);

          onViolation && onViolation('TAB_SWITCH_LIMIT_EXCEEDED');

          // Auto-submit after 2 seconds to let the candidate see the final termination modal
          setTimeout(() => {
            onAutoSubmit && onAutoSubmit();
          }, 2000);
        } else {
          setWarningMessage(
            `Tab switch detected (${newCount}/${MAX_TAB_SWITCHES}). You have ${remaining} warning${remaining > 1 ? 's' : ''} remaining before the assessment is automatically submitted.`
          );
          setShowWarningModal(true);
          onViolation && onViolation('TAB_SWITCH');
        }
      }
    };

    // 2. Fullscreen change listener
    const handleFullscreenChange = async () => {
      if (!document.fullscreenElement) {
        if (hasAutoSubmittedRef.current) return;
        setFullscreenExited(true);
        setWarningMessage('Fullscreen mode was exited. Please return to fullscreen mode immediately to continue.');
        setShowWarningModal(true);

        try {
          await api.logProctoringEvent(
            'FULLSCREEN_EXIT',
            'WARNING',
            currentQuestionId,
            { reason: 'User exited fullscreen', timestamp: new Date().toISOString() }
          );
        } catch (e) {
          console.error('Failed to log fullscreen exit', e);
        }

        onViolation && onViolation('FULLSCREEN_EXIT');
      } else {
        setFullscreenExited(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [currentQuestionId, onAutoSubmit, onViolation]);

  const handleReturnFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setFullscreenExited(false);
      setShowWarningModal(false);
    } catch (e) {
      setShowWarningModal(false);
    }
  };

  if (!showWarningModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className={`relative w-full max-w-md bg-dark-card border-2 rounded-2xl p-6 shadow-2xl text-center space-y-4 ${
        isTerminating ? 'border-rose-500 shadow-rose-500/40' : 'border-amber-500/60 shadow-amber-500/20'
      }`}>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto border ${
          isTerminating ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
        }`}>
          {isTerminating ? (
            <AlertOctagon className="w-8 h-8 animate-pulse" />
          ) : (
            <AlertTriangle className="w-7 h-7 animate-pulse" />
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">
            {isTerminating ? 'Assessment Auto-Submitting' : 'Proctoring Violation Warning'}
          </h3>
          <p className={`text-xs mt-1.5 font-medium leading-relaxed ${isTerminating ? 'text-rose-300' : 'text-amber-200'}`}>
            {warningMessage}
          </p>
        </div>

        {/* Tab switch progress indicators */}
        <div className="p-3.5 rounded-xl bg-dark-surface border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Tab Switch Violations:</span>
            <span className={`font-mono font-bold ${tabSwitchCount >= MAX_TAB_SWITCHES ? 'text-rose-400' : 'text-amber-400'}`}>
              {tabSwitchCount} / {MAX_TAB_SWITCHES}
            </span>
          </div>

          {/* 5-slot visual progress bar */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {[1, 2, 3, 4, 5].map((slot) => (
              <div
                key={slot}
                className={`h-2 rounded-full transition-all ${
                  slot <= tabSwitchCount
                    ? slot >= 5
                      ? 'bg-rose-500 animate-pulse'
                      : 'bg-amber-500'
                    : 'bg-slate-700/60'
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-slate-500 text-left pt-0.5">
            Rule: Reaching 5 tab switches results in immediate automatic test submission.
          </p>
        </div>

        {isTerminating ? (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
            <span>Submitting test solutions to server...</span>
          </div>
        ) : (
          <div className="flex gap-2 pt-1">
            {fullscreenExited ? (
              <button
                onClick={handleReturnFullscreen}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Return to Fullscreen & Resume</span>
              </button>
            ) : (
              <button
                onClick={() => setShowWarningModal(false)}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                I Understand ({MAX_TAB_SWITCHES - tabSwitchCount} switches left)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

