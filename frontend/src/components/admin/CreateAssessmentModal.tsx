import React, { useState } from 'react';
import { X, Plus, Trash2, Code2, Check, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';

interface CreateAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAssessmentModal: React.FC<CreateAssessmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [passingScore, setPassingScore] = useState(70);
  const [allowedLanguages, setAllowedLanguages] = useState<string[]>(['python', 'javascript', 'java', 'cpp']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial Questions state
  const [questions, setQuestions] = useState<any[]>([
    {
      title: 'Array Pivot Sum',
      description: 'Given an array of integers `nums`, calculate the pivot index of this array.\n\nThe pivot index is the index where the sum of all the numbers strictly to the left of the index is equal to the sum of all the numbers strictly to the index\'s right.',
      inputFormat: 'First line contains space-separated integers.',
      outputFormat: 'Single integer index or -1.',
      constraints: '1 <= nums.length <= 10^4',
      difficulty: 'EASY',
      points: 100,
      examples: [
        { input: '1 7 3 6 5 6', output: '3', explanation: 'Left sum = nums[0] + nums[1] + nums[2] = 11, Right sum = nums[4] + nums[5] = 11.' }
      ],
      testCases: [
        { input: '1 7 3 6 5 6', expectedOutput: '3', isHidden: false },
        { input: '1 2 3', expectedOutput: '-1', isHidden: false },
        { input: '2 1 -1', expectedOutput: '0', isHidden: true }
      ]
    }
  ]);

  if (!isOpen) return null;

  const toggleLanguage = (lang: string) => {
    if (allowedLanguages.includes(lang)) {
      if (allowedLanguages.length > 1) {
        setAllowedLanguages(allowedLanguages.filter(l => l !== lang));
      }
    } else {
      setAllowedLanguages([...allowedLanguages, lang]);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        title: `Problem ${questions.length + 1}`,
        description: 'Describe the problem statement, algorithm logic and constraints here.',
        inputFormat: 'Describe standard input format.',
        outputFormat: 'Describe expected standard output format.',
        constraints: '1 <= N <= 10^5',
        difficulty: 'MEDIUM',
        points: 100,
        examples: [
          { input: 'input example', output: 'expected example', explanation: 'Reasoning' }
        ],
        testCases: [
          { input: 'sample test input', expectedOutput: 'sample test output', isHidden: false },
          { input: 'hidden test input', expectedOutput: 'hidden test output', isHidden: true }
        ]
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addTestCase = (qIndex: number, isHidden: boolean = false) => {
    const updated = [...questions];
    updated[qIndex].testCases.push({
      input: '',
      expectedOutput: '',
      isHidden
    });
    setQuestions(updated);
  };

  const removeTestCase = (qIndex: number, tcIndex: number) => {
    const updated = [...questions];
    updated[qIndex].testCases = updated[qIndex].testCases.filter((_: any, i: number) => i !== tcIndex);
    setQuestions(updated);
  };

  const updateTestCase = (qIndex: number, tcIndex: number, field: string, value: any) => {
    const updated = [...questions];
    updated[qIndex].testCases[tcIndex][field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Please provide an assessment title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.createAssessment({
        title,
        description,
        durationMinutes,
        passingScore,
        allowedLanguages,
        questions
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to create assessment');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between bg-[#101726]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create Technical Assessment</h2>
              <p className="text-[11px] text-slate-400">Set duration, languages, questions, and test suites</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* General Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assessment Name *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer Challenge"
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Instructions</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Assessment overview, guidelines and hiring criteria..."
                className="w-full px-3.5 py-2 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min={5}
                max={240}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Passing Score (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          {/* Allowed Languages */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Allowed Programming Languages</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'python', label: 'Python 3' },
                { id: 'javascript', label: 'JavaScript (Node.js)' },
                { id: 'java', label: 'Java 17' },
                { id: 'cpp', label: 'C++ 20' }
              ].map((lang) => {
                const isSelected = allowedLanguages.includes(lang.id);
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => toggleLanguage(lang.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-600/20 border-brand-500 text-brand-300'
                        : 'bg-dark-surface border-dark-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-brand-400" />}
                    <span>{lang.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions Section */}
          <div className="border-t border-dark-border pt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Questions & Test Cases ({questions.length})</h3>
                <p className="text-[11px] text-slate-400">Configure problems and input/output evaluation suites</p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-surface hover:bg-dark-hover border border-dark-border text-xs text-brand-300 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 rounded-xl bg-dark-surface border border-dark-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-400 uppercase font-mono">
                      Question #{qIndex + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={q.difficulty}
                        onChange={(e) => updateQuestion(qIndex, 'difficulty', e.target.value)}
                        className="bg-dark-card border border-dark-border rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={q.title}
                      onChange={(e) => updateQuestion(qIndex, 'title', e.target.value)}
                      placeholder="Question Title (e.g. Valid Anagram)"
                      className="w-full px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      value={q.description}
                      onChange={(e) => updateQuestion(qIndex, 'description', e.target.value)}
                      placeholder="Problem statement..."
                      className="w-full px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500 resize-none font-mono"
                    />
                  </div>

                  {/* Test Cases */}
                  <div className="pt-2 border-t border-dark-border/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400">Test Cases ({q.testCases?.length || 0})</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => addTestCase(qIndex, false)}
                          className="text-[10px] text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Sample Case
                        </button>
                        <button
                          type="button"
                          onClick={() => addTestCase(qIndex, true)}
                          className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Hidden Case
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {q.testCases?.map((tc: any, tcIndex: number) => (
                        <div
                          key={tcIndex}
                          className="p-2.5 rounded-lg bg-dark-card border border-dark-border flex flex-col sm:flex-row gap-2 items-start sm:items-center text-xs"
                        >
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              tc.isHidden
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {tc.isHidden ? 'Hidden' : 'Sample'}
                          </span>

                          <input
                            type="text"
                            value={tc.input}
                            onChange={(e) => updateTestCase(qIndex, tcIndex, 'input', e.target.value)}
                            placeholder="Input (e.g. 1 7 3 6 5 6)"
                            className="flex-1 px-2 py-1 rounded bg-dark-surface border border-dark-border text-[11px] font-mono text-slate-200 focus:outline-none"
                          />

                          <input
                            type="text"
                            value={tc.expectedOutput}
                            onChange={(e) => updateTestCase(qIndex, tcIndex, 'expectedOutput', e.target.value)}
                            placeholder="Expected Output (e.g. 3)"
                            className="flex-1 px-2 py-1 rounded bg-dark-surface border border-dark-border text-[11px] font-mono text-emerald-300 focus:outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => removeTestCase(qIndex, tcIndex)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#101726] border-t border-dark-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Publish Assessment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
