import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, PlayCircle, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import PlanProposal from '../components/MigrationPlan/PlanProposal';
import WarningsPanel from '../components/MigrationPlan/WarningsPanel';
import MappingEditor from '../components/MigrationPlan/MappingEditor';
import ApprovalButton from '../components/MigrationPlan/ApprovalButton';
import StatusBadge from '../components/common/StatusBadge';
import { useMigration } from '../hooks/useMigration';

/**
 * PlanReviewPage Component
 * Orchestrates AI Mapping proposals, human overrides, and explicit approval gating.
 */
export default function PlanReviewPage() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const {
    fetchPlan,
    requestProposal,
    updateMappings,
    approvePlan,
    currentPlan,
    proposal,
    loading,
    error,
  } = useMigration();

  const [activeTab, setActiveTab] = useState('proposal'); // 'proposal' | 'editor'
  const [editableMappings, setEditableMappings] = useState([]);
  const [savingDraft, setSavingDraft] = useState(false);

  useEffect(() => {
    if (planId) {
      fetchPlan(planId).then((plan) => {
        if (plan && plan.field_mappings && plan.field_mappings.length > 0) {
          setEditableMappings(plan.field_mappings);
        } else {
          // Trigger AI proposal automatically if mappings are empty
          requestProposal(planId).then((prop) => {
            if (prop && prop.mappings) {
              setEditableMappings(prop.mappings);
            }
          });
        }
      });
    }
  }, [planId, fetchPlan, requestProposal]);

  const handleGenerateProposal = async () => {
    const prop = await requestProposal(planId);
    if (prop && prop.mappings) {
      setEditableMappings(prop.mappings);
      await fetchPlan(planId);
    }
  };

  const handleSaveMappings = async () => {
    setSavingDraft(true);
    try {
      await updateMappings(planId, editableMappings);
      await fetchPlan(planId);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleApprove = async (reviewerName) => {
    await approvePlan(planId, reviewerName);
    await fetchPlan(planId);
  };

  const isApproved = currentPlan?.status === 'approved' || currentPlan?.status === 'executed';

  return (
    <PageContainer
      title="Migration Plan Review"
      subtitle={`Workspace ID: ${planId} • Version ${currentPlan?.version || 1}`}
      action={
        <div className="flex items-center gap-3">
          {/* AI Trigger */}
          <button
            type="button"
            onClick={handleGenerateProposal}
            disabled={loading}
            className="px-4 py-2 rounded-full border border-amethyst/30 bg-amethyst/10 text-amethyst-dark hover:bg-amethyst/20 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'AI Reasoning...' : 'Re-Propose Mappings'}</span>
          </button>

          {/* Approval Button */}
          <ApprovalButton
            isApproved={isApproved}
            onApprove={handleApprove}
            disabled={loading}
          />

          {/* Proceed to Execution Button (Unlocked upon approval) */}
          {isApproved && (
            <button
              type="button"
              onClick={() => navigate(`/execution/${planId}`)}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <span>Simulate & Execute</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-6 pb-12">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Switcher: AI Proposal vs Interactive Editor */}
        <div className="flex items-center justify-between border-b border-black/5 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('proposal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'proposal'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-copy hover:bg-white/60'
              }`}
            >
              AI Proposal View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'editor'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-copy hover:bg-white/60'
              }`}
            >
              Interactive Mapping Editor
            </button>
          </div>

          <StatusBadge status={currentPlan?.status || 'proposed'} />
        </div>

        {/* Warnings & Risk Panel */}
        <WarningsPanel
          warnings={proposal?.warnings || currentPlan?.ai_warnings || []}
          unmappedSources={proposal?.unmapped_source_fields || []}
          unmappedTargets={proposal?.unmapped_target_fields || []}
        />

        {/* Active Tab Content */}
        {activeTab === 'proposal' ? (
          <PlanProposal
            proposal={
              proposal || {
                mappings: currentPlan?.field_mappings || [],
                warnings: currentPlan?.ai_warnings || [],
                overall_risk: 'medium',
              }
            }
            planStatus={currentPlan?.status || 'proposed'}
            version={currentPlan?.version || 1}
          />
        ) : (
          <MappingEditor
            mappings={editableMappings}
            onChange={setEditableMappings}
            onSave={handleSaveMappings}
            saving={savingDraft}
          />
        )}
      </div>
    </PageContainer>
  );
}