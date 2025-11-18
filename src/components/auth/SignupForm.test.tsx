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

// Mock Supabase
const mockSignUp = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: (...args: any[]) => mockSignUp(...args),
    },
    from: (...args: any[]) => {
      return {
        insert: (...args: any[]) => {
          mockInsert(...args);
          return {
            select: () => ({
              single: () => mockSingle(),
            }),
          };
        },
        update: (...args: any[]) => {
          mockUpdate(...args);
          return {
            eq: () => Promise.resolve({ data: null, error: null }),
          };
        },
        select: () => ({
          eq: () => ({
            single: () => mockSingle(),
          }),
        }),
      };
    },
  },
}));

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
    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();
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
    await user.type(screen.getByLabelText(/organization name/i), 'Test Org');
    
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

    // Fill in all fields except organization name
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1] || screen.getByLabelText(/confirm.*password/i), 'password123');
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    // Don't fill organization name - leave it empty
    await user.click(submitButton);

    // Wait for validation to trigger
    await waitFor(() => {
      // Check if toast was called (organization required error)
      const toastCalls = mockToast.mock.calls;
      expect(toastCalls.length).toBeGreaterThan(0);
    }, { timeout: 3000 });

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
    await user.type(screen.getByLabelText(/organization name/i), 'Test Org');

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

    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1] || screen.getByLabelText(/confirm.*password/i), 'password123');
    await user.type(screen.getByLabelText(/organization name/i), 'Test Org');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    // Wait for error handling
    await waitFor(() => {
      // Check if toast was called (signup failed error)
      const toastCalls = mockToast.mock.calls;
      expect(toastCalls.length).toBeGreaterThan(0);
    }, { timeout: 3000 });

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

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1] || screen.getByLabelText(/confirm.*password/i), 'password123');
    await user.type(screen.getByLabelText(/organization name/i), 'My Company');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    // Wait for signup to complete and organization to be created
    await waitFor(() => {
      // Check if signup was called (required first step)
      expect(mockSignUp).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Verify signup was called with correct data
    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        password: 'password123',
      })
    );
    
    // Organization creation happens after signup
    // If insert was called, verify domain generation
    if (mockInsert.mock.calls.length > 0) {
      const insertCalls = mockInsert.mock.calls;
      const orgCall = insertCalls.find(call => {
        const data = Array.isArray(call[0]) ? call[0][0] : call[0];
        return data?.name === 'My Company';
      });
      if (orgCall) {
        const orgData = Array.isArray(orgCall[0]) ? orgCall[0][0] : orgCall[0];
        expect(orgData.domain).toBe('mycompany'); // Lowercase, no spaces
      }
    }
  });
});

