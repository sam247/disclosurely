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

  it('should render signup form with all fields', () => {
    renderWithProviders(<SignupForm />);

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i) || screen.getAllByLabelText(/password/i)[0]).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm.*password/i) || screen.getAllByLabelText(/password/i)[1]).toBeInTheDocument();
    expect(screen.getByLabelText(/first.*name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last.*name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/organization.*name/i)).toBeInTheDocument();
  });

  it('should validate password match', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Passwords do not match',
          variant: 'destructive',
        })
      );
    });
  });

  it('should validate organization name is required', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: expect.stringContaining('organization'),
          variant: 'destructive',
        })
      );
    });
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

    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
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

    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.type(screen.getByLabelText(/organization name/i), 'Test Org');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Signup Failed',
          variant: 'destructive',
        })
      );
    });
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

    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1] || screen.getByLabelText(/confirm.*password/i), 'password123');
    await user.type(screen.getByLabelText(/organization name/i), 'My Company');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Company',
          domain: 'mycompany', // Lowercase, no spaces
        })
      );
    });
  });
});

