import React, { useState } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

/**
 * RollbackButton Component
 * Reversible execution controller with double-confirmation dialog to undo migrations.
 */
export default function RollbackButton({
  onRollback,
  disabled = false,
  loading = false,
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    onRollback();
    setShowConfirm(false);
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-800 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
      >
        <RotateCcw className="w-3.5 h-3.5 text-rose-700" />
        <span>{loading ? 'Rolling Back...' : 'Rollback Migration'}</span>
      </button>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-panel-elevated rounded-2xl p-6 max-w-md w-full border border-white/60 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Rollback Live Migration?
                </h3>
                <p className="text-xs text-copy">
                  This will purge all rows written to mock_target and quarantine.
                </p>
              </div>
            </div>

            <p className="text-xs text-copy bg-black/5 p-3 rounded-xl font-mono leading-relaxed">
              Are you sure? This action is recorded in the immutable audit log. You can re-run
              dry-runs or retry the migration afterwards.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-copy hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-sm"
              >
                Confirm Rollback
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}