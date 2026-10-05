import React from 'react';
import { useParams } from 'react-router-dom';
import { History, RefreshCw } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import AuditTrail from '../components/Audit/AuditTrail';
import { useAudit } from '../hooks/useAudit';

/**
 * AuditPage Component
 * Displays the complete, immutable governance ledger across all migrations
 * or scoped to a specific plan.
 */
export default function AuditPage() {
  const { planId } = useParams();
  const { trail, loading, refresh } = useAudit(planId);

  return (
    <PageContainer
      title="Immutable Audit Ledger"
      subtitle={
        planId
          ? `Filtered trail for Plan ID: ${planId}`
          : "System-wide chronological action and review ledger."
      }
      action={
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="px-4 py-2 rounded-full border border-black/10 bg-white/70 hover:bg-white text-ink text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      }
    >
      <div className="flex flex-col gap-6 pb-12">
        <AuditTrail
          trail={trail}
          loading={loading}
          title={planId ? `Plan #${planId} Governance History` : "Global Audit Log"}
        />
      </div>
    </PageContainer>
  );
}