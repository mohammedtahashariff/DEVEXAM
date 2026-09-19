import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Cpu,
  Lock,
  Play,
  AlertTriangle,
  AlertCircle,
  FileCode,
  Sparkles
} from 'lucide-react';
import { TestCaseResult, CodeExecutionResponse, TestCase } from '../../types/index.js';

interface TestCasePanelProps {
  sampleTestCases: TestCase[];
  customInput: string;
  onChangeCustomInput: (val: string) => void;
  executionResult: CodeExecutionResponse | null;
  isRunning: boolean;
  onRunCustom: () => void;
}

export const TestCasePanel: React.FC<TestCasePanelProps> = ({
  sampleTestCases,
  customInput,
  onChangeCustomInput,
  executionResult,
  isRunning,
  onRunCustom
}) => {
  const [activeTab, setActiveTab] = useState<'sample' | 'custom' | 'hidden'>('sample');
  const [selectedCaseIndex, setSelectedCaseIndex] = useState<number>(0);

  const results = executionResult?.results || [];
  const hasSampleCases = sampleTestCases && sampleTestCases.length > 0;

  return (
    <div className="flex flex-col bg-[#0B0F19] border border-dark-border rounded-xl overflow-hidden shadow-inner h-full min-h-[220px]">
      {/* Tab Navigation Header */}
      <div className="px-4 py-2 bg-[#121929] border-b border-dark-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('sample')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sample'
                ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sample Test Cases ({sampleTestCases.length})
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'custom'
                ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Input
          </button>

          <button
            onClick={() => setActiveTab('hidden')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'hidden'
                ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Hidden Test Suite</span>
            <span className="sm:hidden">Hidden</span>
          </button>
        </div>

        {/* Global Result Summary */}
        {executionResult && (
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
            {executionResult.status === 'SUCCESS' && (
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{executionResult.passed}/{executionResult.total} Passed</span>
              </span>
            )}
            {executionResult.status === 'WRONG_ANSWER' && (
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{executionResult.passed}/{executionResult.total} Passed</span>
              </span>
            )}
            {(executionResult.status === 'RUNTIME_ERROR' || executionResult.status === 'COMPILATION_ERROR') && (
              <span className="flex items-center gap-1 font-bold text-rose-400">
                <XCircle className="w-3.5 h-3.5" />
                <span>{executionResult.status === 'COMPILATION_ERROR' ? 'Compilation Error' : 'Runtime Error'}</span>
              </span>
            )}
            {executionResult.status === 'TIME_LIMIT_EXCEEDED' && (
              <span className="flex items-center gap-1 font-bold text-rose-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Time Limit Exceeded</span>
              </span>
            )}

            <span className="text-slate-400 text-[11px] hidden sm:inline">
              ⚡ {executionResult.executionTime}
            </span>
          </div>
        )}
      </div>

      {/* Tab Contents */}
      <div className="p-3.5 flex-1 overflow-y-auto">
        {isRunning ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2.5" />
            <span className="font-medium text-slate-300">Executing code in sandbox...</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Evaluating test cases and capturing standard output</span>
          </div>
        ) : activeTab === 'sample' ? (
          /* Sample Test Cases View */
          <div className="space-y-3">
            {hasSampleCases ? (
              <>
                {/* Case Selector Pills */}
                <div className="flex flex-wrap gap-2">
                  {sampleTestCases.map((tc, idx) => {
                    const res = results[idx];
                    return (
                      <button
                        key={tc.id || idx}
                        onClick={() => setSelectedCaseIndex(idx)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                          selectedCaseIndex === idx
                            ? 'bg-brand-600/20 border-brand-500 text-white shadow-sm'
                            : 'bg-dark-surface border-dark-border text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {res ? (
                          res.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                        )}
                        <span>Case {idx + 1}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Case Inspection */}
                {sampleTestCases[selectedCaseIndex] && (
                  <div className="space-y-2.5 font-mono text-xs">
                    {/* Input */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Standard Input:</span>
                      <pre className="p-2 rounded-lg bg-dark-card border border-dark-border text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-24">
                        {sampleTestCases[selectedCaseIndex].input || '(empty)'}
                      </pre>
                    </div>

                    {/* Expected Output */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Expected Output:</span>
                      <pre className="p-2 rounded-lg bg-dark-card border border-dark-border text-emerald-400 overflow-x-auto whitespace-pre-wrap max-h-24">
                        {sampleTestCases[selectedCaseIndex].expectedOutput}
                      </pre>
                    </div>

                    {/* Actual Output if executed */}
                    {results[selectedCaseIndex] && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Your Output:</span>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            results[selectedCaseIndex].passed
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {results[selectedCaseIndex].passed ? 'PASSED' : 'MISMATCH'}
                          </span>
                        </div>
                        <pre
                          className={`p-2 rounded-lg border overflow-x-auto whitespace-pre-wrap max-h-28 ${
                            results[selectedCaseIndex].passed
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                          }`}
                        >
                          {results[selectedCaseIndex].actualOutput || '(no output produced)'}
                        </pre>
                        {results[selectedCaseIndex].errorMessage && (
                          <div className="mt-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span className="whitespace-pre-wrap">{results[selectedCaseIndex].errorMessage}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* If question has no predefined test cases */
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    <h4 className="text-xs font-bold text-white">Direct Execution Mode</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This problem does not define static test cases. Click <strong>Run Code</strong> to execute your solution, or use the <strong>Custom Input</strong> tab to pass custom stdin parameters.
                  </p>
                </div>

                {results.length > 0 && (
                  <div className="space-y-1.5 font-mono text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Execution Output:</span>
                    <pre className="p-2.5 rounded-lg bg-dark-card border border-dark-border text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-32">
                      {results[0].actualOutput || '(execution completed with no stdout)'}
                    </pre>
                    {results[0].errorMessage && (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                        {results[0].errorMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : activeTab === 'custom' ? (
          /* Custom Input Tab */
          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 font-sans">
                Standard Input (stdin)
              </label>
              <textarea
                rows={2}
                value={customInput}
                onChange={(e) => onChangeCustomInput(e.target.value)}
                placeholder="Enter input data to pass to stdin (e.g. 5&#10;1 2 3 4 5)..."
                className="w-full px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-xs font-mono text-white focus:outline-none focus:border-brand-500 resize-none placeholder:text-slate-600"
              />
            </div>

            <button
              onClick={onRunCustom}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 border border-brand-500 text-white text-xs font-semibold transition-all shadow-sm font-sans"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run with Custom Input</span>
            </button>

            {/* Custom Run Result */}
            {results.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-dark-border/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Custom Output:</span>
                <pre
                  className={`p-2.5 rounded-lg border overflow-x-auto whitespace-pre-wrap max-h-32 ${
                    results[0].errorMessage
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                      : 'bg-dark-card border-dark-border text-emerald-300'
                  }`}
                >
                  {results[0].actualOutput || '(no stdout output produced)'}
                </pre>
                {results[0].errorMessage && (
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{results[0].errorMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Hidden Test Cases Info */
          <div className="p-5 rounded-xl bg-dark-card border border-dark-border text-center space-y-2">
            <Lock className="w-7 h-7 text-indigo-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">Hidden Evaluation Suite</h4>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
              Additional hidden test cases, large performance constraints, and boundary edge cases will be evaluated comprehensively on the server when you submit your test.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

