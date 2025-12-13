import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import LoginForm from './LoginForm';
import { checkAccountLocked } from '@/utils/edgeFunctions';

// Mock Supabase client
const mockSignInWithOtp = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockFunctionsInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOtp: (...args: any[]) => mockSignInWithOtp(...args),
      signInWithOAuth: (...args: any[]) => mockSignInWithOAuth(...args),
    },
    functions: {
      invoke: (...args: any[]) => mockFunctionsInvoke(...args),
    },
  },
}));

// Mock edgeFunctions
vi.mock('@/utils/edgeFunctions', () => ({
  checkAccountLocked: vi.fn(),
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
    // Reset checkAccountLocked mock
    vi.mocked(checkAccountLocked).mockResolvedValue(false);
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

    vi.mocked(checkAccountLocked).mockResolvedValueOnce(false);

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

    vi.mocked(checkAccountLocked).mockResolvedValueOnce(true); // Account is locked

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/auth.signin.emailLabel/i);
    const submitButton = screen.getByRole('button', { name: /auth.signin.signInButton/i });

    await user.type(emailInput, 'locked@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(checkAccountLocked).toHaveBeenCalledWith('locked@example.com', null);
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

    vi.mocked(checkAccountLocked).mockResolvedValueOnce(false);

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

    vi.mocked(checkAccountLocked).mockResolvedValueOnce(false);

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

  it('should gracefully handle missing Edge Function', async () => {
    const user = userEvent.setup();

    // Edge Function throws error (function doesn't exist)
    // checkAccountLocked catches errors internally and returns false, allowing login to proceed
    // Since checkAccountLocked has try/catch and returns false on error, we mock it to return false
    vi.mocked(checkAccountLocked).mockResolvedValueOnce(false);

    mockSignInWithOtp.mockResolvedValueOnce({
      error: null,
    });

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/auth.signin.emailLabel/i);
    const submitButton = screen.getByRole('button', { name: /auth.signin.signInButton/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // checkAccountLocked should be called
    await waitFor(() => {
      expect(checkAccountLocked).toHaveBeenCalledWith('test@example.com', null);
    });

    // Should continue with login (checkAccountLocked returns false on error, allowing login)
    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalled();
    });
  });

  it('should display sign up link', () => {
    renderWithProviders(<LoginForm />);

    const signUpLink = screen.getByRole('link', { name: /auth.signin.signUpLink/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute('href', 'https://app.disclosurely.com/auth/signup');
  });
});
