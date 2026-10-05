import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Layers,
  Edit,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import JsonViewer from '../common/JsonViewer';

/**
 * AuditTrail Component
 * Visual chronological event timeline displaying every action, review, dry-run,
 * live execution, retry, and rollback.
 */
export default function AuditTrail({
  trail = [],
  loading = false,
  title = "Immutable Governance Trail",
}) {
  const [expandedEntryId, setExpandedEntryId] = useState(null);

  const getActionConfig = (action) => {
    switch (action) {
      case 'init':
        return {
          icon: Layers,
          color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/30',
          label: 'Workspace Initialized',
        };
      case 'propose':
        return {
          icon: Sparkles,
          color: 'text-amethyst-dark bg-amethyst/10 border-amethyst/30',
          label: 'AI Mapping Proposed',
        };
      case 'update_plan':
        return {
          icon: Edit,
          color: 'text-blue-600 bg-blue-500/10 border-blue-500/30',
          label: 'Plan Revised by Human',
        };
      case 'approve':
        return {
          icon: ShieldCheck,
          color: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/30',
          label: 'Human Approval Granted',
        };
      case 'dry_run':
        return {
          icon: PlayCircle,
          color: 'text-amber-700 bg-amber-500/10 border-amber-500/30',
          label: 'Deterministic Simulation Run',
        };
      case 'execute':
        return {
          icon: PlayCircle,
          color: 'text-emerald-800 bg-emerald-500/20 border-emerald-500/40 font-bold',
          label: 'Live Migration Executed',
        };
      case 'rollback':
        return {
          icon: RotateCcw,
          color: 'text-rose-800 bg-rose-500/15 border-rose-500/40',
          label: 'Migration Rolled Back',
        };
      default:
        return {
          icon: History,
          color: 'text-copy bg-black/5 border-black/10',
          label: action,
        };
    }
  };

  if (loading) {
    return (
      <div className="glass-panel-elevated rounded-2xl p-12 text-center text-xs font-mono text-copy flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-ink border-t-transparent animate-spin" />
        <span>Loading immutable audit ledger...</span>
      </div>
    );
  }

  if (trail.length === 0) {
    return (
      <div className="glass-panel-elevated rounded-2xl p-8 text-center text-xs font-mono text-copy flex flex-col items-center gap-2">
        <History className="w-6 h-6 text-copy/40" />
        <span>No audit events recorded yet.</span>
      </div>
    );
  }

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 border border-white/50 shadow-card-spatial flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ink text-white flex items-center justify-center shadow-sm">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            <p className="text-xs text-copy mt-0.5">
              Tamper-proof event log of all actions taken in Shiftbase.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-black/5 text-copy font-medium">
          {trail.length} Ledger Events
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-black/10">
        {trail.map((entry) => {
          const cfg = getActionConfig(entry.action);
          const Icon = cfg.icon;
          const isExpanded = expandedEntryId === entry.id;
          const dateStr = new Date(entry.timestamp).toLocaleString();

          return (
            <div key={entry.id} className="relative group">
              {/* Timeline Node Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center bg-white shadow-sm ${cfg.color}`}
              >
                <div className="w-2 h-2 rounded-full bg-current" />
              </div>

              {/* Event Card */}
              <div className="p-4 rounded-xl bg-white/60 hover:bg-white border border-black/5 transition shadow-sm flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono uppercase px-2 py-0.5 rounded-lg border ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-xs font-mono font-semibold text-ink">
                      #{entry.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-copy/70">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {entry.actor || 'user'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dateStr}
                    </span>
                  </div>
                </div>

                {/* Record Counts Snapshot (if attached) */}
                {entry.record_counts && Object.keys(entry.record_counts).length > 0 && (
                  <div className="flex items-center gap-4 text-xs font-mono pt-1 text-copy">
                    <span>
                      Source: <b>{entry.record_counts.source ?? 0}</b>
                    </span>
                    <span>
                      Target: <b className="text-emerald-700">{entry.record_counts.target ?? 0}</b>
                    </span>
                    <span>
                      Quarantined: <b className="text-ruby">{entry.record_counts.quarantined ?? 0}</b>
                    </span>
                  </div>
                )}

                {/* Expandable Details JSON */}
                {entry.details && Object.keys(entry.details).length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                      className="flex items-center gap-1 text-[11px] font-mono text-copy/60 hover:text-ink transition mt-1"
                    >
                      <span>{isExpanded ? 'Hide Payload' : 'View Payload Details'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2">
                        <JsonViewer
                          data={entry.details}
                          title={`Event #${entry.id} Context`}
                          maxHeight="max-h-48"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}