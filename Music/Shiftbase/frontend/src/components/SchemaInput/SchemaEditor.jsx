import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Code2, Sparkles } from 'lucide-react';

/**
 * SchemaEditor Component
 * Interactive JSON blueprint editor with live syntax validation and pre-built template loading.
 */
export default function SchemaEditor({
  title = "Schema Blueprint",
  schemaJson = "",
  onChange,
  onLoadTemplate,
  badgeText = "V1",
}) {
  const [error, setError] = useState(null);

  const handleTextChange = (e) => {
    const val = e.target.value;
    onChange(val);

    try {
      if (val.trim()) {
        JSON.parse(val);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="glass-panel-elevated rounded-2xl p-5 border border-white/50 shadow-card-spatial flex flex-col gap-3">
      {/* Header with Title and Template Trigger */}
      <div className="flex items-center justify-between pb-2 border-b border-black/5">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-ruby" />
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 text-copy uppercase font-medium">
            {badgeText}
          </span>
        </div>

        {onLoadTemplate && (
          <button
            type="button"
            onClick={onLoadTemplate}
            className="flex items-center gap-1.5 text-xs font-medium text-ruby hover:text-ruby-dark transition px-2 py-1 rounded-lg hover:bg-ruby/5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Example</span>
          </button>
        )}
      </div>

      {/* JSON Editor Textarea */}
      <div className="relative">
        <textarea
          value={schemaJson}
          onChange={handleTextChange}
          placeholder='{"name": "table_name", "fields": [{"name": "id", "type": "integer"}]}'
          rows={12}
          className="w-full font-mono text-xs p-3.5 rounded-xl glass-panel-dark text-emerald-400 focus:outline-none focus:ring-1 focus:ring-ruby border border-white/10 resize-none code-stream"
          spellCheck="false"
        />
      </div>

      {/* Syntax Status Bar */}
      <div className="flex items-center justify-between text-xs font-mono">
        {error ? (
          <div className="flex items-center gap-1.5 text-rose-600">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] truncate max-w-xs">{error}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Valid JSON Structure</span>
          </div>
        )}

        <span className="text-[10px] text-copy/60">
          {schemaJson.length} characters
        </span>
      </div>
    </div>
  );
}