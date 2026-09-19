import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, AlertTriangle } from 'lucide-react';
import { registerMediaStream, unregisterMediaStream, stopMediaStream } from '../../utils/mediaStream.js';

interface CameraFeedProps {
  onStatusChange?: (status: 'CONNECTED' | 'DISCONNECTED' | 'PERMISSION_DENIED') => void;
  compact?: boolean;
  className?: string;
  showStatusBadge?: boolean;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  onStatusChange,
  compact = false,
  className = '',
  showStatusBadge = true
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'PERMISSION_DENIED'>('DISCONNECTED');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const stopCamera = () => {
    if (streamRef.current) {
      stopMediaStream(streamRef.current);
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const initCamera = async () => {
    try {
      stopCamera();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus('PERMISSION_DENIED');
        setErrorMessage('Camera API not supported on this browser');
        onStatusChange && onStatusChange('PERMISSION_DENIED');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
        audio: false
      });

      streamRef.current = mediaStream;
      registerMediaStream(mediaStream);
      setCameraStatus('CONNECTED');
      setErrorMessage('');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      onStatusChange && onStatusChange('CONNECTED');

      // Listen for stream track stop/disconnect
      mediaStream.getVideoTracks()[0]?.addEventListener('ended', () => {
        setCameraStatus('DISCONNECTED');
        onStatusChange && onStatusChange('DISCONNECTED');
      });
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraStatus('PERMISSION_DENIED');
      setErrorMessage(err.name === 'NotAllowedError' ? 'Camera permission was denied' : 'No camera device found');
      onStatusChange && onStatusChange('PERMISSION_DENIED');
    }
  };

  useEffect(() => {
    initCamera();

    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className={`relative rounded-xl overflow-hidden bg-dark-card border border-dark-border shadow-inner ${className}`}>
      {cameraStatus === 'CONNECTED' ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover mirror scale-x-[-1]"
        />
      ) : (
        <div className="w-full h-full min-h-[140px] flex flex-col items-center justify-center p-3 text-center bg-[#0d131f]">
          <CameraOff className="w-8 h-8 text-rose-400 mb-2 opacity-80" />
          <p className="text-xs font-medium text-rose-300">
            {cameraStatus === 'PERMISSION_DENIED' ? 'Camera Disconnected' : 'Initializing Camera...'}
          </p>
          {errorMessage && (
            <p className="text-[10px] text-slate-400 mt-1 max-w-[180px]">{errorMessage}</p>
          )}
          <button
            onClick={initCamera}
            className="mt-2 text-[11px] px-2.5 py-1 rounded bg-dark-surface hover:bg-dark-hover border border-dark-border text-slate-300 transition-colors"
          >
            Retry Permission
          </button>
        </div>
      )}

      {showStatusBadge && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold">
          {cameraStatus === 'CONNECTED' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400">Camera Active</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-rose-400">Disconnected</span>
            </>
          )}
        </div>
      )}

      {!compact && (
        <div className="absolute bottom-1 right-2 text-[9px] text-slate-400/80 font-mono">
          Proctor Stream
        </div>
      )}
    </div>
  );
};
