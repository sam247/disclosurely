import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'test-anon-key';
process.env.VITE_SUPABASE_PROJECT_ID = 'test-project-id';
process.env.VITE_CONTENTFUL_SPACE_ID = 'test-space-id';
process.env.VITE_CONTENTFUL_DELIVERY_TOKEN = 'test-delivery-token';
process.env.VITE_GOOGLE_MAPS_API_KEY = 'test-maps-key';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock scrollIntoView for Element - ensure it exists and is callable
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
} else {
  Element.prototype.scrollIntoView = vi.fn(Element.prototype.scrollIntoView);
}

// Also mock it on HTMLElement to be safe
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = vi.fn();
}

// Mock logger to prevent fetch errors in tests
vi.mock('@/utils/logger', () => ({
  LogContext: {
    FRONTEND: 'frontend',
    EDGE_FUNCTION: 'edge_function',
    DATABASE: 'database',
    AUTH: 'auth',
    ENCRYPTION: 'encryption',
    AUDIT: 'audit',
    SUBMISSION: 'submission',
    MESSAGING: 'messaging',
    AI_ANALYSIS: 'ai_analysis',
    MONITORING: 'monitoring',
    SYSTEM: 'system',
    CASE_MANAGEMENT: 'case_management',
  },
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    critical: vi.fn(),
  },
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    critical: vi.fn(),
    submissionStart: vi.fn(),
    submissionSuccess: vi.fn(),
    submissionError: vi.fn(),
    encryptionSuccess: vi.fn(),
    encryptionError: vi.fn(),
    edgeFunctionCall: vi.fn(),
    edgeFunctionSuccess: vi.fn(),
    edgeFunctionError: vi.fn(),
    databaseQuery: vi.fn(),
    databaseError: vi.fn(),
    triggerAIAnalysis: vi.fn(),
    checkSystemHealth: vi.fn(),
    criticalWithAI: vi.fn(),
  },
}));

// Global Supabase mock - individual tests can override this
// Note: This is a fallback mock. Individual test files should provide their own mocks
// to avoid conflicts and ensure proper test isolation.
