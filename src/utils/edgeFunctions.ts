import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a feature flag is enabled via Edge Function (handles CORS properly)
 */
export async function checkFeatureFlag(
  featureName: string,
  organizationId?: string | null
): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('check-feature-flag', {
      body: {
        feature_name: featureName,
        organization_id: organizationId || null,
      },
    });

    if (error) {
      console.error('[checkFeatureFlag] Error:', error);
      return false; // Default to disabled on error
    }

    return data?.enabled === true;
  } catch (error) {
    console.error('[checkFeatureFlag] Unexpected error:', error);
    return false; // Default to disabled on error
  }
}

/**
 * Check if an account is locked via Edge Function (handles CORS properly)
 */
export async function checkAccountLocked(
  email: string,
  organizationId?: string | null
): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('check-account-locked', {
      body: {
        email,
        organization_id: organizationId || null,
      },
    });

    if (error) {
      console.error('[checkAccountLocked] Error:', error);
      return false; // Default to not locked on error (allow login to proceed)
    }

    return data?.locked === true;
  } catch (error) {
    console.error('[checkAccountLocked] Unexpected error:', error);
    return false; // Default to not locked on error (allow login to proceed)
  }
}

