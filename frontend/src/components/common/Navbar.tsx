import React from 'react';
import { LayoutDashboard, CheckCircle2, LogOut, Terminal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { DevlustroLogo } from './DevlustroLogo.js';

interface NavbarProps {
  onOpenAuth: (role: 'ADMIN' | 'CANDIDATE') => void;
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, currentView, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-dark-border bg-[#0B0F19]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate && onNavigate('landing')}
          className="cursor-pointer hover:opacity-90 transition-opacity"
        >
          <DevlustroLogo variant="full" size="md" />
        </div>

        {/* Navigation Links for Landing */}
        {!user && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-brand-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-400 transition-colors">How It Works</a>
            <a href="#for-recruiters" className="hover:text-brand-400 transition-colors">For Recruiters</a>
            <a href="#for-candidates" className="hover:text-brand-400 transition-colors">For Candidates</a>
          </nav>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              {user.role === 'ADMIN' && (
                <button
                  onClick={() => onNavigate && onNavigate('admin')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'admin'
                      ? 'bg-brand-600 text-white'
                      : 'bg-dark-card text-slate-300 hover:text-white hover:bg-dark-border'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </button>
              )}

              {user.role === 'CANDIDATE' && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Candidate Session</span>
                </div>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-dark-border">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-semibold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuth('ADMIN')}
                className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-dark-card transition-colors"
              >
                Recruiter Login
              </button>
              <button
                onClick={() => onOpenAuth('CANDIDATE')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-brand-500/25 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Terminal className="w-4 h-4" />
                <span>Take Assessment</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
