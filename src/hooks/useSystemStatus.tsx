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
    const fetchStatus = async () => {
      try {
        const response = await fetch('https://status.disclosurely.com/api/status');
        const data: StatusResponse = await response.json();
        
        // Check for any ongoing incidents
        if (data.ongoing_incidents && data.ongoing_incidents.length > 0) {
          let worstImpact: 'partial_outage' | 'degraded_performance' | 'full_outage' = 'degraded_performance';
          
          for (const incident of data.ongoing_incidents) {
            if (incident.current_worst_impact === 'full_outage') {
              worstImpact = 'full_outage';
              break; // Can't get worse than this
            }
            if (incident.current_worst_impact === 'partial_outage') {
              worstImpact = 'partial_outage';
            }
          }
          
          setStatus(worstImpact === 'full_outage' ? 'outage' : 'degraded');
        }
        // Check for maintenance
        else if (data.in_progress_maintenances && data.in_progress_maintenances.length > 0) {
          setStatus('degraded');
        }
        // All good
        else {
          setStatus('operational');
        }
      } catch (error) {
        console.error('Failed to fetch system status:', error);
        // Default to operational if we can't fetch status
        setStatus('operational');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Check status every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { status, loading };
};