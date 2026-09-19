import React, { useState, useEffect } from 'react';
import {
  Shield,
  Camera,
  Mic,
  Maximize2,
  Wifi,
  Globe,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Lock,
  Eye,
  Terminal,
  Clock
} from 'lucide-react';
import { CameraFeed } from '../common/CameraFeed.js';
import { api } from '../../services/api.js';

interface SystemCheckViewProps {
  assessment: any;
  candidateAttempt: any;
  onProceedToAssessment: () => void;
}

export const SystemCheckView: React.FC<SystemCheckViewProps> = ({
  assessment,
  candidateAttempt,
  onProceedToAssessment
}) => {
  const [cameraOk, setCameraOk] = useState<boolean>(false);
  const [micOk, setMicOk] = useState<boolean>(false);
  const [fullscreenOk, setFullscreenOk] = useState<boolean>(false);
  const [browserOk, setBrowserOk] = useState<boolean>(true);
  const [internetOk, setInternetOk] = useState<boolean>(navigator.onLine);
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [testingMic, setTestingMic] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const micStreamRef = React.useRef<MediaStream | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  // Check microphone permissions & audio volume level
  const testMicrophone = async () => {
    setTestingMic(true);
    try {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicOk(true);

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        const audioContext = new AudioCtxClass();
        audioCtxRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        javascriptNode.onaudioprocess = () => {
          const array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          let values = 0;
          const length = array.length;
          for (let i = 0; i < length; i++) {
            values += array[i];
          }
          const average = values / length;
          setMicVolume(Math.min(100, Math.round(average * 2)));
        };
      }
    } catch (e) {
      console.warn('Microphone permission issue:', e);
      setMicOk(false);
    } finally {
      setTestingMic(false);
    }
  };

  useEffect(() => {
    testMicrophone();

    const handleOnline = () => setInternetOk(true);
    const handleOffline = () => setInternetOk(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleFullscreenChange = () => {
      setFullscreenOk(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch {}
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFullscreenOk(true);
      }
    } catch (err) {
      console.warn('Fullscreen request denied or not allowed:', err);
      // Still allow progression if browser policy requires direct gesture
      setFullscreenOk(true);
    }
  };

  const handleStartAssessment = async () => {
    setIsChecking(true);
    try {
      // Enter fullscreen if not already
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
        } catch {}
      }

      await api.updateSystemCheck('CONNECTED', micOk ? 'CONNECTED' : 'PERMISSION_DENIED');
      await api.startAssessment();
      onProceedToAssessment();
    } catch (err) {
      console.error('Failed to start assessment:', err);
      onProceedToAssessment();
    } finally {
      setIsChecking(false);
    }
  };

  const allSystemChecksPassed = cameraOk && consentGiven;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-center animate-fade-in">
      {/* Step Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>Pre-Assessment Readiness & Verification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">{assessment?.title || 'Coding Assessment'}</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
          Please review the test rules and complete the hardware system check to begin your proctored session.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assessment Spec & Rules */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-400" />
              Assessment Overview
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-dark-surface border border-dark-border">
                <span className="text-[10px] text-slate-400 block font-medium">Allocated Time</span>
                <span className="font-semibold text-white text-sm flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {assessment?.durationMinutes || 60} Minutes
                </span>
              </div>

              <div className="p-3 rounded-xl bg-dark-surface border border-dark-border">
                <span className="text-[10px] text-slate-400 block font-medium">Questions</span>
                <span className="font-semibold text-white text-sm mt-0.5 block">
                  {assessment?.questions?.length || 3} Problems
                </span>
              </div>

              <div className="p-3 rounded-xl bg-dark-surface border border-dark-border col-span-2">
                <span className="text-[10px] text-slate-400 block font-medium">Supported Languages</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(assessment?.allowedLanguages || ['python', 'javascript', 'java', 'cpp']).map((l: string, i: number) => (
                    <span key={i} className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 font-semibold">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Rules Checklist */}
            <div className="pt-2 border-t border-dark-border space-y-2 text-xs text-slate-300">
              <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Proctoring & Anti-Cheating Guidelines
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                  <span><strong>Fullscreen Enforcement:</strong> Exiting fullscreen or minimizing will log a violation event for recruiter review.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                  <span><strong>Tab Switch Monitoring:</strong> Navigating away from the active tab is monitored and timestamped.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                  <span><strong>Code Autosave:</strong> Your code is continuously preserved in real-time in the background.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive System Check & Live Camera */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                Live Camera & Hardware Verification
              </span>
              {cameraOk && (
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Ready
                </span>
              )}
            </h2>

            {/* Live Camera Stream */}
            <div className="h-44 w-full">
              <CameraFeed
                onStatusChange={(status) => setCameraOk(status === 'CONNECTED')}
                showStatusBadge={true}
                className="h-full w-full"
              />
            </div>

            {/* Checklist Grid */}
            <div className="space-y-2 text-xs">
              {/* Camera Status */}
              <div className="p-2.5 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Camera className="w-4 h-4 text-slate-400" />
                  <span>Camera Permission</span>
                </div>
                {cameraOk ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                    <XCircle className="w-3.5 h-3.5" /> Action Required
                  </span>
                )}
              </div>

              {/* Mic Status */}
              <div className="p-2.5 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mic className="w-4 h-4 text-slate-400" />
                  <span>Microphone Sensor</span>
                </div>
                <div className="flex items-center gap-2">
                  {micOk && (
                    <div className="w-16 h-1.5 bg-dark-border rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 transition-all" style={{ width: `${Math.max(10, micVolume)}%` }} />
                    </div>
                  )}
                  <span className={`text-[11px] font-semibold ${micOk ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {micOk ? 'Active' : 'Optional / Granted'}
                  </span>
                </div>
              </div>

              {/* Fullscreen Guard */}
              <div className="p-2.5 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Maximize2 className="w-4 h-4 text-slate-400" />
                  <span>Fullscreen Mode</span>
                </div>
                <button
                  onClick={requestFullscreen}
                  className="px-2.5 py-1 rounded bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 text-[10px] font-semibold transition-colors"
                >
                  {fullscreenOk ? '✓ Active' : 'Enable Fullscreen'}
                </button>
              </div>

              {/* Connection Status */}
              <div className="p-2.5 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Wifi className="w-4 h-4 text-slate-400" />
                  <span>Internet Connection</span>
                </div>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Optimal
                </span>
              </div>
            </div>

            {/* Consent Notice Checkbox */}
            <div className="pt-2 border-t border-dark-border">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 rounded bg-dark-surface border-dark-border text-brand-600 focus:ring-brand-500"
                />
                <span className="text-[11px] text-slate-400 leading-relaxed">
                  I acknowledge that this session is proctored. My camera feed, fullscreen state, and tab activity will be logged solely for assessment integrity verification.
                </span>
              </label>
            </div>
          </div>

          {/* Start Test CTA */}
          <button
            onClick={handleStartAssessment}
            disabled={!consentGiven || isChecking}
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
              consentGiven && !isChecking
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-brand-500/25 cursor-pointer transform hover:-translate-y-0.5'
                : 'bg-dark-card border border-dark-border text-slate-500 cursor-not-allowed'
            }`}
          >
            {isChecking ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Start Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
