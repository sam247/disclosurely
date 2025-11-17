# Testing Guide for Disclosurely

## Overview

This project uses **Vitest** as the testing framework along with **React Testing Library** for component testing. All tests are located in the `src` directory alongside their corresponding source files.

## Setup

### Running Tests

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

### Test Files Location

- Test files should be placed next to the code they test
- Use `.test.ts` or `.test.tsx` extension
- Example: `encryption.ts` → `encryption.test.ts`

### Test Utilities

All test utilities are located in `/src/test/`:

- `setup.ts` - Global test setup, mocks, and configuration
- `utils.tsx` - Helper functions for rendering components with providers
- `mocks/` - Mock implementations (Supabase, etc.)

## Writing Tests

### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```typescript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';

describe('LoginForm', () => {
  it('should handle form submission', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Assert expected behavior
  });
});
```

### Mocking Supabase

```typescript
import { vi, beforeEach } from 'vitest';

const mockSignIn = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOtp: (...args: any[]) => mockSignIn(...args),
    },
  },
}));

describe('Auth tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call signIn', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null });

    // Your test code

    expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@example.com' });
  });
});
```

## Current Test Coverage

### Utility Tests

- **Encryption (`src/utils/encryption.test.ts`)** - 22 tests
  - Client-side encryption/decryption
  - Key generation and hashing
  - Server-side encryption/decryption edge functions
  - Error handling and edge cases

### Component Tests

- **LoginForm (`src/components/auth/LoginForm.test.tsx`)** - 12 tests
  - Email/OTP authentication flow
  - Google OAuth integration
  - Account lockout handling
  - Error states and loading states
  - Form validation

## Testing Best Practices

### 1. Test User Behavior, Not Implementation

✅ **Good:**
```typescript
it('should show success message after login', async () => {
  renderWithProviders(<LoginForm />);
  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(screen.getByText(/check your email/i)).toBeInTheDocument();
});
```

❌ **Bad:**
```typescript
it('should set loading state to true', () => {
  const { result } = renderHook(() => useMyHook());
  expect(result.current.loading).toBe(true); // Testing implementation details
});
```

### 2. Use Semantic Queries

Prefer queries in this order:
1. `getByRole` - Most accessible
2. `getByLabelText` - Good for forms
3. `getByText` - Good for content
4. `getByTestId` - Last resort

### 3. Mock External Dependencies

Always mock:
- Supabase client
- External API calls
- Browser APIs (localStorage, sessionStorage)
- Router navigation

### 4. Clean Up After Tests

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

### 5. Test Error States

Always test:
- Loading states
- Success states
- Error states
- Edge cases (empty data, null values, etc.)

## Critical Workflows to Test

### High Priority

1. **Authentication Flow**
   - ✅ Login (OTP and OAuth)
   - ⬜ Signup
   - ⬜ Password reset
   - ⬜ Session management

2. **Encryption/Decryption**
   - ✅ Client-side encryption utilities
   - ✅ Server-side encryption edge functions
   - ⬜ End-to-end report encryption

3. **Anonymous Report Submission**
   - ⬜ Form validation
   - ⬜ Draft saving
   - ⬜ File upload
   - ⬜ Submission success

4. **Case Management**
   - ⬜ Report listing and filtering
   - ⬜ Case assignment
   - ⬜ Status updates
   - ⬜ Secure messaging

5. **Compliance Policies**
   - ⬜ Policy creation
   - ⬜ Acknowledgment workflow
   - ⬜ Bulk actions

### Medium Priority

6. **Team Management**
   - ⬜ Invitations
   - ⬜ Role assignment
   - ⬜ Access control

7. **Analytics & Reporting**
   - ⬜ Data visualization
   - ⬜ Export functionality

8. **AI Features**
   - ⬜ Case analysis
   - ⬜ PII redaction
   - ⬜ Chat support

## Running Tests in CI/CD

The test suite is designed to run in CI/CD pipelines. Example GitHub Actions workflow:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
```

## Troubleshooting

### Tests timing out

Increase timeout in vitest.config.ts:
```typescript
export default defineConfig({
  test: {
    testTimeout: 10000, // 10 seconds
  },
});
```

### Mock not working

Make sure mocks are defined before imports:
```typescript
vi.mock('@/integrations/supabase/client', () => ({
  // mock implementation
}));

// Then import components that use the mock
import MyComponent from './MyComponent';
```

### React Testing Library errors

Always use `renderWithProviders` instead of `render` to ensure all necessary providers are available.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Next Steps

1. Add E2E testing with Playwright
2. Increase test coverage to >80%
3. Add visual regression testing
4. Set up mutation testing
5. Add performance benchmarks
