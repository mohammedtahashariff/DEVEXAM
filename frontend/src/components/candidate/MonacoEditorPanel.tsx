import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  CheckCircle2,
  RotateCcw,
  Code2,
  Check,
  AlertCircle,
  Sparkles,
  Send
} from 'lucide-react';

interface MonacoEditorPanelProps {
  code: string;
  language: string;
  allowedLanguages: string[];
  onChangeCode: (newCode: string) => void;
  onChangeLanguage: (newLang: string) => void;
  onResetCode: () => void;
  onRunCode: () => void;
  onSubmitQuestion: () => void;
  isRunning: boolean;
  saveStatus: 'SAVED' | 'SAVING' | 'ERROR';
}

export const MonacoEditorPanel: React.FC<MonacoEditorPanelProps> = ({
  code,
  language,
  allowedLanguages,
  onChangeCode,
  onChangeLanguage,
  onResetCode,
  onRunCode,
  onSubmitQuestion,
  isRunning,
  saveStatus
}) => {
  const getMonacoLanguage = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'python':
      case 'py':
        return 'python';
      case 'javascript':
      case 'js':
        return 'javascript';
      case 'java':
        return 'java';
      case 'cpp':
      case 'c++':
        return 'cpp';
      default:
        return 'python';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0E1422] border border-dark-border rounded-xl overflow-hidden shadow-inner">
      {/* Top Toolbar */}
      <div className="px-4 py-2.5 bg-[#121929] border-b border-dark-border flex flex-wrap items-center justify-between gap-2">
        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-brand-400" />
          <select
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-dark-card border border-dark-border text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
          >
            {allowedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang === 'python' ? 'Python 3' : lang === 'javascript' ? 'JavaScript (Node.js)' : lang === 'java' ? 'Java 17' : 'C++ 20'}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Autosave Indicator */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {saveStatus === 'SAVED' && (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved</span>
            </span>
          )}
          {saveStatus === 'SAVING' && (
            <span className="flex items-center gap-1 text-amber-400 font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === 'ERROR' && (
            <span className="flex items-center gap-1 text-rose-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Syncing offline...</span>
            </span>
          )}
        </div>

        {/* Reset & Quick Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetCode}
            title="Reset to default starter code"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-300 text-xs transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Code</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full min-h-[260px] bg-[#0E1422]">
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          value={code}
          onChange={(val) => onChangeCode(val || '')}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>

      {/* Bottom Action Bar */}
      <div className="px-4 py-2.5 bg-[#121929] border-t border-dark-border flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          Ctrl+Enter to Run
        </span>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-200 text-xs font-semibold transition-all shadow"
          >
            {isRunning ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
            )}
            <span>Run Code</span>
          </button>

          <button
            onClick={onSubmitQuestion}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all shadow-md shadow-brand-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Solution</span>
          </button>
        </div>
      </div>
    </div>
  );
};
