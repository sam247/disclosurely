/**
 * Partnero API integration utilities for Deno edge functions
 * Handles referral program tracking and customer management
 */

const PARTNERO_API_BASE = 'https://api.partnero.com/v1';

interface PartneroCustomer {
  id?: string;
  key?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface PartneroTransaction {
  customer: PartneroCustomer;
  amount: number;
  currency: string;
  transaction_id: string;
  transaction_date?: string;
  metadata?: Record<string, any>;
}

interface PartneroReferralLink {
  id: string;
  key: string;
  url: string;
  default: boolean;
}

interface PartneroResponse<T> {
  data: T;
  status: number;
}

/**
 * Get Partnero API token from environment
 */
function getPartneroApiToken(): string {
  const token = Deno.env.get('PARTNERO_API_TOKEN');
  if (!token) {
    throw new Error('PARTNERO_API_TOKEN not configured');
  }
  return token;
}

/**
 * Make authenticated request to Partnero API
 */
async function partneroRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<PartneroResponse<T>> {
  const token = getPartneroApiToken();
  const url = `${PARTNERO_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Partnero API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Create or update a customer in Partnero
 */
export async function createOrUpdatePartneroCustomer(
  email: string,
  options?: {
    firstName?: string;
    lastName?: string;
    customerKey?: string;
  }
): Promise<PartneroCustomer> {
  try {
    // Try to find existing customer by email
    // Partnero API: Try to get customer by email (may need to use search endpoint)
    // If customer doesn't exist, we'll create it below
    // Note: Partnero may return 404 if customer doesn't exist, which is fine

    // Create new customer
    const customerData: any = {
      email,
    };

    if (options?.customerKey) {
      customerData.key = options.customerKey;
    }

    if (options?.firstName) {
      customerData.first_name = options.firstName;
    }

    if (options?.lastName) {
      customerData.last_name = options.lastName;
    }

    const response = await partneroRequest<PartneroCustomer>(
      '/customers',
      {
        method: 'POST',
        body: JSON.stringify(customerData),
      }
    );

    return response.data;
  } catch (error) {
    console.error('[PARTNERO] Error creating/updating customer:', error);
    throw error;
  }
}

/**
 * Track a transaction in Partnero (for referral credit)
 */
export async function trackPartneroTransaction(
  transaction: PartneroTransaction
): Promise<void> {
  try {
    await partneroRequest(
      '/transactions',
      {
        method: 'POST',
        body: JSON.stringify(transaction),
      }
    );
    console.log('[PARTNERO] Transaction tracked successfully:', transaction.transaction_id);
  } catch (error) {
    console.error('[PARTNERO] Error tracking transaction:', error);
    // Don't throw - we don't want to break the subscription flow if Partnero is down
  }
}

/**
 * Get or create a referral link for a customer
 */
export async function getOrCreateReferralLink(
  customer: PartneroCustomer
): Promise<PartneroReferralLink> {
  try {
    // Try to get existing links
    const customerId = customer.id || customer.key || customer.email;
    if (!customerId) {
      throw new Error('Customer must have id, key, or email');
    }

    const linksResponse = await partneroRequest<PartneroReferralLink[]>(
      `/customers/${customerId}/referral_links`
    );

    if (linksResponse.data && linksResponse.data.length > 0) {
      // Return the default link or first link
      const defaultLink = linksResponse.data.find(link => link.default);
      return defaultLink || linksResponse.data[0];
    }

    // Create new referral link
    const linkKey = customer.key || `ref_${customer.id || customer.email?.replace('@', '_')}`;
    const createResponse = await partneroRequest<PartneroReferralLink>(
      '/customer_referral_links',
      {
        method: 'POST',
        body: JSON.stringify({
          customer: {
            id: customer.id,
            key: customer.key,
            email: customer.email,
          },
          key: linkKey,
        }),
      }
    );

    return createResponse.data;
  } catch (error) {
    console.error('[PARTNERO] Error getting/creating referral link:', error);
    throw error;
  }
}

/**
 * Search for a referral link by key
 */
export async function findReferralLinkByKey(key: string): Promise<PartneroReferralLink | null> {
  try {
    const response = await partneroRequest<PartneroReferralLink[]>(
      `/customer_referral_links:search?key=${encodeURIComponent(key)}`
    );

    if (response.data && response.data.length > 0) {
      return response.data[0];
    }

    return null;
  } catch (error) {
    console.error('[PARTNERO] Error searching for referral link:', error);
    return null;
  }
}

