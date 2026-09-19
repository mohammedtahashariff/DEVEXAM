import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  AlertTriangle,
  CameraOff,
  Maximize2,
  Minimize2,
  Terminal,
  Clock,
  RefreshCw,
  Info,
  CheckCircle2
} from 'lucide-react';
import { ProctoringEvent } from '../../types/index.js';
import { api } from '../../services/api.js';

export const ProctoringLogsView: React.FC = () => {
  const [logs, setLogs] = useState<ProctoringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [totalCount, setTotalCount] = useState(0);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getProctoringLogs({
        candidateName: search,
        eventType: eventTypeFilter,
        severity: severityFilter
      });
      if (res.success) {
        setLogs(res.logs);
        setTotalCount(res.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [search, eventTypeFilter, severityFilter]);

  const getEventBadge = (eventType: string, severity: string) => {
    switch (eventType) {
      case 'TAB_SWITCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Minimize2 className="w-3 h-3 text-amber-400" />
            Tab Switch
          </span>
        );
      case 'FULLSCREEN_EXIT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
            <Maximize2 className="w-3 h-3 text-rose-400" />
            Fullscreen Exit
          </span>
        );
      case 'CAMERA_DISCONNECT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600/15 text-red-400 border border-red-500/30">
            <CameraOff className="w-3 h-3" />
            Camera Disconnected
          </span>
        );
      case 'CODE_RUN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
            <Terminal className="w-3 h-3" />
            Code Run
          </span>
        );
      case 'ASSESSMENT_SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Submitted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-300 border border-slate-500/20">
            <Info className="w-3 h-3" />
            {eventType}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-brand-400" />
            Proctoring Activity Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit trail of candidate window events, tab switches, browser focus changes, and hardware states.
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="p-2.5 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-2xl bg-dark-card border border-dark-border">
        <div className="sm:col-span-5 flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-surface border border-dark-border">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Event Types</option>
            <option value="TAB_SWITCH">Tab Switch</option>
            <option value="FULLSCREEN_EXIT">Fullscreen Exit</option>
            <option value="CAMERA_DISCONNECT">Camera Disconnect</option>
            <option value="CODE_RUN">Code Executed</option>
            <option value="ASSESSMENT_STARTED">Assessment Started</option>
            <option value="ASSESSMENT_SUBMITTED">Assessment Submitted</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="WARNING">Warning</option>
            <option value="DANGER">Danger / Critical</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-dark-card border border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0f1624] text-slate-400 uppercase text-[10px] font-semibold border-b border-dark-border">
              <tr>
                <th className="px-4 py-3.5">Candidate</th>
                <th className="px-4 py-3.5">Event</th>
                <th className="px-4 py-3.5">Severity</th>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Assessment</th>
                <th className="px-4 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-sans">
                    Loading activity logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 font-sans">
                    No proctoring events recorded for current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-dark-hover/50 transition-colors font-sans">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-white">{log.candidate?.name || 'Unknown'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{log.candidate?.email}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      {getEventBadge(log.eventType, log.severity)}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          log.severity === 'DANGER' || log.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300'
                            : log.severity === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-slate-200 text-xs font-semibold">{log.assessment?.title}</span>
                      <p className="text-[10px] text-brand-400 font-mono">{log.assessment?.code}</p>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
