import React, { useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

/**
 * ApprovalButton Component
 * Explicit Human Approval Gate with confirmation prompt unlocking dry-runs and execution.
 */
export default function ApprovalButton({
  onApprove,
  disabled = false,
  isApproved = false,
  loading = false,
}) {
  const [showModal, setShowModal] = useState(false);
  const [reviewerName, setReviewerName] = useState('Senior Engineer');

  const handleConfirm = () => {
    onApprove(reviewerName);
    setShowModal(false);
  };

  if (isApproved) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 text-xs font-mono font-semibold">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Plan Approved by Human Reviewer</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setShowModal(true)}
        className="px-5 py-2.5 rounded-full bg-ruby hover:bg-ruby-dark text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
      >
        <Lock className="w-3.5 h-3.5" />
        <span>{loading ? 'Approving...' : 'Sign & Approve Plan'}</span>
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-panel-elevated rounded-2xl p-6 max-w-md w-full border border-white/60 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-ruby/10 text-ruby flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Human Oversight Sign-Off
                </h3>
                <p className="text-xs text-copy">
                  Explicitly unlock execution and dry-runs for this plan.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-copy uppercase mb-1">
                Reviewer Identifier
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs font-mono text-ink bg-white focus:outline-none focus:ring-1 focus:ring-ruby"
              />
            </div>

            <p className="text-xs text-copy bg-black/5 p-3 rounded-xl font-mono leading-relaxed">
              By approving, you verify that all field mappings and data transformation rules
              have been reviewed and are authorized for execution.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-copy hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 rounded-xl bg-ruby text-white text-xs font-semibold hover:bg-ruby-dark transition shadow-sm"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}