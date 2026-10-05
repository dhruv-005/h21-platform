import React from 'react';
import { Sliders, ShieldCheck } from 'lucide-react';

/**
 * TransformationRuleSelector Component
 * Toggleable checkboxes enforcing the bounded set of deterministic transformations
 * the AI agent is allowed to use.
 */
export default function TransformationRuleSelector({
  selectedRules = [],
  onToggleRule,
}) {
  const ALL_RULES = [
    { id: "direct_copy", label: "Direct Copy", desc: "Copy source value as-is" },
    { id: "split_string", label: "Split String", desc: "Split by delimiter at index N" },
    { id: "concat_fields", label: "Concat Fields", desc: "Combine multiple fields with delimiter" },
    { id: "format_date", label: "Format Date", desc: "Convert date formats & ISO8601" },
    { id: "uppercase", label: "Uppercase", desc: "Change text to uppercase" },
    { id: "lowercase", label: "Lowercase", desc: "Change text to lowercase" },
    { id: "trim", label: "Trim Whitespace", desc: "Strip leading/trailing spaces" },
    { id: "to_integer", label: "To Integer", desc: "Parse integer casting" },
    { id: "to_float", label: "To Float", desc: "Parse floating point number" },
    { id: "to_string", label: "To String", desc: "Cast any type to string" },
    { id: "default_value", label: "Default Fallback", desc: "Supply default if null" },
    { id: "truncate", label: "Truncate Length", desc: "Clip string to max characters" },
  ];

  return (
    <div className="glass-panel-elevated rounded-2xl p-5 border border-white/50 shadow-card-spatial flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-black/5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-terracotta" />
          <h2 className="text-sm font-semibold text-ink">Authorized Transformations</h2>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Strict Execution Sandbox</span>
        </div>
      </div>

      {/* Grid of Rule Checkboxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {ALL_RULES.map((rule) => {
          const isSelected = selectedRules.includes(rule.id);
          return (
            <button
              key={rule.id}
              type="button"
              onClick={() => onToggleRule(rule.id)}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-white border-terracotta/40 shadow-sm'
                  : 'bg-white/40 border-black/5 opacity-60 hover:opacity-90'
              }`}
            >
              <div
                className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border text-[10px] ${
                  isSelected
                    ? 'bg-terracotta text-white border-terracotta'
                    : 'border-black/20 bg-white'
                }`}
              >
                {isSelected && '✓'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-ink leading-tight">
                  {rule.label}
                </span>
                <span className="text-[10px] text-copy font-mono leading-normal mt-0.5">
                  {rule.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}