import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Database, AlertCircle } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import SchemaEditor from '../components/SchemaInput/SchemaEditor';
import SampleDataUploader from '../components/SchemaInput/SampleDataUploader';
import TransformationRuleSelector from '../components/SchemaInput/TransformationRuleSelector';
import { useMigration } from '../hooks/useMigration';

// Default initial schemas and sample records
const DEFAULT_SOURCE_SCHEMA = {
  name: "users_v1",
  fields: [
    { name: "user_id", type: "integer", nullable: false, primary_key: true },
    { name: "full_name", type: "string", nullable: false },
    { name: "signup_date", type: "string", nullable: true, format: "MM/DD/YYYY" },
    { name: "email", type: "string", nullable: false },
    { name: "phone", type: "string", nullable: true },
    { name: "account_status", type: "string", nullable: false, default: "active" },
    { name: "login_count", type: "string", nullable: true },
    { name: "bio", type: "string", nullable: true, max_length: 1000 },
  ]
};

const DEFAULT_TARGET_SCHEMA = {
  name: "users_v2",
  fields: [
    { name: "id", type: "integer", nullable: false, primary_key: true },
    { name: "first_name", type: "string", nullable: false },
    { name: "last_name", type: "string", nullable: false },
    { name: "email_address", type: "string", nullable: false },
    { name: "created_at", type: "string", nullable: false, format: "ISO8601" },
    { name: "status", type: "string", nullable: false, allowed_values: ["active", "inactive", "suspended"] },
    { name: "total_logins", type: "integer", nullable: false, default: 0 },
    { name: "profile_summary", type: "string", nullable: true, max_length: 200 },
  ]
};

const DEFAULT_SAMPLE_RECORDS = [
  { user_id: 1, full_name: "Jane Doe", signup_date: "03/15/2023", email: "jane@company.com", phone: "555-0101", account_status: "active", login_count: "142", bio: "Senior engineer." },
  { user_id: 2, full_name: "Carlos Rivera", signup_date: "07/22/2022", email: "c.rivera@company.com", phone: "555-0102", account_status: "active", login_count: "89", bio: "Product lead." },
  { user_id: 3, full_name: "Cher", signup_date: "09/01/2020", email: "cher@company.com", phone: null, account_status: "active", login_count: "1024", bio: "Single-name edge case." },
  { user_id: 4, full_name: "David Kim", signup_date: null, email: "dkim@company.com", phone: "555-0108", account_status: "active", login_count: "12", bio: "Null signup_date edge case." },
  { user_id: 5, full_name: "Sarah Johnson", signup_date: "13/45/2023", email: "sjohnson@company.com", phone: "555-0109", account_status: "active", login_count: "bad_int", bio: "Corrupt values." },
];

export default function SetupPage() {
  const navigate = useNavigate();
  const { initWorkspace, loading, error } = useMigration();

  const [sourceJson, setSourceJson] = useState(JSON.stringify(DEFAULT_SOURCE_SCHEMA, null, 2));
  const [targetJson, setTargetJson] = useState(JSON.stringify(DEFAULT_TARGET_SCHEMA, null, 2));
  const [samplesJson, setSamplesJson] = useState(JSON.stringify(DEFAULT_SAMPLE_RECORDS, null, 2));
  const [selectedRules, setSelectedRules] = useState([
    "direct_copy",
    "split_string",
    "concat_fields",
    "format_date",
    "uppercase",
    "lowercase",
    "trim",
    "to_integer",
    "to_float",
    "to_string",
    "default_value",
    "truncate",
  ]);

  const handleToggleRule = (ruleId) => {
    setSelectedRules((prev) =>
      prev.includes(ruleId) ? prev.filter((r) => r !== ruleId) : [...prev, ruleId]
    );
  };

  const handleInitialize = async () => {
    try {
      const srcObj = JSON.parse(sourceJson);
      const tgtObj = JSON.parse(targetJson);
      const samplesObj = JSON.parse(samplesJson);

      const res = await initWorkspace({
        sourceSchema: srcObj,
        targetSchema: tgtObj,
        sampleRecords: Array.isArray(samplesObj) ? samplesObj : [samplesObj],
        supportedRules: selectedRules,
      });

      if (res && res.plan_id) {
        navigate(`/plan/${res.plan_id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to initialize"; alert("Error: " + msg);
    }
  };

  return (
    <PageContainer
      title="Schema Migration Setup"
      subtitle="Define source and target blueprints, stage sample records, and authorize transformation rules."
      action={
        <button
          type="button"
          onClick={handleInitialize}
          disabled={loading}
          className="px-5 py-2.5 rounded-full bg-ink hover:bg-black text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
        >
          <span>{loading ? "Initializing..." : "Initialize Workspace"}</span>
          <ArrowRight className="w-4 h-4 text-ruby-light" />
        </button>
      }
    >
      <div className="flex flex-col gap-6 pb-12">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Top: 2 Schema Editors Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SchemaEditor
            title="Source Schema (Legacy)"
            badgeText="Source V1"
            schemaJson={sourceJson}
            onChange={setSourceJson}
            onLoadTemplate={() => setSourceJson(JSON.stringify(DEFAULT_SOURCE_SCHEMA, null, 2))}
          />

          <SchemaEditor
            title="Target Schema (Modernized)"
            badgeText="Target V2"
            schemaJson={targetJson}
            onChange={setTargetJson}
            onLoadTemplate={() => setTargetJson(JSON.stringify(DEFAULT_TARGET_SCHEMA, null, 2))}
          />
        </div>

        {/* Middle: Sample Data Uploader */}
        <SampleDataUploader
          dataJson={samplesJson}
          onChange={setSamplesJson}
          recordCount={5}
          onLoadExample={() => setSamplesJson(JSON.stringify(DEFAULT_SAMPLE_RECORDS, null, 2))}
        />

        {/* Bottom: Bounded Transformation Rule Selector */}
        <TransformationRuleSelector
          selectedRules={selectedRules}
          onToggleRule={handleToggleRule}
        />
      </div>
    </PageContainer>
  );
}