import { useQuery } from '@tanstack/react-query';
import { checkFeatureFlag } from '@/utils/edgeFunctions';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to check if a feature is enabled for the current organization
 * 
 * @param featureName - Name of the feature flag to check
 * @param organizationId - Organization ID (optional)
 * @returns Boolean indicating if feature is enabled
 * 
 * @example
 * const { data: isEnabled, isLoading } = useFeatureFlag('ai_gateway', orgId);
 * 
 * if (isEnabled) {
 *   // Show new AI features
 * }
 */
export const useFeatureFlag = (
  featureName: string,
  organizationId?: string
) => {
  return useQuery({
    queryKey: ['feature-flag', featureName, organizationId],
    queryFn: async () => {
      return await checkFeatureFlag(featureName, organizationId);
    },
    staleTime: 60000, // Cache for 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to get all feature flags (admin only)
 */
export const useAllFeatureFlags = () => {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('feature_flags')
        .select('*')
        .order('feature_name');

      if (error) {
        throw error;
      }

      return data as Array<{
        id: string;
        feature_name: string;
        description: string;
        is_enabled: boolean;
        rollout_percentage: number;
        organization_overrides: Record<string, boolean> | null;
        created_at: string;
        updated_at: string;
      }>;
    },
    staleTime: 30000, // Cache for 30 seconds
  });
};

/**
 * Function to enable/disable a feature flag (admin only)
 * Uses RPC function to bypass RLS issues
 */
export const updateFeatureFlag = async (
  featureName: string,
  updates: {
    is_enabled?: boolean;
    rollout_percentage?: number;
  }
) => {
  // Use RPC function instead of direct update to bypass RLS
  const { data, error } = await (supabase.rpc as any)('update_feature_flag', {
    p_feature_name: featureName,
    p_is_enabled: updates.is_enabled !== undefined ? updates.is_enabled : null,
    p_rollout_percentage: updates.rollout_percentage !== undefined ? updates.rollout_percentage : null,
  });

  if (error) {
    console.error('RPC error details:', error);
    throw new Error(error.message || error.error?.message || 'Failed to update feature flag');
  }

  // RPC functions return the result directly, not wrapped in an array
  return data;
};

/**
 * Function to enable feature for specific organization
 */
export const enableFeatureForOrg = async (
  featureName: string,
  organizationId: string,
  enabled: boolean = true
) => {
  const { error } = await (supabase.rpc as any)('enable_feature_for_org', {
    p_feature_name: featureName,
    p_organization_id: organizationId,
    p_enabled: enabled
  });

  if (error) {
    throw error;
  }
};

