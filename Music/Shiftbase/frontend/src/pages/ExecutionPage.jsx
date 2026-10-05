import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  AlertOctagon,
  Database,
  History,
  CheckCircle2,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import DryRunResults from '../components/Execution/DryRunResults';
import ExecutionProgress from '../components/Execution/ExecutionProgress';
import ExecutionSummary from '../components/Execution/ExecutionSummary';
import RollbackButton from '../components/Execution/RollbackButton';
import QuarantineViewer from '../components/Quarantine/QuarantineViewer';
import StatusBadge from '../components/common/StatusBadge';
import { useMigration } from '../hooks/useMigration';

/**
 * ExecutionPage Component
 * Manages deterministic simulations, live migrations, rollback safety,
 * and quarantine holding inspection.
 */
export default function ExecutionPage() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const {
    fetchPlan,
    runDryRun,
    executeLive,
    rollback,
    fetchQuarantine,
    currentPlan,
    dryRunResult,
    executionResult,
    quarantineRecords,
    loading,
    error,
  } = useMigration();

  const [activeTab, setActiveTab] = useState('dry_run'); // 'dry_run' | 'live' | 'quarantine'
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (planId) {
      fetchPlan(planId);
      fetchQuarantine(planId);
    }
  }, [planId, fetchPlan, fetchQuarantine]);

  const handleDryRun = async () => {
    setRunning(true);
    try {
      await runDryRun(planId);
      setActiveTab('dry_run');
    } finally {
      setRunning(false);
    }
  };

  const handleLiveExecute = async () => {
    setRunning(true);
    try {
      await executeLive(planId, 'lead_developer');
      await fetchQuarantine(planId);
      await fetchPlan(planId);
      setActiveTab('live');
    } finally {
      setRunning(false);
    }
  };

  const handleRollback = async () => {
    setRunning(true);
    try {
      await rollback(planId);
      await fetchQuarantine(planId);
      await fetchPlan(planId);
    } finally {
      setRunning(false);
    }
  };

  const isApproved = currentPlan?.status === 'approved' || currentPlan?.status === 'executed';

  return (
    <PageContainer
      title="Deterministic Execution Pipeline"
      subtitle={`Workspace ID: ${planId} • Plan Status: ${currentPlan?.status || 'approved'}`}
      action={
        <div className="flex items-center gap-3">
          {/* Dry Run Simulation Button */}
          <button
            type="button"
            onClick={handleDryRun}
            disabled={running || loading}
            className="px-4 py-2 rounded-full border border-black/10 bg-white/70 hover:bg-white text-ink text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <PlayCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulate Dry Run</span>
          </button>

          {/* Live Execution Button */}
          <button
            type="button"
            onClick={handleLiveExecute}
            disabled={running || loading || !isApproved || currentPlan?.status === 'executed'}
            className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Execute Live</span>
          </button>

          {/* Rollback Button */}
          {currentPlan?.status === 'executed' && (
            <RollbackButton onRollback={handleRollback} disabled={running || loading} />
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-6 pb-12">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-black/5 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('dry_run')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'dry_run'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-copy hover:bg-white/60'
              }`}
            >
              Simulation Results
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'live'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-copy hover:bg-white/60'
              }`}
            >
              Execution Summary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quarantine')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                activeTab === 'quarantine'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-copy hover:bg-white/60'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-ruby" />
              <span>Quarantine Store ({quarantineRecords.length})</span>
            </button>
          </div>

          <StatusBadge status={currentPlan?.status || 'proposed'} />
        </div>

        {/* Running Progress Gauge */}
        {running && <ExecutionProgress status="running" processed={8} total={15} />}

        {/* Tab Views */}
        {!running && activeTab === 'dry_run' && (
          <DryRunResults result={dryRunResult} />
        )}

        {!running && activeTab === 'live' && (
          <ExecutionSummary
            result={
              executionResult ||
              (currentPlan?.status === 'executed'
                ? {
                    status: 'completed',
                    counts: { source: 15, target: 12, quarantined: 3 },
                    message: 'Migration records committed to mock_target store.',
                  }
                : null)
            }
            onRollback={handleRollback}
          />
        )}

        {!running && activeTab === 'quarantine' && (
          <QuarantineViewer records={quarantineRecords} planId={planId} />
        )}
      </div>
    </PageContainer>
  );
}