import React from 'react';
import {
  Code2,
  Shield,
  Eye,
  CheckCircle2,
  Cpu,
  BarChart3,
  Clock,
  Terminal,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  Video,
  FileCode,
  Check,
  ChevronRight
} from 'lucide-react';
import { DevlustroLogo } from '../common/DevlustroLogo.js';

interface LandingPageProps {
  onOpenAuth: (role: 'ADMIN' | 'CANDIDATE') => void;
  onTakeDemo: (code?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onTakeDemo }) => {
  return (
    <div className="relative min-h-screen">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] bg-brand-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-[-50px] right-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]" />
      </div>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Next-Gen Technical Recruitment & Proctoring Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Assess Real Developers.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400">
            Hire With Confidence.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Conduct secure, timed coding assessments with real-time code execution, AI-assisted proctoring, and comprehensive candidate activity telemetry.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => onOpenAuth('ADMIN')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-base shadow-xl shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            <span>Create Assessment</span>
          </button>
          <button
            onClick={() => onTakeDemo('DEVEXAM-7F82K')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2 group"
          >
            <Terminal className="w-5 h-5 text-brand-400" />
            <span>Take Assessment (Demo)</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Developer Mock Platform Visual */}
        <div className="relative max-w-5xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-brand-500/30 via-slate-800/40 to-transparent shadow-2xl">
          <div className="rounded-2xl bg-[#0e1422] border border-dark-border overflow-hidden text-left shadow-2xl">
            {/* Window Bar */}
            <div className="bg-[#131b2e] px-4 py-3 border-b border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-brand-400" />
                  assessment_environment.tsx — DEVEXAM-7F82K
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>00:47:32</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Proctor Active
                </div>
              </div>
            </div>

            {/* Split Screen Mock */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
              {/* Left Problem Spec */}
              <div className="lg:col-span-4 p-5 bg-[#0e1422] border-r border-dark-border font-sans">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    EASY · 100 PTS
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Q1 of 3</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">Two Sum Target Pairs</h3>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Given an array of integers <code className="text-brand-300 font-mono">nums</code> and an integer <code className="text-brand-300 font-mono">target</code>, return indices of the two numbers such that they add up to target.
                </p>
                <div className="p-3 rounded-lg bg-dark-surface border border-dark-border mb-3 font-mono text-[11px]">
                  <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Sample Input:</p>
                  <p className="text-brand-300">nums = [2,7,11,15], target = 9</p>
                  <p className="text-slate-400 text-[10px] uppercase font-bold mt-2 mb-1">Sample Output:</p>
                  <p className="text-emerald-400">[0, 1]</p>
                </div>
              </div>

              {/* Right Code Editor & Runner */}
              <div className="lg:col-span-8 bg-[#090d16] flex flex-col justify-between">
                {/* Code Tabs */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#101726] border-b border-dark-border text-xs">
                  <div className="flex items-center gap-2 font-mono text-slate-300">
                    <span className="px-2.5 py-1 rounded bg-brand-600/20 text-brand-300 border border-brand-500/30 font-semibold">
                      Python 3
                    </span>
                    <span className="text-slate-500">solution.py</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Autosaved 2s ago</span>
                  </div>
                </div>

                {/* Editor Content Mock */}
                <div className="p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-hidden">
                  <p><span className="text-purple-400">def</span> <span className="text-blue-400 font-semibold">two_sum</span>(nums: List[int], target: int) -&gt; List[int]:</p>
                  <p className="pl-4 text-slate-500"># Hash map for O(n) complement lookup</p>
                  <p className="pl-4"><span className="text-indigo-400">seen</span> = {}</p>
                  <p className="pl-4"><span className="text-purple-400">for</span> i, num <span className="text-purple-400">in</span> enumerate(nums):</p>
                  <p className="pl-8">complement = target - num</p>
                  <p className="pl-8"><span className="text-purple-400">if</span> complement <span className="text-purple-400">in</span> seen:</p>
                  <p className="pl-12"><span className="text-purple-400">return</span> [seen[complement], i]</p>
                  <p className="pl-8">seen[num] = i</p>
                  <p className="pl-4"><span className="text-purple-400">return</span> []</p>
                </div>

                {/* Output Console Bar */}
                <div className="p-3 bg-[#0d131f] border-t border-dark-border flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <Check className="w-3.5 h-3.5" /> 4/4 Test Cases Passed
                    </span>
                    <span className="text-slate-400 text-[11px]">Runtime: 0.12s · Memory: 14.1MB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-dark-card hover:bg-dark-hover border border-dark-border text-xs text-slate-200 font-medium">
                      Run Tests
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs text-white font-medium shadow-md">
                      Submit Solution
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-dark-border/50">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest font-bold text-brand-400 mb-2">Core Capabilities</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">Built for High-Stakes Tech Assessments</p>
          <p className="text-slate-400 mt-3 text-base">
            Everything you need to evaluate software engineers fairly, securely, and at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-brand-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Secure Assessments</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Enforce strict fullscreen lockdowns, detect tab switches, inspect window blur events, and record non-invasive video telemetry.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-brand-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Monaco Code Editor</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Powered by the VS Code editor engine with intelligent autocomplete, syntax highlighting, bracket matching, and multiple themes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-brand-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Real-Time Monitoring</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Admins can monitor live assessment sessions with camera previews, elapsed time counters, and instantaneous warning alerts.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-brand-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automated Evaluation</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sandboxed code execution benchmarks memory usage and runtime against sample and hidden test cases with millisecond precision.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-brand-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Detailed Results & Logs</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Drill down into candidate code diffs, execution metrics, test case pass breakdowns, and chronological proctoring activity event logs.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-brand-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Language Support</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Support for Python 3, Modern JavaScript (Node.js), Java 17+, and C++ with customizable problem boilerplates and starter code.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-dark-border/50">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest font-bold text-brand-400 mb-2">Workflow</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">How Devlustro Works</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border relative">
            <div className="w-10 h-10 rounded-full bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h4 className="text-base font-bold text-white mb-2">1. Create & Share Test</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recruiters configure custom questions, sample/hidden test cases, and time limits, generating a secure access code (e.g. <code className="text-brand-300">DEVEXAM-7F82K</code>).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h4 className="text-base font-bold text-white mb-2">2. System Check & Coding</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Candidates verify webcam, microphone, and fullscreen permissions, then solve algorithm challenges with continuous cloud autosave.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border relative">
            <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h4 className="text-base font-bold text-white mb-2">3. Evaluation & Insights</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submissions are graded against hidden test suites. Admins inspect score distributions, code quality, and flagged proctoring events.
            </p>
          </div>
        </div>
      </section>

      {/* Recruiter / Candidate Dual Value Section */}
      <section id="for-recruiters" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recruiter Box */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-dark-card to-[#121929] border border-dark-border">
            <span className="text-xs uppercase font-bold tracking-wider text-brand-400">For Hiring Teams</span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-4">Automate Tech Screening</h3>
            <ul className="space-y-3 text-sm text-slate-300 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Custom test case suites with hidden verification runs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Live Candidate surveillance room with webcam and risk scoring
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Detailed timeline of tab switches and fullscreen exits
              </li>
            </ul>
            <button
              onClick={() => onOpenAuth('ADMIN')}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-all shadow-md"
            >
              Open Recruiter Portal
            </button>
          </div>

          {/* Candidate Box */}
          <div id="for-candidates" className="p-8 rounded-3xl bg-gradient-to-br from-dark-card to-[#121929] border border-dark-border">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">For Candidates</span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-4">Seamless Coding Interface</h3>
            <ul className="space-y-3 text-sm text-slate-300 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Full Monaco editor with shortcuts, bracket matching & auto-indent
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Instant custom input testing and sample test diagnostics
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Resilient cloud autosave with network reconnection guards
              </li>
            </ul>
            <button
              onClick={() => onTakeDemo('DEVEXAM-7F82K')}
              className="px-5 py-2.5 rounded-xl bg-dark-surface hover:bg-dark-hover border border-dark-border text-white text-sm font-semibold transition-all"
            >
              Start Candidate Session
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 py-10 border-t border-dark-border text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <DevlustroLogo variant="full" size="sm" />
          <p>© 2026 Devlustro. All rights reserved. Secure assessment and proctoring platform.</p>
        </div>
      </footer>
    </div>
  );
};
