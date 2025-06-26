
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';
import { supabase } from '@/integrations/supabase/client';
import type { AuditAction } from '@/types/database';

export const useAuditLog = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();

  const createAuditLog = async (
    action: AuditAction,
    reportId?: string,
    details?: Record<string, any>
  ) => {
    if (!user || !organization) return;

    try {
      await supabase.rpc('create_audit_log', {
        p_organization_id: organization.id,
        p_user_id: user.id,
        p_report_id: reportId || null,
        p_action: action,
        p_details: details || {},
        p_ip_address: null,
        p_user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  };

  return { createAuditLog };
};
