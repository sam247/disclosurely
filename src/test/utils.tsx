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

// Create a chainable query builder mock
const createQueryBuilder = () => {
  const defaultResult = Promise.resolve({
    data: null,
    error: null,
  });
  
  const builder: any = {
    select: vi.fn().mockReturnValue(builder),
    insert: vi.fn().mockReturnValue(builder),
    update: vi.fn().mockReturnValue(builder),
    delete: vi.fn().mockReturnValue(builder),
    upsert: vi.fn().mockReturnValue(builder),
    eq: vi.fn().mockReturnValue(builder),
    neq: vi.fn().mockReturnValue(builder),
    gt: vi.fn().mockReturnValue(builder),
    gte: vi.fn().mockReturnValue(builder),
    lt: vi.fn().mockReturnValue(builder),
    lte: vi.fn().mockReturnValue(builder),
    like: vi.fn().mockReturnValue(builder),
    ilike: vi.fn().mockReturnValue(builder),
    is: vi.fn().mockReturnValue(builder),
    in: vi.fn().mockReturnValue(builder),
    contains: vi.fn().mockReturnValue(builder),
    order: vi.fn().mockReturnValue(builder),
    limit: vi.fn().mockReturnValue(builder),
    range: vi.fn().mockReturnValue(builder),
    single: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    maybeSingle: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
  };
  
  // Make the builder thenable (Promise-like) for queries without .single()/.maybeSingle()
  builder.then = defaultResult.then.bind(defaultResult);
  builder.catch = defaultResult.catch.bind(defaultResult);
  builder.finally = defaultResult.finally.bind(defaultResult);
  
  return builder;
};

// Mock Supabase client
export const createMockSupabaseClient = () => {
  const queryBuilder = createQueryBuilder();
  
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
    from: vi.fn().mockReturnValue(queryBuilder),
    rpc: vi.fn().mockResolvedValue({
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
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        download: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        remove: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        list: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
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
