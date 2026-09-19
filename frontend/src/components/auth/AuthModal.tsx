import React, { useState, useEffect } from 'react';
import { X, Shield, Terminal, Mail, Lock, User as UserIcon, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { DevlustroLogo } from '../common/DevlustroLogo.js';

// ── Shared input styles ───────────────────────────────────────────────────────
const inputCls =
  'w-full pl-9 pr-3 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors';

const InputRow: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({
  icon,
  label,
  children
}) => (
  <div>
    <label className="block text-xs font-medium text-slate-300 mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-[11px] text-slate-400">{icon}</span>
      {children}
    </div>
  </div>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'ADMIN' | 'CANDIDATE';
  initialCode?: string;
  onSuccessRole?: (role: 'ADMIN' | 'CANDIDATE') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'CANDIDATE',
  initialCode = '',
  onSuccessRole
}) => {
  const [role, setRole] = useState<'ADMIN' | 'CANDIDATE'>(initialRole);
  // Candidate sub-mode: 'login' | 'register'
  const [candidateMode, setCandidateMode] = useState<'login' | 'register'>('login');

  // Admin fields
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');

  // Candidate Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Candidate Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loginAdmin, loginCandidate } = useAuth();

  useEffect(() => {
    setRole(initialRole);
    setCandidateMode('login');
    setError(null);
  }, [initialRole, initialCode, isOpen]);

  if (!isOpen) return null;

  // ── Admin ──────────────────────────────────────────────────────────────────
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await loginAdmin(adminEmail, adminPass);
    setLoading(false);
    if (res.success) {
      onClose();
      onSuccessRole?.('ADMIN');
    } else {
      setError(res.message || 'Invalid credentials');
    }
  };

  // ── Candidate Login ────────────────────────────────────────────────────────
  const handleCandidateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Login without assessment code — student goes to dashboard to enter code
      const data = await api.candidateAccountLogin(loginEmail, loginPass);
      if (data.success && data.token) {
        localStorage.setItem('devexam_token', data.token);
        window.location.reload();
      } else {
        setError(data.message || 'Login failed. Check your email and password.');
      }
    } catch {
      setError('Could not reach server — is the backend running?');
    }
    setLoading(false);
  };

  // ── Candidate Register ─────────────────────────────────────────────────────
  const handleCandidateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (regPass !== regPassConfirm) { setError('Passwords do not match'); return; }
    if (regPass.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      // Register without assessment code — student enters code from dashboard
      const data = await api.candidateRegister(regName, regEmail, regPass);
      if (data.success && data.token) {
        localStorage.setItem('devexam_token', data.token);
        window.location.reload();
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Could not reach server — is the backend running?');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-6 pt-1">
          <DevlustroLogo variant="full" size="md" />
        </div>

        {/* Role Switcher */}
        <div className="flex rounded-xl bg-dark-surface p-1 border border-dark-border mb-6">
          <button
            type="button"
            onClick={() => { setRole('CANDIDATE'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              role === 'CANDIDATE' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Candidate Portal</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole('ADMIN'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              role === 'ADMIN' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Recruiter Login</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* ── ADMIN FORM ─────────────────────────────────────────────────── */}
        {role === 'ADMIN' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <InputRow icon={<Mail className="w-4 h-4" />} label="Work Email">
              <input type="email" required autoComplete="email" value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="admin@devexam.com"
                className={inputCls} />
            </InputRow>

            <InputRow icon={<Lock className="w-4 h-4" />} label="Password">
              <input type="password" required autoComplete="current-password" value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
                placeholder="••••••••"
                className={inputCls} />
            </InputRow>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-2">
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Shield className="w-4 h-4" /><span>Sign In</span></>}
            </button>
          </form>
        )}

        {/* ── CANDIDATE FORMS ────────────────────────────────────────────── */}
        {role === 'CANDIDATE' && (
          <>
            {/* Login / Register tabs */}
            <div className="flex rounded-lg bg-dark-surface/60 border border-dark-border/50 p-0.5 mb-5">
              <button type="button"
                onClick={() => { setCandidateMode('login'); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  candidateMode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
              <button type="button"
                onClick={() => { setCandidateMode('register'); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  candidateMode === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Create Account
              </button>
            </div>

            {/* CANDIDATE LOGIN */}
            {candidateMode === 'login' && (
              <form onSubmit={handleCandidateLogin} className="space-y-4">
                <InputRow icon={<Mail className="w-4 h-4" />} label="Email Address">
                  <input type="email" required autoComplete="email" value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={inputCls} />
                </InputRow>
                <InputRow icon={<Lock className="w-4 h-4" />} label="Password">
                  <input type="password" required autoComplete="current-password" value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className={inputCls} />
                </InputRow>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-2">
                  {loading
                    ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><LogIn className="w-4 h-4" /><span>Sign In</span></>}
                </button>
                <p className="text-center text-xs text-slate-500 pt-1">
                  No account?{' '}
                  <button type="button" onClick={() => { setCandidateMode('register'); setError(null); }}
                    className="text-brand-400 hover:underline font-medium">
                    Create one here
                  </button>
                </p>
              </form>
            )}

            {/* CANDIDATE REGISTER */}
            {candidateMode === 'register' && (
              <form onSubmit={handleCandidateRegister} className="space-y-3">
                <InputRow icon={<UserIcon className="w-4 h-4" />} label="Full Name">
                  <input type="text" required autoComplete="name" value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="John Smith"
                    className={inputCls} />
                </InputRow>
                <InputRow icon={<Mail className="w-4 h-4" />} label="Email Address">
                  <input type="email" required autoComplete="email" value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={inputCls} />
                </InputRow>
                <InputRow icon={<Lock className="w-4 h-4" />} label="Password">
                  <input type="password" required autoComplete="new-password" value={regPass}
                    onChange={e => setRegPass(e.target.value)}
                    placeholder="Min 6 characters"
                    className={inputCls} />
                </InputRow>
                <InputRow icon={<Lock className="w-4 h-4" />} label="Confirm Password">
                  <input type="password" required autoComplete="new-password" value={regPassConfirm}
                    onChange={e => setRegPassConfirm(e.target.value)}
                    placeholder="Repeat password"
                    className={inputCls} />
                </InputRow>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2 mt-1">
                  {loading
                    ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><UserPlus className="w-4 h-4" /><span>Create Account</span></>}
                </button>
                <p className="text-center text-xs text-slate-500 pt-1">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setCandidateMode('login'); setError(null); }}
                    className="text-brand-400 hover:underline font-medium">
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
