import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';

// Create a custom render function that includes providers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
}

export const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

export const renderWithProviders = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { route = '/', ...renderOptions } = options || {};

  if (route !== '/') {
    window.history.pushState({}, 'Test page', route);
  }

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

// Mock Supabase client
export const createMockSupabaseClient = () => {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    },
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      download: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    },
  };
};

// Mock authenticated user
export const mockAuthenticatedUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'authenticated',
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  user_metadata: {},
  app_metadata: {},
};

// Mock authenticated session
export const mockAuthenticatedSession = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockAuthenticatedUser,
};

// Mock organization data
export const mockOrganization = {
  id: 'test-org-id',
  name: 'Test Organization',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock report data
export const mockReport = {
  id: 'test-report-id',
  organization_id: 'test-org-id',
  tracking_id: 'ABC12345',
  status: 'new',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock policy data
export const mockPolicy = {
  id: 'test-policy-id',
  organization_id: 'test-org-id',
  title: 'Test Policy',
  content: 'Test policy content',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Helper to wait for async operations
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
