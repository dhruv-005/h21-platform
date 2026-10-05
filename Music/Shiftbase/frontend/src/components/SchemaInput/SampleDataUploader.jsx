import React, { useState } from 'react';
import { Upload, Database, FileSpreadsheet, Sparkles } from 'lucide-react';

/**
 * SampleDataUploader Component
 * Accepts pasted JSON or CSV sample source records for testing transformations and quarantine isolation.
 */
export default function SampleDataUploader({
  dataJson = "",
  onChange,
  onLoadExample,
  recordCount = 0,
}) {
  const [activeTab, setActiveTab] = useState('json');

  return (
    <div className="glass-panel-elevated rounded-2xl p-5 border border-white/50 shadow-card-spatial flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-black/5">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-amethyst" />
          <h2 className="text-sm font-semibold text-ink">Sample Source Records</h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amethyst/10 text-amethyst-dark font-medium">
            {recordCount} Records
          </span>
        </div>

        {onLoadExample && (
          <button
            type="button"
            onClick={onLoadExample}
            className="flex items-center gap-1.5 text-xs font-medium text-amethyst-dark hover:text-ink transition px-2 py-1 rounded-lg hover:bg-amethyst/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load 15 Test Records</span>
          </button>
        )}
      </div>

      {/* Input Area */}
      <div className="relative">
        <textarea
          value={dataJson}
          onChange={(e) => onChange(e.target.value)}
          placeholder='[{"user_id": 1, "full_name": "Jane Doe", "signup_date": "03/15/2023"}]'
          rows={8}
          className="w-full font-mono text-xs p-3.5 rounded-xl glass-panel-dark text-white/90 focus:outline-none focus:ring-1 focus:ring-amethyst border border-white/10 resize-none code-stream"
          spellCheck="false"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-copy font-mono">
        <span>Accepts JSON Array of objects matching source schema</span>
        <span>Includes edge cases (multi-word names, nulls, corrupt values)</span>
      </div>
    </div>
  );
}