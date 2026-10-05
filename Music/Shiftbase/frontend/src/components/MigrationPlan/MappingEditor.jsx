import React from 'react';
import { Edit3, Save, Plus, Trash2 } from 'lucide-react';

/**
 * MappingEditor Component
 * Allows developers to edit, add, or override field mappings before human approval.
 */
export default function MappingEditor({
  mappings = [],
  onChange,
  onSave,
  saving = false,
}) {
  const ALL_TRANSFORMATIONS = [
    'direct_copy',
    'split_string',
    'concat_fields',
    'format_date',
    'uppercase',
    'lowercase',
    'trim',
    'to_integer',
    'to_float',
    'to_string',
    'default_value',
    'truncate',
  ];

  const updateMapping = (index, field, value) => {
    const updated = [...mappings];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeMapping = (index) => {
    const updated = mappings.filter((_, i) => i !== index);
    onChange(updated);
  };

  const addMapping = () => {
    onChange([
      ...mappings,
      {
        target_field: '',
        source_field: '',
        transformation: 'direct_copy',
        transformation_params: {},
        confidence: 1.0,
      },
    ]);
  };

  return (
    <div className="glass-panel-elevated rounded-2xl p-5 border border-white/50 shadow-card-spatial flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-black/5">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-ink" />
          <h2 className="text-sm font-semibold text-ink">Mapping Editor (Human Override)</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addMapping}
            className="flex items-center gap-1 text-xs font-medium text-copy hover:text-ink px-2.5 py-1.5 rounded-lg border border-black/10 bg-white/60 hover:bg-white transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Field</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1 text-xs font-medium text-white px-3 py-1.5 rounded-lg bg-ink hover:bg-black transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>
        </div>
      </div>

      {/* Editable Field Rows */}
      <div className="space-y-3">
        {mappings.map((m, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-white/50 border border-black/5 flex flex-wrap items-center gap-3 text-xs"
          >
            {/* Target Field Input */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-mono text-copy uppercase mb-1">
                Target Field
              </label>
              <input
                type="text"
                value={m.target_field}
                onChange={(e) => updateMapping(idx, 'target_field', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 font-mono text-xs text-ink bg-white focus:outline-none focus:ring-1 focus:ring-ink"
                placeholder="e.g. first_name"
              />
            </div>

            {/* Transformation Rule Select */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-mono text-copy uppercase mb-1">
                Transformation
              </label>
              <select
                value={m.transformation}
                onChange={(e) => updateMapping(idx, 'transformation', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 font-mono text-xs text-ink bg-white focus:outline-none focus:ring-1 focus:ring-ink"
              >
                {ALL_TRANSFORMATIONS.map((rule) => (
                  <option key={rule} value={rule}>
                    {rule}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Field Input */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-mono text-copy uppercase mb-1">
                Source Field
              </label>
              <input
                type="text"
                value={m.source_field || ''}
                onChange={(e) => updateMapping(idx, 'source_field', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 font-mono text-xs text-ink bg-white focus:outline-none focus:ring-1 focus:ring-ink"
                placeholder="e.g. full_name"
              />
            </div>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => removeMapping(idx)}
              className="p-1.5 text-copy hover:text-rose-600 transition mt-4"
              title="Remove Mapping"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}