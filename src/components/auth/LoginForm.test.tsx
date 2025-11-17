import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import LoginForm from './LoginForm';

// Mock Supabase client
const mockSignInWithOtp = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockRpc = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOtp: (...args: any[]) => mockSignInWithOtp(...args),
      signInWithOAuth: (...args: any[]) => mockSignInWithOAuth(...args),
    },
    rpc: (...args: any[]) => mockRpc(...args),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
    },
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form with email input and submit button', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByLabelText(/auth.signin.emailLabel/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /auth.signin.signInButton/i })).toBeInTheDocument();
  });

  it('should render Google login button', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByRole('button', { name: /auth.signin.continueWithGoogle/i })).toBeInTheDocument();
  });

  it('should handle successful OTP login', async () => {
    const user = userEvent.setup();

    mockRpc.mockResolvedValueOnce({
      data: false,
      error: null,
    });

    mockSignInWithOtp.mockResolvedValueOnce({
      error: null,
    });

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/auth.signin.emailLabel/i);
    const submitButton = screen.getByRole('button', { name: /auth.signin.signInButton/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          shouldCreateUser: false,
          emailRedirectTo: expect.stringContaining('/dashboard'),
        },
      });
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Check Your Email',
        description: expect.any(String),
      });
    });
  });

  it('should handle account lockout', async () => {
    const user = userEvent.setup();

    mockRpc.mockResolvedValueOnce({
      data: true, // Account is locked
      error: null,
    });

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/auth.signin.emailLabel/i);
    const submitButton = screen.getByRole('button', { name: /auth.signin.signInButton/i });

    await user.type(emailInput, 'locked@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('is_account_locked', {
        p_email: 'locked@example.com',
        p_organization_id: null,
      });
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Account Temporarily Locked',
        description: expect.any(String),
        variant: 'destructive',
      });
    });

    // Should not attempt login
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });

  it('should handle login error gracefully', async () => {
    const user = userEvent.setup();

    mockRpc.mockResolvedValueOnce({
      data: false,
      error: null,
    });

    mockSignInWithOtp.mockResolvedValueOnce({
      error: { message: 'Invalid credentials' },
    });

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/auth.signin.emailLabel/i);
    const submitButton = screen.getByRole('button', { name: /auth.signin.signInButton/i });

    await user.type(emailInput, 'wrong@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Login Failed',
        description: 'Invalid credentials',
        variant: 'destructive',
      });
    });
  });

  it('should handle Google OAuth login', async () => {
    const user = userEvent.setup();

    mockSignInWithOAuth.mockResolvedValueOnce({
      error: null,
    });

    renderWithProviders(<LoginForm />);

    const googleButton = screen.getByRole('button', { name: /auth.signin.continueWithGoogle/i });
    await user.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/dashboard'),
        },
      });
    });
  });

  it('should handle Google OAuth login error', async () => {
    const user = userEvent.setup();

    mockSignInWithOAuth.mockResolvedValueOnce({
      error: { message: 'OAuth provider error' },
    });

    renderWithProviders(<LoginForm />);

    const googleButton = screen.getByRole('button', { name: /auth.signin.continueWithGoogle/i });
    await user.click(googleButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Google Login Failed',
        description: 'OAuth provider error',
        variant: 'destructive',
      });
    });
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();

    mockRpc.mockResolvedValueOnce({
      data: false,
      error: null,
    });

    // Delay the resolution to capture loading state
    mockSignInWithOtp.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/auth.signin.emailLabel/i);
    const submitButton = screen.getByRole('button', { name: /auth.signin.signInButton/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Button should show loading text
    await waitFor(() => {
      expect(screen.getByText(/auth.signin.sendingCode/i)).toBeInTheDocument();
    });
  });

  it('should require email input', () => {
    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/auth.signin.emailLabel/i) as HTMLInputElement;
    expect(emailInput).toBeRequired();
  });

  it('should have correct email input type', () => {
    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/auth.signin.emailLabel/i) as HTMLInputElement;
    expect(emailInput.type).toBe('email');
  });

  it('should gracefully handle missing RPC function', async () => {
    const user = userEvent.setup();

    // RPC throws error (function doesn't exist)
    mockRpc.mockRejectedValueOnce(new Error('Function not found'));

    mockSignInWithOtp.mockResolvedValueOnce({
      error: null,
    });

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/auth.signin.emailLabel/i);
    const submitButton = screen.getByRole('button', { name: /auth.signin.signInButton/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Should continue with login despite RPC error
    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalled();
    });
  });

  it('should display sign up link', () => {
    renderWithProviders(<LoginForm />);

    const signUpLink = screen.getByRole('link', { name: /auth.signin.signUpLink/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute('href', '/auth/signup');
  });
});
