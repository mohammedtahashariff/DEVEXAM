import React, { useState, useEffect } from 'react';
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Users,
  Layers,
  Search,
  Globe,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { Assessment } from '../../types/index.js';
import { api } from '../../services/api.js';

interface AssessmentsViewProps {
  onOpenCreate: () => void;
  onSelectAssessmentCandidates: (assessmentId: string) => void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({
  onOpenCreate,
  onSelectAssessmentCandidates
}) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const res = await api.getAssessments();
      if (res.success) {
        setAssessments(res.assessments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handlePublishToggle = async (id: string, currentStatus: string) => {
    const next =
      currentStatus === 'ACTIVE' ? 'DRAFT'
      : currentStatus === 'DRAFT' ? 'ACTIVE'
      : 'ACTIVE'; // CLOSED → ACTIVE
    const label = next === 'ACTIVE' ? 'publish' : 'unpublish';
    if (!confirm(`Are you sure you want to ${label} this assessment?`)) return;
    const res = await api.publishAssessment(id, next as any);
    if (res.success) loadAssessments();
    else alert(res.message || 'Failed to update status');
  };

  const handleDuplicate = async (id: string) => {
    if (confirm('Duplicate this assessment with all questions and test cases?')) {
      const res = await api.duplicateAssessment(id);
      if (res.success) loadAssessments();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this assessment? All candidate records and logs will be deleted.')) {
      const res = await api.deleteAssessment(id);
      if (res.success) loadAssessments();
    }
  };

  const filtered = assessments.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Recruitment Assessments</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage coding challenges, access codes, test suites, and duration constraints.
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Assessment</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 p-2 bg-dark-card border border-dark-border rounded-xl">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by assessment name or access code (e.g. DEVEXAM-7F82K)..."
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Grid of Assessments */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p>Loading assessments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-dark-card border border-dark-border">
          <Layers className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No assessments found</p>
          <p className="text-xs text-slate-500 mt-1">Create your first assessment to start testing candidates.</p>
          <button
            onClick={onOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
          >
            Create Assessment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-dark-card border border-dark-border hover:border-brand-500/30 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
            >
              <div className="p-5">
                {/* Header Badge & Code */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {/* Clickable publish/status toggle */}
                  <button
                    onClick={() => handlePublishToggle(item.id, item.status)}
                    title={item.status === 'ACTIVE' ? 'Click to unpublish' : 'Click to publish'}
                    className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border transition-all ${
                      item.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                        : item.status === 'DRAFT'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                        : 'bg-slate-500/10 border-slate-500/20 text-slate-400 hover:bg-slate-500/20'
                    }`}
                  >
                    {item.status === 'ACTIVE' ? (
                      <><Globe className="w-3 h-3" /> Published</>
                    ) : item.status === 'DRAFT' ? (
                      <><EyeOff className="w-3 h-3" /> Draft — Click to Publish</>
                    ) : (
                      <><EyeOff className="w-3 h-3" /> {item.status}</>
                    )}
                  </button>
                  
                  {/* Shareable Code Badge */}
                  <button
                    onClick={() => handleCopy(item.code)}
                    title="Click to copy access code"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-surface hover:bg-dark-hover border border-dark-border font-mono text-[11px] font-bold text-brand-300 transition-colors"
                  >
                    <span>{item.code}</span>
                    {copiedCode === item.code ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-brand-300 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Key Specs */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-dark-surface border border-dark-border text-center text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                    <span className="font-semibold text-white">{item.durationMinutes}m</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Questions</span>
                    <span className="font-semibold text-white">{item.questionCount ?? 3}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Pass Mark</span>
                    <span className="font-semibold text-brand-300">{item.passingScore}%</span>
                  </div>
                </div>

                {/* Language Badges */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.allowedLanguages.map((lang, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1f293d] text-slate-300 border border-slate-700/50"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-5 py-3.5 bg-[#0e1422] border-t border-dark-border flex items-center justify-between">
                <button
                  onClick={() => onSelectAssessmentCandidates(item.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{item.totalCandidates || 0} Candidates</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(item.id)}
                    title="Duplicate assessment"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-surface transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Delete assessment"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
