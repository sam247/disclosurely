import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import SignupForm from './SignupForm';

// Mock hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock Supabase - use vi.hoisted to create mocks that can be accessed in tests
const { mockSignUp, mockInsert, mockSingle } = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
  mockInsert: vi.fn(),
  mockSingle: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => {
  const createChainableBuilder = () => {
    const builder: any = {
      select: vi.fn().mockReturnThis(),
      insert: (...args: any[]) => {
        mockInsert(...args);
        // Return a new builder that supports .select().single() chain
        const insertBuilder: any = {
          select: vi.fn().mockReturnThis(),
          single: (...singleArgs: any[]) => {
            return mockSingle(...singleArgs);
          },
        };
        return insertBuilder;
      },
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      single: (...args: any[]) => {
        return mockSingle(...args);
      },
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    builder.then = (onResolve: any) => Promise.resolve({ data: null, error: null }).then(onResolve);
    builder.catch = (onReject: any) => Promise.resolve({ data: null, error: null }).catch(onReject);
    return builder;
  };

  return {
    supabase: {
      auth: {
        signUp: mockSignUp,
      },
      from: vi.fn(() => createChainableBuilder()),
    },
  };
});

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render signup form with all fields', async () => {
    renderWithProviders(<SignupForm />);

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/password/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
  });

  it('should validate password match', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    const passwordInputs = screen.getAllByLabelText(/password/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1] || screen.getByLabelText(/confirm.*password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Fill in required fields first to allow form submission
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different123');
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/business name/i), 'Test Org');
    
    // Now submit with mismatched passwords
    await user.clear(confirmPasswordInput);
    await user.type(confirmPasswordInput, 'different123');
    await user.click(submitButton);

    // Wait for validation to trigger
    await waitFor(() => {
      // Check if toast was called (password mismatch error)
      const toastCalls = mockToast.mock.calls;
      expect(toastCalls.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('should validate organization name is required', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Fill in all required fields, then clear organization name to test custom validation
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1] || screen.getByLabelText(/confirm.*password/i), 'password123');
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/business name/i), 'Test Org');
    
    // Now clear business name to test custom validation
    const orgInput = screen.getByLabelText(/business name/i);
    await user.clear(orgInput);
    
    // Submit form - HTML5 validation might prevent this, but if it doesn't, custom validation should trigger
    await user.click(submitButton);

    // Wait for validation to trigger (either HTML5 or custom)
    await waitFor(() => {
      // Check if toast was called (organization required error) or if form validation prevented submission
      const toastCalls = mockToast.mock.calls;
      const hasError = toastCalls.length > 0 || 
                      orgInput.validity.valid === false;
      expect(hasError).toBe(true);
    }, { timeout: 3000 });
  });

  it('should handle successful signup', async () => {
    const user = userEvent.setup();

    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockOrg = { id: 'org-123', name: 'Test Org', domain: 'testorg' };

    mockSignUp.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSingle
      .mockResolvedValueOnce({ data: mockOrg, error: null }) // Organization creation
      .mockResolvedValueOnce({ data: { id: 'profile-123' }, error: null }); // Profile creation

    renderWithProviders(<SignupForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1] || screen.getByLabelText(/confirm.*password/i), 'password123');
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/business name/i), 'Test Org');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
        })
      );
    });
  });

  it('should handle signup errors', async () => {
    const user = userEvent.setup();

    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Email already registered' },
    });

    renderWithProviders(<SignupForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1] || screen.getByLabelText(/confirm.*password/i), 'password123');
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/business name/i), 'Test Org');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    // Wait for error handling - signup should be called and return error
    await waitFor(() => {
      // Check if signup was called (it should be, even with error)
      expect(mockSignUp).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Then check if toast was called with error
    await waitFor(() => {
      const toastCalls = mockToast.mock.calls;
      expect(toastCalls.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  it('should auto-generate domain from organization name', async () => {
    const user = userEvent.setup();

    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockSignUp.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSingle
      .mockResolvedValueOnce({ 
        data: { id: 'org-123', name: 'My Company', domain: 'mycompany' }, 
        error: null 
      })
      .mockResolvedValueOnce({ data: { id: 'profile-123' }, error: null });

    renderWithProviders(<SignupForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    // Fill in all required fields
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1] || screen.getByLabelText(/confirm.*password/i), 'password123');
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/business name/i), 'My Company');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    // Wait for signup to be called
    await waitFor(() => {
      // Check if signup was called (required first step)
      expect(mockSignUp).toHaveBeenCalled();
    }, { timeout: 5000 });
    
    // Verify signup was called with correct data
    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        password: 'password123',
      })
    );
    
    // Organization creation happens after signup succeeds
    // Wait for insert to be called (organization creation)
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Verify domain generation - check the insert call
    const insertCalls = mockInsert.mock.calls;
    expect(insertCalls.length).toBeGreaterThan(0);
    
    // Find the organization insert call
    const orgCall = insertCalls.find(call => {
      const data = Array.isArray(call[0]) ? call[0][0] : call[0];
      return data?.name === 'My Company' || data?.domain === 'mycompany';
    });
    
    expect(orgCall).toBeDefined();
    if (orgCall) {
      const orgData = Array.isArray(orgCall[0]) ? orgCall[0][0] : orgCall[0];
      expect(orgData.domain).toBe('mycompany'); // Lowercase, no spaces
      expect(orgData.name).toBe('My Company');
    }
  });
});

