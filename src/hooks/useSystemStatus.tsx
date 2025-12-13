import { useState, useEffect } from 'react';

interface StatusResponse {
  page_title: string;
  page_url: string;
  ongoing_incidents: Array<{
    id: string;
    name: string;
    status: string;
    current_worst_impact: 'partial_outage' | 'degraded_performance' | 'full_outage';
  }>;
  in_progress_maintenances: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  scheduled_maintenances: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

export const useSystemStatus = () => {
  const [status, setStatus] = useState<'operational' | 'degraded' | 'outage'>('operational');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporary: disable remote status fetch to avoid CSP errors until
    // production headers have been fully updated and a JSON endpoint is available.
    // We default to 'operational' and stop here to ensure zero console errors.
    setLoading(false);
    return;
  }, []);

  return { status, loading };
};