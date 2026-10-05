import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

/**
 * useAudit Hook
 * Queries the immutable audit ledger, supporting global queries and plan-scoped views.
 */
export function useAudit(planId = null) {
  const [trail, setTrail] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = planId ? `/api/audit/${planId}` : '/api/audit';
      const resp = await axios.get(url);
      setTrail(resp.data.entries || []);
      setTotal(resp.data.total || 0);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to fetch audit log';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchTrail();
  }, [fetchTrail]);

  return {
    trail,
    total,
    loading,
    error,
    refresh: fetchTrail,
  };
}