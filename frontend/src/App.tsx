import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.js';
import { Navbar } from './components/common/Navbar.js';
import { LandingPage } from './components/landing/LandingPage.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { AssessmentsView } from './components/admin/AssessmentsView.js';
import { CandidatesView } from './components/admin/CandidatesView.js';
import { LiveMonitoringView } from './components/admin/LiveMonitoringView.js';
import { ProctoringLogsView } from './components/admin/ProctoringLogsView.js';
import { CreateAssessmentModal } from './components/admin/CreateAssessmentModal.js';
import { CandidateResultModal } from './components/admin/CandidateResultModal.js';
import { SystemCheckView } from './components/candidate/SystemCheckView.js';
import { AssessmentEnvironment } from './components/candidate/AssessmentEnvironment.js';
import { SubmissionCompleteView } from './components/candidate/SubmissionCompleteView.js';
import { StudentDashboard } from './components/candidate/StudentDashboard.js';
import {
  LayoutDashboard,
  FileCode2,
  Users,
  Eye,
  ShieldAlert,
  Settings,
  Plus,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { api } from './services/api.js';

export const App: React.FC = () => {
  const { user, candidateAttempt, currentAssessment, logout, setCandidateAttempt } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<'landing' | 'admin' | 'candidate_flow'>('landing');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'assessments' | 'candidates' | 'live' | 'logs'>('dashboard');
  const [candidateStep, setCandidateStep] = useState<'system_check' | 'coding' | 'submitted'>('system_check');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<'ADMIN' | 'CANDIDATE'>('CANDIDATE');
  const [authInitialCode, setAuthInitialCode] = useState('');
  const [createAssessmentOpen, setCreateAssessmentOpen] = useState(false);
  const [selectedCandidateAttemptId, setSelectedCandidateAttemptId] = useState<string | null>(null);
  const [selectedAssessmentForCandidates, setSelectedAssessmentForCandidates] = useState<string | undefined>(undefined);

  const [activeAssessmentData, setActiveAssessmentData] = useState<any>(null);
  const [submissionReceipt, setSubmissionReceipt] = useState<any>(null);

  // Sync view when user role changes
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        setCurrentView('admin');
      } else if (user.role === 'CANDIDATE') {
        setCurrentView('candidate_flow');
        loadCandidateAssessmentSession();
      }
    } else {
      if (currentView !== 'landing') {
        setCurrentView('landing');
      }
    }
  }, [user]);

  const loadCandidateAssessmentSession = async () => {
    try {
      const res = await api.getCandidateAssessment();
      if (res.success) {
        setActiveAssessmentData(res.assessment);
        if (res.attempt.status === 'SUBMITTED') {
          setCandidateStep('submitted');
          setSubmissionReceipt(res.attempt);
        } else if (res.attempt.status === 'IN_PROGRESS') {
          setCandidateStep('coding');
        } else {
          setCandidateStep('system_check');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAuth = (role: 'ADMIN' | 'CANDIDATE', initialCode: string = '') => {
    setAuthModalRole(role);
    setAuthInitialCode(initialCode);
    setAuthModalOpen(true);
  };

  const handleTakeDemoAssessment = (code: string = '') => {
    handleOpenAuth('CANDIDATE', code);
  };

  const handleGoToDashboard = async () => {
    try {
      const res = await api.exitToDashboard();
      if (res.success && res.token) {
        localStorage.setItem('devexam_token', res.token);
      }
    } catch {}
    setCandidateAttempt(null);
    setActiveAssessmentData(null);
    setCandidateStep('system_check');
  };

  const handleSubmissionComplete = (receipt: any) => {
    setSubmissionReceipt(receipt);
    setCandidateStep('submitted');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      {/* Hide global Navbar during fullscreen coding OR when student dashboard is active */}
      {!(currentView === 'candidate_flow' && candidateStep === 'coding') &&
       !(currentView === 'candidate_flow' && user?.role === 'CANDIDATE' && !candidateAttempt) && (
        <Navbar
          onOpenAuth={(role) => handleOpenAuth(role)}
          currentView={currentView}
          onNavigate={(v) => setCurrentView(v as any)}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingPage
            onOpenAuth={(role) => handleOpenAuth(role)}
            onTakeDemo={handleTakeDemoAssessment}
          />
        )}

        {currentView === 'admin' && user?.role === 'ADMIN' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
            {/* Admin Sidebar Navigation */}
            <aside className="w-full md:w-60 shrink-0 space-y-2">
              <div className="p-3 bg-dark-card border border-dark-border rounded-2xl space-y-1">
                <button
                  onClick={() => setAdminTab('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    adminTab === 'dashboard'
                      ? 'bg-brand-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-dark-surface'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setAdminTab('assessments');
                    setSelectedAssessmentForCandidates(undefined);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    adminTab === 'assessments'
                      ? 'bg-brand-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-dark-surface'
                  }`}
                >
                  <FileCode2 className="w-4 h-4" />
                  <span>Assessments</span>
                </button>

                <button
                  onClick={() => {
                    setAdminTab('candidates');
                    setSelectedAssessmentForCandidates(undefined);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    adminTab === 'candidates'
                      ? 'bg-brand-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-dark-surface'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Candidates</span>
                </button>

                <button
                  onClick={() => setAdminTab('live')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    adminTab === 'live'
                      ? 'bg-brand-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-dark-surface'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Live Monitoring</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </button>

                <button
                  onClick={() => setAdminTab('logs')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    adminTab === 'logs'
                      ? 'bg-brand-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-dark-surface'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-brand-400" />
                  <span>Proctoring Logs</span>
                </button>
              </div>

              {/* Quick Action */}
              <button
                onClick={() => setCreateAssessmentOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assessment</span>
              </button>
            </aside>

            {/* Admin Main Body */}
            <div className="flex-1 min-w-0">
              {adminTab === 'dashboard' && (
                <AdminDashboard
                  onNavigateTab={(tab) => setAdminTab(tab as any)}
                  onOpenCreateAssessment={() => setCreateAssessmentOpen(true)}
                  onSelectCandidateResult={(id) => setSelectedCandidateAttemptId(id)}
                />
              )}

              {adminTab === 'assessments' && (
                <AssessmentsView
                  onOpenCreate={() => setCreateAssessmentOpen(true)}
                  onSelectAssessmentCandidates={(assessmentId) => {
                    setSelectedAssessmentForCandidates(assessmentId);
                    setAdminTab('candidates');
                  }}
                />
              )}

              {adminTab === 'candidates' && (
                <CandidatesView
                  selectedAssessmentId={selectedAssessmentForCandidates}
                  onSelectCandidateResult={(id) => setSelectedCandidateAttemptId(id)}
                />
              )}

              {adminTab === 'live' && (
                <LiveMonitoringView
                  onSelectCandidateResult={(id) => setSelectedCandidateAttemptId(id)}
                />
              )}

              {adminTab === 'logs' && (
                <ProctoringLogsView />
              )}
            </div>
          </div>
        )}

        {currentView === 'candidate_flow' && user?.role === 'CANDIDATE' && (
          <div className="flex-1 flex flex-col">
            {/* No attempt yet — show dashboard to enter a code */}
            {!candidateAttempt && (
              <StudentDashboard />
            )}

            {candidateAttempt && candidateStep === 'system_check' && (
              <SystemCheckView
                assessment={activeAssessmentData || currentAssessment}
                candidateAttempt={candidateAttempt}
                onProceedToAssessment={() => setCandidateStep('coding')}
              />
            )}

            {candidateAttempt && candidateStep === 'coding' && (
              <AssessmentEnvironment
                assessment={activeAssessmentData || currentAssessment}
                attempt={candidateAttempt}
                onSubmitSuccess={handleSubmissionComplete}
              />
            )}

            {candidateAttempt && candidateStep === 'submitted' && (
              <SubmissionCompleteView
                submissionData={submissionReceipt}
                onGoToDashboard={handleGoToDashboard}
                onReturnHome={() => {
                  logout();
                  setCurrentView('landing');
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={authModalRole}
        initialCode={authInitialCode}
        onSuccessRole={(role) => {
          if (role === 'ADMIN') setCurrentView('admin');
          else setCurrentView('candidate_flow');
        }}
      />

      <CreateAssessmentModal
        isOpen={createAssessmentOpen}
        onClose={() => setCreateAssessmentOpen(false)}
        onSuccess={() => {
          setAdminTab('assessments');
        }}
      />

      <CandidateResultModal
        attemptId={selectedCandidateAttemptId}
        onClose={() => setSelectedCandidateAttemptId(null)}
      />
    </div>
  );
};
