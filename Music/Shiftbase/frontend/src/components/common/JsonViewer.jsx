import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * JsonViewer Component
 * Frosted dark glass container for formatted JSON streams with syntax highlighting and copy-to-clipboard.
 */
export default function JsonViewer({
  data,
  title,
  maxHeight = "max-h-72",
  className = "",
}) {
  const [copied, setCopied] = useState(false);
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`glass-panel-dark rounded-xl border border-white/10 overflow-hidden flex flex-col ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/10 bg-black/20 text-xs font-mono">
        <span className="text-white/70">{title || 'Data Stream'}</span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Stream Container */}
      <pre className={`p-3.5 overflow-x-auto overflow-y-auto text-emerald-400/90 code-stream text-[11.5px] ${maxHeight}`}>
        <code>{jsonString}</code>
      </pre>
    </div>
  );
}