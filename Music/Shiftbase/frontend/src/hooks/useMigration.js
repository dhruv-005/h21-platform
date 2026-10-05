import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * useMigration Hook
 * Manages the end-to-end migration lifecycle: workspace initialization,
 * AI proposal requests, human editing, plan approvals, dry-runs, live executions,
 * rollbacks, and quarantine inspection.
 */
export function useMigration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPlan, setCurrentPlan] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [dryRunResult, setDryRunResult] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [quarantineRecords, setQuarantineRecords] = useState([]);
  const [targetRecords, setTargetRecords] = useState([]);
  const [verification, setVerification] = useState(null);

  const clearError = () => setError(null);

  // 1. Initialize Migration Workspace
  const initWorkspace = useCallback(async ({ sourceSchema, targetSchema, sampleRecords, supportedRules }) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post('/api/schemas/init', {
        source_schema: sourceSchema,
        target_schema: targetSchema,
        sample_records: sampleRecords || [],
        supported_rules: supportedRules || null,
      });
      return resp.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to initialize workspace';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Existing Plan
  const fetchPlan = useCallback(async (planId) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`/api/plans/${planId}`);
      setCurrentPlan(resp.data);
      return resp.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to fetch plan';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Request AI Mapping Proposal
  const requestProposal = useCallback(async (planId) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`/api/plans/${planId}/propose`);
      setProposal(resp.data);
      return resp.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to generate proposal';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. Update Field Mappings (Draft or New Version)
  const updateMappings = useCallback(async (planId, fieldMappings) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.put(`/api/plans/${planId}`, {
        field_mappings: fieldMappings,
      });
      setCurrentPlan(resp.data);
      return resp.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to update mappings';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 5. Approve Migration Plan (Human Gate)
  const approvePlan = useCallback(async (planId, approvedBy = 'user', notes = null) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`/api/plans/${planId}/approve`, {
        approved_by: approvedBy,
        notes: notes,
      });
      if (currentPlan) {
        setCurrentPlan((prev) => ({ ...prev, status: 'approved', approved_by: approvedBy }));
      }
      return resp.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to approve plan';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentPlan]);

  // 6. Run Deterministic Dry-Run Simulation
  const runDryRun = useCallback(async (planId) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`/api/migration/${planId}/dry-run`);
      setDryRunResult(resp.data);
      return resp.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Dry run simulation failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 7. Live Migration Execution
  const executeLive = useCallback(async (planId, actor = 'user') => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`/api/migration/${planId}/execute?actor=${encodeURIComponent(actor)}`);
      setExecutionResult(resp.data);
      if (currentPlan) {
        setCurrentPlan((prev) => ({ ...prev, status: 'executed' }));
      }
      return resp.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Live migration failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentPlan]);

  // 8. Rollback Migration
  const rollback = useCallback(async (planId, executionId = null, actor = 'user') => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`/api/migration/${planId}/rollback?actor=${encodeURIComponent(actor)}`, {
        execution_id: executionId,
      });
      if (currentPlan) {
        setCurrentPlan((prev) => ({ ...prev, status: 'rolled_back' }));
      }
      setExecutionResult(null);
      setTargetRecords([]);
      setQuarantineRecords([]);
      return resp.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Rollback failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentPlan]);

  // 9. Fetch Quarantined Records
  const fetchQuarantine = useCallback(async (planId) => {
    try {
      const resp = await axios.get(`/api/quarantine/${planId}`);
      setQuarantineRecords(resp.data);
      return resp.data;
    } catch (err) {
      console.error('Error fetching quarantine records:', err);
    }
  }, []);

  // 10. Fetch Migrated Target Records
  const fetchTargetRecords = useCallback(async (planId) => {
    try {
      const resp = await axios.get(`/api/migration/${planId}/target`);
      setTargetRecords(resp.data);
      return resp.data;
    } catch (err) {
      console.error('Error fetching target records:', err);
    }
  }, []);

  // 11. Verify Count Balances
  const verifyIntegrity = useCallback(async (planId) => {
    try {
      const resp = await axios.get(`/api/migration/${planId}/verify`);
      setVerification(resp.data);
      return resp.data;
    } catch (err) {
      console.error('Error verifying record balance:', err);
    }
  }, []);

  return {
    loading,
    error,
    clearError,
    currentPlan,
    proposal,
    dryRunResult,
    executionResult,
    quarantineRecords,
    targetRecords,
    verification,
    initWorkspace,
    fetchPlan,
    requestProposal,
    updateMappings,
    approvePlan,
    runDryRun,
    executeLive,
    rollback,
    fetchQuarantine,
    fetchTargetRecords,
    verifyIntegrity,
  };
}