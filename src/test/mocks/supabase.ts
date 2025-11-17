import { vi } from 'vitest';
import { createMockSupabaseClient } from '../utils';

// Create a mock instance that can be imported
export const supabase = createMockSupabaseClient();

// Mock the supabase client module
vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient(),
}));
