import React, { useState, useEffect, useRef } from 'react';
import { stopAllMediaStreams } from '../../utils/mediaStream.js';
import {
  Clock,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Send,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Flame,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { MonacoEditorPanel } from './MonacoEditorPanel.js';
import { TestCasePanel } from './TestCasePanel.js';
import { CameraFeed } from '../common/CameraFeed.js';
import { ProctoringWatchdog } from './ProctoringWatchdog.js';
import { CodeExecutionResponse, Question } from '../../types/index.js';
import { api } from '../../services/api.js';
import { DevlustroLogo } from '../common/DevlustroLogo.js';

interface AssessmentEnvironmentProps {
  assessment: any;
  attempt: any;
  onSubmitSuccess: (data: any) => void;
}

export const AssessmentEnvironment: React.FC<AssessmentEnvironmentProps> = ({
  assessment,
  attempt,
  onSubmitSuccess
}) => {
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [userCodes, setUserCodes] = useState<Record<string, { code: string; language: string }>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  
  // Execution & Diagnostics
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResponse | null>(null);
  const [customInput, setCustomInput] = useState<string>('');
  
  // Timer & Server Sync
  const [remainingSeconds, setRemainingSeconds] = useState<number>(attempt?.remainingSeconds || 3600);
  const [saveStatus, setSaveStatus] = useState<'SAVED' | 'SAVING' | 'ERROR'>('SAVED');
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const questions: Question[] = assessment?.questions || [];
  const currentQuestion = questions[currentQIndex];

  // Initialize starter codes from attempt answers or default starters
  useEffect(() => {
    const initialCodes: Record<string, { code: string; language: string }> = {};
    const defaultLang = assessment?.allowedLanguages?.[0] || 'python';
    setSelectedLanguage(defaultLang);

    questions.forEach((q) => {
      const existingAnswer = attempt?.answers?.find((a: any) => a.questionId === q.id);
      const starterCodes = q.starterCodes || {};
      const lang = existingAnswer?.language || defaultLang;
      const starter = starterCodes[lang as keyof typeof starterCodes] || '';

      initialCodes[q.id] = {
        code: existingAnswer?.code || starter,
        language: lang
      };
    });

    setUserCodes(initialCodes);
  }, [assessment, attempt]);

  // Synchronized Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(); // Auto-submit when time reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Periodic Autosave (every 8 seconds)
  useEffect(() => {
    if (!currentQuestion) return;

    const currentData = userCodes[currentQuestion.id];
    if (!currentData) return;

    const autosaveTimer = setTimeout(async () => {
      setSaveStatus('SAVING');
      try {
        await api.autosaveCode(
          currentQuestion.id,
          currentData.code,
          currentData.language,
          currentQIndex
        );
        setSaveStatus('SAVED');
      } catch {
        setSaveStatus('ERROR');
      }
    }, 4000);

    return () => clearTimeout(autosaveTimer);
  }, [userCodes, currentQIndex, currentQuestion]);

  const handleCodeChange = (newCode: string) => {
    if (!currentQuestion) return;
    setUserCodes((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        code: newCode
      }
    }));
  };

  const handleLanguageChange = (newLang: string) => {
    if (!currentQuestion) return;
    const starterCodes = currentQuestion.starterCodes || {};
    const starter = starterCodes[newLang as keyof typeof starterCodes] || '';

    setUserCodes((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        code: starter,
        language: newLang
      }
    }));
    setSelectedLanguage(newLang);
  };

  const handleResetCode = () => {
    if (!currentQuestion) return;
    const starterCodes = currentQuestion.starterCodes || {};
    const starter = starterCodes[selectedLanguage as keyof typeof starterCodes] || '';
    handleCodeChange(starter);
  };

  const handleRunCode = async (useCustom: boolean = false) => {
    if (!currentQuestion) return;
    const currentData = userCodes[currentQuestion.id];
    if (!currentData) return;

    setIsRunningCode(true);
    setExecutionResult(null);

    try {
      const res = await api.runCode({
        language: currentData.language,
        code: currentData.code,
        questionId: currentQuestion.id,
        customInput: useCustom ? customInput : undefined,
        testCases: useCustom ? undefined : currentQuestion.sampleTestCases
      });

      setExecutionResult(res);
    } catch (e: any) {
      console.error('Run code error:', e);
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!currentQuestion) return;
    const currentData = userCodes[currentQuestion.id];
    if (!currentData) return;

    setSaveStatus('SAVING');
    try {
      await api.autosaveCode(
        currentQuestion.id,
        currentData.code,
        currentData.language,
        currentQIndex
      );
      setSaveStatus('SAVED');
    } catch {
      setSaveStatus('ERROR');
    }

    // Also run test cases to give instant feedback
    await handleRunCode(false);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Send all current code states across all questions
      const res = await api.submitAssessment(userCodes);
      // Stop camera & microphone immediately after submission
      stopAllMediaStreams();
      if (res.success && res.attempt) {
        onSubmitSuccess(res.attempt);
      } else {
        onSubmitSuccess({
          candidateName: attempt?.candidateName,
          assessmentTitle: assessment?.title,
          submittedAt: new Date(),
          score: res.attempt?.score,
          passedQuestions: res.attempt?.passedQuestions,
          totalQuestions: questions.length
        });
      }
    } catch (e) {
      stopAllMediaStreams();
      onSubmitSuccess({
        candidateName: attempt?.candidateName,
        assessmentTitle: assessment?.title,
        submittedAt: new Date(),
        totalQuestions: questions.length
      });
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // Format Timer e.g. 00:47:32
  const formatTimer = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isWarning10m = remainingSeconds <= 600 && remainingSeconds > 300;
  const isWarning5m = remainingSeconds <= 300;

  const currentCode = currentQuestion && userCodes[currentQuestion.id]
    ? userCodes[currentQuestion.id].code
    : '';

  return (
    <div className="flex flex-col h-screen bg-[#0B0F19] text-slate-100 overflow-hidden select-none">
      {/* Active Proctoring Watchdog */}
      <ProctoringWatchdog
        currentQuestionId={currentQuestion?.id}
        onAutoSubmit={handleFinalSubmit}
      />

      {/* Top Navigation Bar */}
      <header className="h-14 px-4 bg-[#101726] border-b border-dark-border flex items-center justify-between z-30 shrink-0">
        {/* Left: Logo & Test Title */}
        <div className="flex items-center gap-3">
          <DevlustroLogo variant="icon" size="sm" />
          <div className="hidden sm:block h-5 w-px bg-dark-border" />
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>{assessment?.title || 'Assessment'}</span>
              <span className="text-[10px] font-mono text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20 hidden sm:inline">
                {assessment?.code}
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Synchronized Timer */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm transition-all shadow ${
              isWarning5m
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                : isWarning10m
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-dark-card border-dark-border text-slate-200'
            }`}
          >
            <Clock className={`w-4 h-4 ${isWarning5m ? 'text-rose-400' : 'text-amber-400'}`} />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>

          {isWarning5m && (
            <span className="hidden md:inline-flex text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
              ⚠️ 5 mins remaining
            </span>
          )}
        </div>

        {/* Right: Camera Preview & Submit */}
        <div className="flex items-center gap-3">
          {/* Small Webcam Widget */}
          <div className="w-16 h-10 rounded-lg overflow-hidden border border-dark-border hidden sm:block relative">
            <CameraFeed compact={true} showStatusBadge={false} className="w-full h-full" />
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (3-Column Layout) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Panel: Question Selector Drawer (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0d131f] border-r border-dark-border flex flex-col p-3 overflow-y-auto space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 px-1">
            Questions ({questions.length})
          </span>

          {questions.map((q, idx) => {
            const hasCode = userCodes[q.id]?.code && userCodes[q.id].code.trim().length > 20;
            const isSelected = currentQIndex === idx;

            return (
              <button
                key={q.id || idx}
                onClick={() => {
                  setCurrentQIndex(idx);
                  setExecutionResult(null);
                  setSelectedLanguage(userCodes[q.id]?.language || 'python');
                }}
                className={`w-full p-2.5 rounded-xl text-left transition-all border flex items-start justify-between ${
                  isSelected
                    ? 'bg-brand-600/20 border-brand-500 text-white shadow'
                    : 'bg-dark-card border-dark-border text-slate-400 hover:text-slate-200 hover:bg-dark-hover'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold font-mono">Q{idx + 1}</span>
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                        q.difficulty === 'EASY'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : q.difficulty === 'HARD'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium truncate max-w-[120px] mt-1">
                    {q.title}
                  </p>
                </div>

                <div className="mt-1">
                  {hasCode ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 block" title="Code modified" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600 block" title="Not started" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Center Panel: Problem Spec & Examples (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0E1422] border-r border-dark-border p-5 overflow-y-auto space-y-4">
          {currentQuestion ? (
            <>
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b border-dark-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-400 font-mono">Problem {currentQIndex + 1}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      currentQuestion.difficulty === 'EASY'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : currentQuestion.difficulty === 'HARD'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400 font-semibold">{currentQuestion.points} Points</span>
              </div>

              <h2 className="text-lg font-bold text-white">{currentQuestion.title}</h2>

              {/* Problem Description */}
              <div className="text-xs text-slate-300 leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                {currentQuestion.description}
              </div>

              {/* Input / Output Format */}
              {currentQuestion.inputFormat && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Input Format</span>
                  <p className="text-xs text-slate-300 p-2.5 rounded-lg bg-dark-card border border-dark-border font-mono">
                    {currentQuestion.inputFormat}
                  </p>
                </div>
              )}

              {currentQuestion.outputFormat && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Output Format</span>
                  <p className="text-xs text-slate-300 p-2.5 rounded-lg bg-dark-card border border-dark-border font-mono">
                    {currentQuestion.outputFormat}
                  </p>
                </div>
              )}

              {/* Constraints */}
              {currentQuestion.constraints && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Constraints</span>
                  <pre className="text-xs text-brand-300 p-2.5 rounded-lg bg-dark-card border border-dark-border font-mono whitespace-pre-wrap">
                    {currentQuestion.constraints}
                  </pre>
                </div>
              )}

              {/* Examples */}
              {currentQuestion.examples && currentQuestion.examples.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Examples</span>
                  {currentQuestion.examples.map((ex, i) => (
                    <div key={i} className="p-3 rounded-xl bg-dark-card border border-dark-border text-xs font-mono space-y-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans font-semibold">Example {i + 1} Input:</span>
                        <pre className="text-slate-200 mt-0.5 whitespace-pre-wrap">{ex.input}</pre>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans font-semibold">Output:</span>
                        <pre className="text-emerald-400 mt-0.5 whitespace-pre-wrap">{ex.output}</pre>
                      </div>
                      {ex.explanation && (
                        <p className="text-[11px] text-slate-400 font-sans border-t border-dark-border/50 pt-1.5">
                          <strong>Explanation:</strong> {ex.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-500">Select a question to view description.</p>
          )}
        </div>

        {/* Right Panel: Monaco Editor & Test Runner (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col bg-[#090D16] overflow-hidden p-3 gap-3">
          {/* Editor Upper Portion */}
          <div className="flex-1 min-h-[300px]">
            <MonacoEditorPanel
              code={currentCode}
              language={userCodes[currentQuestion?.id]?.language || selectedLanguage}
              allowedLanguages={assessment?.allowedLanguages || ['python', 'javascript', 'java', 'cpp']}
              onChangeCode={handleCodeChange}
              onChangeLanguage={handleLanguageChange}
              onResetCode={handleResetCode}
              onRunCode={() => handleRunCode(false)}
              onSubmitQuestion={handleSubmitSolution}
              isRunning={isRunningCode}
              saveStatus={saveStatus}
            />
          </div>

          {/* Test Case Execution Output Bottom Portion */}
          <div className="h-[220px] shrink-0">
            <TestCasePanel
              sampleTestCases={currentQuestion?.sampleTestCases || []}
              customInput={customInput}
              onChangeCustomInput={setCustomInput}
              executionResult={executionResult}
              isRunning={isRunningCode}
              onRunCustom={() => handleRunCode(true)}
            />
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Submit Assessment?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Are you sure you want to finalize your submission? You will not be able to modify your code once submitted.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-dark-surface border border-dark-border text-xs flex items-center justify-between">
              <span className="text-slate-400">Total Questions:</span>
              <span className="font-bold text-white">{questions.length}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-dark-surface hover:bg-dark-hover border border-dark-border text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Submit Assessment</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
