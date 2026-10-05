import React, { useState } from 'react';
import { AlertOctagon, Search, Eye, Filter, ShieldAlert, ArrowDownRight } from 'lucide-react';
import JsonViewer from '../common/JsonViewer';
import LedDotText from '../theme/LedDotText';

/**
 * QuarantineViewer Component
 * Interactive inspection table for records that failed transformations or schema constraints.
 * Allows drilling down into raw source data and field-level error breakdowns.
 */
export default function QuarantineViewer({
  records = [],
  loading = false,
  planId,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filter records based on search term
  const filteredRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase();
    const sourceStr = JSON.stringify(r.source_data || {}).toLowerCase();
    const errorsStr = JSON.stringify(r.error_details || []).toLowerCase();
    return sourceStr.includes(term) || errorsStr.includes(term);
  });

  if (loading) {
    return (
      <div className="glass-panel-elevated rounded-2xl p-12 text-center text-xs font-mono text-copy flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-ruby border-t-transparent animate-spin" />
        <span>Loading quarantined records from holding store...</span>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="glass-panel-elevated rounded-2xl p-8 text-center text-xs font-mono text-emerald-800 bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-center gap-2">
        <ShieldAlert className="w-6 h-6 text-emerald-600" />
        <span className="font-semibold">Quarantine Area is Empty</span>
        <span className="text-copy/70">All records were processed cleanly without errors.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Search and Stats */}
      <div className="glass-panel-elevated rounded-2xl p-5 border border-ruby/30 bg-gradient-to-br from-ruby/5 to-transparent shadow-card-spatial flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ruby/10 text-ruby flex items-center justify-center shadow-sm">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-ink">Quarantine Holding Store</h2>
              <span className="px-2 py-0.5 rounded-full bg-ruby text-white text-[10px] font-mono font-bold">
                {records.length} Isolated
              </span>
            </div>
            <p className="text-xs text-copy mt-0.5">
              Corrupted, mistyped, or non-compliant records prevented from polluting the target.
            </p>
          </div>
        </div>

        {/* Search Filter */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-copy/50 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search errors or values..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/10 text-xs font-mono text-ink bg-white/80 focus:outline-none focus:ring-1 focus:ring-ruby"
          />
        </div>
      </div>

      {/* Main Table + Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Records List */}
        <div className="lg:col-span-7 glass-panel-elevated rounded-2xl p-4 border border-white/50 shadow-card-spatial flex flex-col gap-2">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-black/5 text-[11px] font-mono text-copy uppercase tracking-wider">
            <span>Quarantined Item</span>
            <span>Error Cause</span>
            <span>Action</span>
          </div>

          <div className="divide-y divide-black/5 max-h-[500px] overflow-y-auto pr-1">
            {filteredRecords.map((item, idx) => {
              const errorCount = (item.error_details || []).length;
              const isSelected = selectedRecord?.id === item.id;
              const firstError = item.error_details?.[0]?.error || "Constraint violation";

              return (
                <div
                  key={item.id || idx}
                  onClick={() => setSelectedRecord(item)}
                  className={`p-3 rounded-xl flex items-center justify-between gap-3 text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-ruby/10 border border-ruby/30'
                      : 'hover:bg-white/60'
                  }`}
                >
                  <div className="flex flex-col min-w-[120px]">
                    <span className="font-mono font-semibold text-ink">
                      Record #{item.source_record_id || idx + 1}
                    </span>
                    <span className="text-[10px] text-copy/60 font-mono">
                      {item.quarantined_at ? new Date(item.quarantined_at).toLocaleTimeString() : 'Recent'}
                    </span>
                  </div>

                  <div className="flex-1 truncate pr-2">
                    <span className="text-ruby-dark font-mono text-[11px] truncate block">
                      {firstError}
                    </span>
                    {errorCount > 1 && (
                      <span className="text-[9px] text-ruby font-semibold">
                        +{errorCount - 1} more errors
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-copy hover:text-ink hover:bg-white transition"
                    title="Inspect Details"
                  >
                    <ArrowDownRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Error Inspector */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedRecord ? (
            <div className="glass-panel-elevated rounded-2xl p-5 border border-white/50 shadow-card-spatial flex flex-col gap-4 sticky top-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-ruby" />
                  <h3 className="text-sm font-semibold text-ink">
                    Record #{selectedRecord.source_record_id || selectedRecord.id} Details
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-ruby/10 text-ruby font-bold">
                  {selectedRecord.error_details?.length || 0} Errors
                </span>
              </div>

              {/* Error Reasons */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-copy tracking-wider">
                  Failure Diagnostics
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedRecord.error_details?.map((err, eIdx) => (
                    <div
                      key={eIdx}
                      className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-900"
                    >
                      <div className="font-semibold text-rose-700">
                        [{err.field || err.source_field || 'field'}]:
                      </div>
                      <div className="text-[11px] mt-0.5">{err.error}</div>
                      {err.source_value !== undefined && (
                        <div className="text-[10px] text-copy/70 mt-1">
                          Offending Value: "{String(err.source_value)}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Source Data Payload */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-copy tracking-wider">
                  Raw Source JSON
                </span>
                <JsonViewer data={selectedRecord.source_data} maxHeight="max-h-48" />
              </div>
            </div>
          ) : (
            <div className="glass-panel-elevated rounded-2xl p-8 text-center text-xs font-mono text-copy/60 flex flex-col items-center justify-center gap-2 h-full min-h-[250px]">
              <Filter className="w-6 h-6 text-copy/40" />
              <span>Select a quarantined record from the list to inspect failure diagnostics.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}