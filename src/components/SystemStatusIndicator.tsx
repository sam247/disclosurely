import { useSystemStatus } from '@/hooks/useSystemStatus';
import { Circle } from 'lucide-react';

export const SystemStatusIndicator = () => {
  const { status, loading } = useSystemStatus();

  const getStatusColor = () => {
    if (loading) return 'text-gray-400';
    switch (status) {
      case 'operational': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'outage': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    if (loading) return 'Checking...';
    switch (status) {
      case 'operational': return 'All Systems Operational';
      case 'degraded': return 'Degraded Performance';
      case 'outage': return 'Service Outage';
      default: return 'Status Unknown';
    }
  };

  return (
    <a 
      href="https://status.disclosurely.com" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-white flex items-center space-x-2 group"
      title={getStatusText()}
    >
      <span>System Status</span>
      <Circle 
        className={`h-2 w-2 ${getStatusColor()} ${loading ? 'animate-pulse' : ''}`}
        fill="currentColor"
      />
    </a>
  );
};