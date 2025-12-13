# CURSORREADME.md - Disclosurely Agent Guide

**Purpose**: This document provides AI agents with a complete understanding of the Disclosurely application, its architecture, current state, and critical considerations for development work.

---

## 🎯 What is Disclosurely?

**Disclosurely** is a secure, GDPR-compliant whistleblowing SaaS platform that enables organizations to receive, manage, and resolve misconduct reports safely and anonymously.

- **Primary URL**: https://disclosurely.com
- **App URL**: https://app.disclosurely.com
- **Documentation URL**: https://docs.disclosurely.com (VitePress)
- **Support**: support@disclosurely.com

### 🔐 Canonical Authentication URLs

**IMPORTANT**: These are the ONLY official authentication URLs that should be used:

- **Sign In**: `https://app.disclosurely.com/auth/signin`
- **Sign Up**: `https://app.disclosurely.com/auth/signup`

All other authentication URL variations (e.g., `/login`, `/signin`, `/signup` on any domain) automatically redirect to these canonical URLs via Vercel redirects.

### Core Value Proposition
- Secure anonymous reporting with end-to-end encryption
- GDPR/UK GDPR compliance built-in
- AI-powered case analysis (with privacy-first architecture)
- Custom branding and white-label capabilities
- Policy acknowledgment and compliance management

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: React 18.1+ (Vite, NOT Next.js - README.md is outdated)
- **Language**: TypeScript
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + TanStack Query
- **Internationalization**: i18next (12 languages supported)
- **Build Tool**: Vite 5.4+

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Edge Functions**: Supabase Edge Functions (Deno)
- **Hosting**: Vercel (main app) + Vercel (docs)
- **CDN**: Vercel Edge Network
- **Error Tracking**: Sentry

### External Services
- **Payment Processing**: Stripe
- **Content Management**: Contentful (blog content, announcements)
- **Domain Management**: Vercel DNS (for custom domains)
- **Email**: Supabase Auth emails + Edge Functions

### Documentation Site
- **Framework**: VitePress (separate from main app)
- **Location**: `/docs` directory
- **Deployment**: Separate Vercel project → `docs.disclosurely.com`

---

## 📁 Project Structure

```
disclosurely/
├── src/                          # Main React application
│   ├── App.tsx                   # Root component with routing
│   ├── main.tsx                  # Entry point (Sentry, i18n, providers)
│   ├── pages/                    # Page components
│   ├── components/               # React components
│   │   ├── dashboard/           # Dashboard views
│   │   ├── forms/               # Form components
│   │   ├── auth/                # Authentication UI
│   │   ├── ui/                  # shadcn/ui components
│   │   └── ...
│   ├── hooks/                    # Custom React hooks
│   ├── contexts/                # React contexts
│   ├── integrations/
│   │   └── supabase/            # Supabase client & types
│   ├── i18n/                    # i18next configuration & locales
│   ├── lib/                     # Utility functions
│   └── utils/                    # Helper utilities
│
├── docs/                         # VitePress documentation site
│   ├── docs/                     # Markdown documentation
│   │   ├── .vitepress/          # VitePress config & theme
│   │   └── [content files]
│   └── package.json              # Separate package.json
│
├── supabase/
│   ├── functions/                # Edge Functions (Deno)
│   └── migrations/               # Database migrations
│
├── public/                       # Static assets
├── vercel.json                   # Vercel deployment config
├── vite.config.ts               # Vite build configuration
└── package.json                  # Main app dependencies
```

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. **Supabase Auth**: Handles all authentication
2. **Auth Provider** (`src/hooks/useAuth.tsx`): Manages auth state globally
3. **Protected Routes**: Uses `ProtectedRoute` component wrapper
4. **Session Management**: Automatic token refresh + session timeout warnings

### User Roles (RBAC)
Defined in `user_roles` table with `app_role` enum:
- **`admin`**: System-level admin (full access)
- **`org_admin`**: Organization administrator (full org access)
- **`case_handler`**: Can manage reports and communicate
- **`reviewer`**: Read-only access to reports

**Key Files**:
- `src/hooks/useUserRoles.tsx` - Role checking hook
- `supabase/migrations/20251021092633_*.sql` - Role system migration

### Security Considerations
- **Row Level Security (RLS)**: Enabled on all sensitive tables
- **Encryption**: AES-256-GCM for report data (organization-specific keys)
- **Session Timeout**: Idle + absolute timeout warnings
- **MFA**: Available via Supabase Auth (not fully integrated yet)

---

## 🏛️ System Architecture

### High-Level Architecture

Disclosurely follows a **serverless, multi-tenant SaaS architecture** with clear separation between frontend, backend, and infrastructure layers.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React App  │  │  Progressive │  │   Dashboard  │      │
│  │   (Vite)     │  │  Form (SPA)  │  │   (SPA)      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                  │
│                    ┌───────▼────────┐                        │
│                    │  Supabase JS   │                        │
│                    │     Client     │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│              SUPABASE PLATFORM (Backend)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                      │   │
│  │  • Row Level Security (RLS) for multi-tenancy        │   │
│  │  • Encrypted report storage                          │   │
│  │  • Audit logging                                     │   │
│  │  • Vector embeddings (pgvector)                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Edge Functions (Deno Runtime)              │   │
│  │  • submit-anonymous-report (encryption, validation)  │   │
│  │  • decrypt-report-data (decryption)                  │   │
│  │  • analyze-case-with-ai (AI processing)              │   │
│  │  • ai-gateway-generate (AI API gateway)              │   │
│  │  • case-workflow-engine (automation)                 │   │
│  │  • chat-support (AI chat)                            │   │
│  │  • + 35+ other functions                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Supabase Auth                           │   │
│  │  • Email/OTP authentication                          │   │
│  │  • Google OAuth                                      │   │
│  │  • Session management                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Supabase Storage                          │   │
│  │  • Encrypted file attachments                        │   │
│  │  • Metadata-stripped uploads                         │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│              EXTERNAL SERVICES                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Stripe    │  │    Resend    │  │   DeepSeek   │      │
│  │  (Payments)  │  │   (Email)    │  │     (AI)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Contentful  │  │   Partnero   │  │    Vercel    │      │
│  │   (Content)  │  │ (Referrals)  │  │  (Hosting)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────────────────────────────────────────┘
```

### Request Flow: Anonymous Report Submission

**1. Client-Side (Browser)**:
```
User fills form → ProgressiveReportForm component
  ↓
PII Detection (client-side, real-time)
  ↓
Form validation
  ↓
POST to Edge Function: submit-anonymous-report
```

**2. Edge Function Processing**:
```
submit-anonymous-report Edge Function:
  ├─ Rate limiting (Upstash Redis)
  ├─ Link token verification
  ├─ PII scanning (server-side, OpenRedact or legacy)
  ├─ Server-side encryption (AES-256-GCM)
  ├─ Database insert (reports table)
  ├─ Workflow automation (non-blocking):
  │   ├─ Auto-assignment (case-workflow-engine)
  │   └─ SLA calculation (case-workflow-engine)
  ├─ AI risk assessment (non-blocking):
  │   └─ assess-risk-with-ai Edge Function
  ├─ Email notifications (non-blocking):
  │   └─ sendReportNotificationEmails (Resend API)
  └─ Audit logging (non-blocking):
      └─ logAuditEvent
```

**3. Post-Submission (Async, Non-Blocking)**:
- AI risk assessment runs asynchronously
- Email notifications sent via Resend
- Workflow automation (auto-assignment, SLA)
- Audit events logged

### Multi-Tenancy Architecture

**Organization Isolation**:
- **Row Level Security (RLS)**: All queries filtered by `organization_id`
- **Encryption Keys**: Organization-specific keys derived from `organization_id + ENCRYPTION_SALT`
- **Custom Domains**: Each organization can have custom reporting domains
- **Branding**: Per-organization logos, colors, and settings

**Data Isolation Layers**:
1. **Database Level**: RLS policies enforce organization boundaries
2. **Application Level**: All queries include `organization_id` filter
3. **Encryption Level**: Organization-specific encryption keys
4. **Storage Level**: Organization-scoped storage buckets

### Edge Functions Architecture

**Shared Utilities** (`supabase/functions/_shared/`):
- `cors.ts` - CORS header utilities
- `pii-scanner.ts` - PII detection (OpenRedact + legacy)
- `pii-detector.ts` - PII redaction utilities
- `rateLimit.ts` - Rate limiting (Upstash Redis)
- `partnero.ts` - Referral program integration

**Key Edge Functions**:
- `submit-anonymous-report` - Report submission (encryption, validation, workflow)
- `decrypt-report-data` - Report decryption for authorized users
- `analyze-case-with-ai` - AI case analysis
- `ai-gateway-generate` - AI API gateway with PII redaction
- `case-workflow-engine` - Auto-assignment and SLA calculation
- `chat-support` - AI chat widget backend
- `check-feature-flag` - Feature flag checking (public endpoint)
- `check-account-locked` - Account lockout checking (public endpoint)

**Error Handling Pattern**:
- Critical operations (encryption, database insert) block on failure
- Non-critical operations (email, audit, AI) wrapped in try-catch, non-blocking
- All errors logged to `system_logs` table
- CORS headers always included, even on errors

### Encryption Architecture

**Report Encryption Flow**:
1. **Client-Side** (for drafts): Browser-based encryption using Web Crypto API
2. **Server-Side** (for submissions): Edge Function encryption using Deno Web Crypto API
3. **Key Derivation**: `SHA-256(organization_id + ENCRYPTION_SALT)`
4. **Algorithm**: AES-256-GCM (authenticated encryption)
5. **Storage**: Encrypted content stored in `reports.encrypted_content` column

**Decryption Flow**:
1. Authorized user requests report via dashboard
2. `decrypt-report-data` Edge Function called
3. Function verifies user permissions (RLS + role check)
4. Decrypts using organization-specific key
5. Returns decrypted content to client

### CORS & Custom Domain Architecture

**CORS Strategy**:
- **Public Endpoints**: Allow all origins (`*`) for custom domain support
- **Security**: Handled by link tokens, feature flags, or other auth mechanisms
- **Shared Utility**: `getCorsHeaders()` in `supabase/functions/_shared/cors.ts`

**Custom Domain Flow**:
1. Organization configures custom domain in dashboard
2. DNS verification (CNAME record)
3. Vercel DNS API creates domain mapping
4. Edge Functions handle requests from custom domains
5. CORS headers allow all origins to support custom domains

---

## 🗄️ Database Architecture (Supabase)

### Key Tables

**Core Tables**:
- `profiles` - User profiles linked to `auth.users`
- `organizations` - Organization data
- `user_roles` - Role assignments (separate from profiles)
- `reports` - Whistleblower reports (encrypted)
- `report_messages` - Two-way messaging (encrypted)
- `policies` - Compliance policies
- `policy_acknowledgments` - User policy acknowledgments
- `custom_domains` - Custom domain configurations

### Important Patterns
- **Encryption**: Report data stored encrypted (decrypted via Edge Functions)
- **Soft Deletes**: Many tables use `deleted_at` timestamps
- **Audit Trails**: Separate audit log table for compliance
- **RLS Policies**: All tables have Row Level Security enabled

### Migrations
- Located in `supabase/migrations/`
- Applied via Supabase CLI or dashboard
- **Critical**: Always test migrations locally before production

---

## 🚀 Key Features & Modules

### 1. Anonymous Reporting
- **Location**: `/secure/tool/submit/:linkToken`
- **Key Files**: 
  - `src/components/forms/SubmissionForm.tsx`
  - `supabase/functions/submit-anonymous-report/index.ts`
- **Features**:
  - No login required
  - Unique 8-character access codes (hashed)
  - File attachments
  - End-to-end encryption

### 2. Case Management Dashboard
- **Location**: `/dashboard`
- **Key Components**: 
  - `DashboardView`, `ReportsManagement`, `ReportMessaging`
- **Features**:
  - Report listing and filtering
  - Assignment to team members
  - Status tracking
  - Secure two-way messaging

### 3. Compliance Module
- **Location**: `/dashboard/compliance/*`
- **Key Pages**:
  - `ComplianceOverview` - Dashboard
  - `CompliancePolicies` - Policy management
  - `ComplianceRisks` - Risk tracking
  - `ComplianceCalendar` - Compliance deadlines
  - `PolicyAcknowledgment` - Employee acknowledgments
  - `ComplianceInsights` - Analytics
- **Features**:
  - Policy creation and assignment
  - Bulk actions (assign, remind, archive)
  - Progress tracking (color-coded bars)
  - Acknowledgment certificates (planned)

### 4. AI Case Analysis
- **Location**: `/dashboard/ai-helper`
- **Key Files**:
  - `src/components/dashboard/AIHelperView.tsx`
  - `supabase/functions/analyze-case-with-ai/index.ts`
  - `supabase/functions/ai-gateway-generate/index.ts`
- **Features**:
  - AI-powered case categorization
  - Risk assessment
  - PII redaction before AI processing
  - Privacy-first architecture

### 5. Custom Branding
- **Location**: `/dashboard/branding`
- **Features**:
  - Logo upload
  - Color customization
  - Custom domain configuration
  - White-label reporting portals

### 6. Team Management
- **Location**: `/dashboard/team`
- **Features**:
  - Invite members via email
  - Role assignment
  - User management
  - Invitation acceptance flow

### 7. Secure Link Generation
- **Location**: `/dashboard/secure-link`
- **Features**:
  - Generate unique reporting URLs
  - Token-based access
  - Custom domain support

### 8. Referral Program
- **Location**: `/dashboard/settings` → Referral tab
- **Key Files**:
  - `src/components/ReferralProgram.tsx`
  - `supabase/functions/_shared/partnero.ts`
  - `supabase/functions/get-referral-link/index.ts`
  - `supabase/functions/stripe-webhook/index.ts` (transaction tracking)
- **Features**:
  - Generate unique referral links
  - Track referrals via Partnero API
  - Automatic transaction tracking on subscription
  - Referral code passed through checkout flow

### 9. AI Chat Support (Backend Only)
- **Note**: Frontend chat widget has been removed. Backend functions remain available for future use.
- **Key Files**:
  - `src/components/dashboard/ChatAdminView.tsx` - Admin panel
  - `supabase/functions/chat-support/index.ts` - Edge function
  - `supabase/functions/delete-chat-conversation/index.ts` - Delete handler
- **Features**:
  - AI-powered support using DeepSeek API (backend only)
  - "Speak to Human" button with email notifications (3-4 min wait time)
  - Admin panel for managing conversations
  - Delete conversations permanently
  - Human request tracking and filtering
  - Conversation history and message management
  - Larger chat bubbles for better readability

---

## 🌐 Routing Architecture

### Public Routes
- `/` - Landing page
- `/pricing` - Pricing page
- `/features` - Features page
- `/about` - About page
- `/blog` - Blog (Contentful-powered)
- `/contact` - Contact page
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy

### Authentication Routes

**Canonical URLs (use these everywhere):**
- `/auth/signin` - Sign in page (redirects from `/login`, `/signin`)
- `/auth/signup` - Sign up page (redirects from `/signup`)

**Legacy/Redirect URLs (automatically redirect to canonical URLs):**
- `/login` → `/auth/signin`
- `/signin` → `/auth/signin`
- `/signup` → `/auth/signup`
- `/auth/login` → `/auth/signin`

### Anonymous Reporting Routes (Public, No Auth)

**Primary Routes:**
- `/report`, `/submit`, `/whistleblow` - Clean submission URLs (progressive form)
- `/newform` - Progressive disclosure form (new experience)
- `/status` - Report status lookup form
- `/status/:trackingId` - Two-way messaging interface
- `/success` - Report submission success page
- `/resume-draft` - Resume saved draft

**Legacy Routes (for backwards compatibility):**
- `/secure/tool/submit/:linkToken` - Token-based submission form
- `/secure/tool/submit/:linkToken/status` - Token-based status lookup
- `/secure/tool/messaging/:trackingId` - Legacy messaging route (redirects to /status/:trackingId)

### Authenticated Routes
All routes under `/dashboard/*` and `/app/*` require authentication:
- `/dashboard` - Main dashboard
- `/dashboard/compliance/*` - Compliance module
- `/dashboard/team` - Team management
- `/dashboard/settings` - Organization settings
- `/dashboard/branding` - Branding configuration
- `/dashboard/analytics` - Analytics
- `/dashboard/audit` - Audit logs

### Multilingual Support
Routes support language prefixes: `/:lang/pricing`, `/:lang/contact`, etc.
Supported languages: EN, ES, FR, DE, IT, NL, PT, PL, SV, DA, NO, FI

---

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase CLI (for local development)
- Git

### Environment Variables

**Required for Main App**:
```
VITE_SUPABASE_URL=https://cxmuzperkittvibslnff.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
VITE_CONTENTFUL_SPACE_ID=[contentful-space-id]
VITE_CONTENTFUL_DELIVERY_TOKEN=[contentful-delivery-token]
VITE_SENTRY_DSN=[sentry-dsn] (optional)
```

**Vercel Environment Variables**: Set in Vercel dashboard for each project

### Running Locally

```bash
# Main app
npm install
npm run dev        # Runs on http://localhost:8080

# Documentation (separate)
cd docs
npm install
npm run docs:dev   # Runs on http://localhost:5173
```

### Build Commands

```bash
# Main app
npm run build              # Production build
npm run build:dev          # Development build

# Documentation
cd docs
npm run docs:build         # VitePress build
```

### Local Supabase Setup with FFmpeg

**Note**: Supabase CLI commands may hang in Cursor's terminal. Use Terminal.app for Docker commands.

**Prerequisites:**
- Docker Desktop running
- Supabase CLI installed (v2.54.11+)

**Initial Setup:**

1. **Build FFmpeg Docker image** (one-time):
   ```bash
   export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
   docker build -t supabase-functions-ffmpeg:latest -f supabase/functions/Dockerfile supabase/functions/
   ```

2. **Start Supabase**:
   ```bash
   # If Supabase CLI works:
   supabase start
   
   # If CLI hangs, use the helper script:
   ./start-edge-functions.sh
   ```

**Starting Edge Functions with FFmpeg:**

If the edge functions container stops or needs to be recreated:

```bash
# Run in Terminal.app (not Cursor):
./start-edge-functions.sh
```

This script will:
- Find the Supabase network
- Create/start edge functions container with FFmpeg
- Verify FFmpeg is working

**Verify FFmpeg:**

```bash
docker exec supabase_edge_runtime_cxmuzperkittvibslnff ffmpeg -version
```

**Stop Supabase:**

```bash
# Stop containers
docker stop supabase_db_cxmuzperkittvibslnff supabase_edge_runtime_cxmuzperkittvibslnff

# Or quit Docker Desktop
```

**Important Files:**
- `start-edge-functions.sh` - Script to start edge functions with FFmpeg
- `docker-compose.override.yml` - Docker configuration for FFmpeg image
- `supabase/functions/Dockerfile` - FFmpeg image build file

**Note**: The `strip-all-metadata` edge function requires FFmpeg for video files (MP4, etc.). Audio files (MP3) are handled without FFmpeg.

---

## 🚢 Deployment

### Main Application
- **Platform**: Vercel
- **Domain**: disclosurely.com
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Configuration**: `vercel.json` (redirects, headers, CSP)

### Documentation Site
- **Platform**: Vercel (separate project)
- **Domain**: docs.disclosurely.com
- **Build Command**: `cd docs && npm run docs:build`
- **Output Directory**: `docs/docs/.vitepress/dist`
- **Configuration**: `docs/vercel.json`

### Important Deployment Notes
1. **Environment Variables**: Must be set in Vercel dashboard for each project
2. **Supabase Migrations**: Apply via Supabase dashboard or CLI before deployment
3. **Content Security Policy**: Defined in `vercel.json` - update carefully
4. **Custom Domains**: Managed via Supabase Edge Functions + Vercel DNS API

---

## ⚠️ Critical Considerations

### Security
1. **Encryption Keys**: Organization-specific, stored separately from data
2. **RLS Policies**: Always verify RLS is enabled and working before deployment
3. **Error Messages**: Never expose stack traces or sensitive data in errors
4. **CSP**: Content Security Policy in `vercel.json` must allow all required domains
5. **Sentry**: Configured but not required for local development
6. **⚠️ CRITICAL: ENCRYPTION_SALT**: 
   - **Location**: Supabase Edge Function Secrets
   - **Secret Name**: `ENCRYPTION_SALT`
   - **⚠️ NEVER CHANGE WITHOUT MIGRATION PLAN**
   - Changing this salt makes ALL encrypted reports/messages permanently unreadable
   - Must be backed up securely (password manager)
   - Edge Functions check salt on startup
   - Audit table: `encryption_salt_audit` tracks changes
   - See `ENCRYPTION_SALT_BACKUP.md` and `DISASTER_RECOVERY.md` for details
7. **⚠️ CRITICAL: NO HARDCODED SECRETS**:
   - **NEVER** hardcode API keys, tokens, or secrets in code
   - Always use environment variables
   - If env var is missing, fail fast with clear error (don't use fallback values)
   - See `SECURITY_MITIGATION_PLAN.md` for details
   - Use `scripts/check-secrets.sh` before deploying (if created)

### Performance
1. **N+1 Queries**: Previously fixed (batch operations for notifications)
2. **Database Indexes**: Verify indexes exist for frequently queried columns
3. **Edge Functions**: Use for heavy operations (encryption, AI processing)
4. **Caching**: React Query handles client-side caching

### Contentful Integration
- **Used For**: Blog posts, announcements, SEO content
- **Tokens**: Use Delivery API token (not Management API) for client-side
- **Fallbacks**: Always have fallback content when Contentful is unavailable
- **Current Issue**: `DynamicHelmet.tsx` has Contentful calls disabled (causing loops)

### Feature Flags
- System exists but not fully utilized
- See `supabase/migrations/20251030000001_feature_flags.sql`
- Hook: `useFeatureFlag.tsx`

### Internationalization (i18n)
- **12 Languages Supported**: EN, ES, FR, DE, IT, NL, PT, PL, SV, DA, NO, FI
- **Config**: `src/i18n/config.ts`
- **Locales**: `src/i18n/locales/*.json`
- **Language Detection**: URL-based (`useLanguageFromUrl` hook)

---

## 🎨 Styling & UI

### Design System
- **Framework**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Theme**: Dark/light mode via `next-themes`

### Brand Colors
- **Primary Blue**: `#6366f1` (indigo-500)
- **Brand Colors**: Configured in Tailwind config

### Component Structure
- **UI Components**: `src/components/ui/` - Reusable shadcn components
- **Page Components**: `src/pages/` - Full page views
- **Feature Components**: `src/components/[feature]/` - Feature-specific UI

---

## 📝 Documentation Site (VitePress)

### Location
- **Source**: `/docs/docs/`
- **Config**: `/docs/docs/.vitepress/config.js`
- **Theme**: `/docs/docs/.vitepress/theme/`

### Current Setup
- **Logo**: Custom logos for light/dark modes
- **Colors**: Overridden to Disclosurely blue (`#6366f1`)
- **Search**: Local search enabled
- **Default Theme**: Dark mode

### Adding Content
1. Create Markdown file in `/docs/docs/`
2. Add to sidebar in `config.js`
3. Rebuild and deploy

### Known Issues
- Hero title color was purple (now fixed via CSS load order)
- CSS overrides must load AFTER VitePress defaults

---

## 🐛 Common Issues & Solutions

### 1. Contentful API Errors
**Issue**: `AccessTokenInvalid` errors
**Solution**: Use Delivery API token (not Management API), check Vercel env vars

### 2. VitePress Build Failures
**Issue**: PostCSS/Tailwind config conflicts
**Solution**: Ensure no root `postcss.config.js` or `tailwind.config.ts` conflicts with VitePress

### 3. CSS Overrides Not Working
**Issue**: VitePress defaults overriding custom styles
**Solution**: Import custom CSS AFTER VitePress theme defaults in `index.js`

### 4. RLS Policy Errors
**Issue**: Users can't access their data
**Solution**: Check RLS policies in Supabase dashboard, ensure `user_id` matches `auth.uid()`

### 5. Encryption/Decryption Failures
**Issue**: Reports can't be decrypted
**Solution**: Verify organization encryption keys exist and are correct

### 6. Chat Delete Not Working
**Issue**: Delete button shows alerts but doesn't delete conversations
**Solution**: Ensure `delete-chat-conversation` edge function is deployed. The function uses service role to bypass RLS.

### 7. Hardcoded Secrets Error
**Issue**: Build fails or security scan finds hardcoded secrets
**Solution**: 
- Remove all hardcoded fallback values from environment variables
- Use fail-fast error handling instead
- Verify all secrets are in Vercel environment variables
- See `SECURITY_MITIGATION_PLAN.md` for complete fix

### 8. Subscription Access Blocked
**Issue**: Users with active subscriptions can't access dashboard
**Solution**: Check `useAuth.tsx` and `subscriptionUtils.ts` - ensure `active`/`trialing` statuses always grant access regardless of `subscription_end` date.

### 9. Human Request Not Sending Email
**Issue**: "Speak to Human" button doesn't trigger email notification
**Solution**: 
- Verify `RESEND_API_KEY` is set in Supabase edge function secrets
- Check `chat-support` edge function logs
- Ensure email recipient (`sampettiford@googlemail.com`) is correct in function

### 10. Sitemap Generation Fails
**Issue**: Sitemap API returns error about missing Contentful token
**Solution**: Ensure `VITE_CONTENTFUL_DELIVERY_TOKEN` is set in Vercel environment variables. The function now fails fast if the token is missing (no hardcoded fallback).

### 11. Report Submission Fails with 500 Error
**Issue**: `submit-anonymous-report` Edge Function returns 500 Internal Server Error
**Root Cause**: Non-critical operations (email notifications, audit logging) were throwing errors that blocked the response, even though the report was successfully created in the database.

**Solution** (Fixed 2025-11-24):
- Wrapped `sendReportNotificationEmails()` in try-catch (non-blocking)
- Wrapped `logAuditEvent()` in try-catch (non-blocking)
- Wrapped PII scanning in try-catch (continues with empty result if fails)
- Enhanced error logging with full error details
- All non-critical operations now fail gracefully without blocking submission

**Key Principle**: Critical operations (encryption, database insert) should block on failure, but non-critical operations (email, audit, AI processing) should be non-blocking to ensure core functionality always succeeds.

**Files Changed**:
- `supabase/functions/submit-anonymous-report/index.ts` - Added try-catch blocks around non-critical operations

---

## 🔄 Current State & Recent Changes

### Recently Completed
- ✅ Removed Featurebase integration (was causing issues)
- ✅ Switched documentation to VitePress from Next.js
- ✅ Fixed N+1 query performance issue (notifications)
- ✅ Security fixes (encryption, RLS, error sanitization)
- ✅ Added bulk policy actions
- ✅ Progress bars for policy acknowledgments
- ✅ **Referral Program Integration** (Partnero) - Users can refer others and earn rewards
- ✅ **Chat Admin Panel** - Admin interface for managing chat conversations with delete functionality (frontend widget removed)
- ✅ **PII Scanner** - Server-side PII detection and redaction for anonymous reports
- ✅ **Privacy Enhancements** - Filename hashing, audit log filtering, PII sanitization in logs
- ✅ **Subscription Access Fixes** - Improved subscription status checking and access control
- ✅ **Removed Hardcoded Secrets** - Fixed critical security vulnerability (see SECURITY_MITIGATION_PLAN.md)
- ✅ **Report Submission Resilience** (2025-11-24) - Made email notifications and audit logging non-blocking to prevent submission failures

### In Progress / Planned
- ⏳ Acknowledgment certificates (Quick Win #3)
- ⏳ AI Phase 1 (Smart Policy Assignment, Gap Analysis)
- ⏳ Mobile optimization
- ⏳ SSO/SAML integration (enterprise feature)

### Known Technical Debt
- Contentful integration in `DynamicHelmet.tsx` disabled (needs refactor)
- MFA integration incomplete
- ~~Some hardcoded fallbacks in error handling~~ ✅ FIXED - Removed hardcoded secrets
- Feature flags system exists but underutilized

---

## 🧪 Testing Infrastructure

### Overview
Disclosurely uses a comprehensive multi-layer testing strategy combining **Vitest** for unit/integration tests and **Playwright** for end-to-end testing.

**Test Coverage**: 49+ passing tests across critical functionality
**Frameworks**: Vitest + React Testing Library + Playwright
**Documentation**: See `/TESTING.md` for detailed testing guide

### Testing Stack

**Unit & Integration Testing**:
- **Vitest**: Fast unit test runner
- **React Testing Library**: Component testing
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: Browser environment simulation

**E2E Testing**:
- **Playwright**: Cross-browser E2E testing
- Supports Chromium, Firefox, WebKit, Mobile viewports
- Visual regression testing capabilities

### Test Commands

```bash
# Unit & Integration Tests (Vitest)
npm test                    # Run tests in watch mode
npm run test:run            # Run tests once
npm run test:ui             # Run with interactive UI
npm run test:coverage       # Run with coverage report

# E2E Tests (Playwright)
npm run test:e2e            # Run E2E tests
npm run test:e2e:ui         # Run with Playwright UI
npm run test:e2e:headed     # Run in headed mode (visible browser)
npm run test:e2e:debug      # Run in debug mode

# All Tests
npm run test:all            # Run both unit and E2E tests

# Setup
npm run playwright:install  # Install Playwright browsers
```

### Test Suite Structure

**Location**: Tests are co-located with source files (`*.test.ts`, `*.test.tsx`)

#### Unit & Integration Tests (Vitest)

**1. Encryption & Security** (`src/utils/encryption.test.ts`) - ✅ 22 tests
- Client-side AES-256-GCM encryption/decryption
- Key generation and SHA-256 hashing
- Server-side encryption edge functions
- Unicode and JSON data handling
- Error handling and validation

**2. Authentication** (`src/components/auth/LoginForm.test.tsx`) - ✅ 12 tests
- Email/OTP authentication flow
- Google OAuth integration
- Account lockout detection
- Error states and loading indicators
- Form validation

**3. Session Management** (`src/hooks/useSessionTimeout.test.tsx`) - 8 tests
- Idle timeout detection (15 min)
- Absolute timeout enforcement (8 hours)
- Activity tracking across multiple event types
- Warning modal display
- Session extension functionality

**4. Custom Domains** (`src/hooks/useCustomDomains.test.tsx`) - 6 tests
- Domain addition with DNS instructions
- CNAME verification
- DNS propagation checking
- Domain deletion
- Error handling

**5. Secure Messaging** (`src/components/anonymous/AnonymousMessaging.test.tsx`) - 7 tests
- Message encryption and display
- Optimistic updates
- Error rollback
- Empty message validation
- Custom branding application

**6. Team Management** (`src/components/UserManagement.test.tsx`) - 8 tests
- Team member listing
- Invitation workflows
- Duplicate prevention
- Expiration handling
- Team limit enforcement

**7. Security Features** (`src/test/security.test.ts`) - 17 tests
- Row Level Security (RLS) enforcement
- Organization isolation
- Data encryption verification
- Audit logging
- PII detection and redaction
- Input sanitization (SQL injection, XSS)
- File upload security
- Rate limiting

#### E2E Tests (Playwright)

**1. Authentication Flows** (`e2e/auth.spec.ts`)
- Login page display and validation
- OTP verification flow
- Session timeout warnings
- Navigation between auth pages

**2. Anonymous Reporting** (`e2e/anonymous-reporting.spec.ts`)
- Form display and validation
- Draft saving and resuming
- File upload security
- Tracking ID generation
- Secure messaging interface

**3. Dashboard Features** (`e2e/dashboard.spec.ts`)
- Team management
  - Member listing
  - Invitation sending
  - Invitation cancellation
  - Team limit enforcement
- Custom domains
  - Domain addition
  - DNS verification
  - Propagation status
  - Domain deletion
- Secure link generation
  - Link creation
  - Clipboard functionality
  - Custom domain integration
- Case management
  - Report filtering
  - Case assignment
  - Status updates
- Compliance policies
  - Policy creation
  - Team assignment
- Security settings
  - Active session display
  - Session revocation

### Test Utilities & Helpers

**Location**: `/src/test/`
- `setup.ts` - Global test configuration
- `utils.tsx` - React Testing Library helpers
- `mocks/supabase.ts` - Supabase client mocks

**Key Helpers**:
```typescript
// Render with providers
renderWithProviders(<Component />);

// Mock authenticated user
mockAuthenticatedUser;
mockAuthenticatedSession;

// Mock data
mockOrganization;
mockReport;
mockPolicy;
```

### Critical Test Scenarios

**Pre-Launch Must-Test Workflows**:
1. ✅ Anonymous report submission → Access code generation
2. ✅ Two-way messaging → Encryption/decryption
3. ✅ Authentication → OTP and OAuth flows
4. ✅ Session management → Timeout warnings
5. ✅ Custom domains → DNS verification and propagation
6. ✅ Team invitations → Email sending and acceptance
7. ✅ Security features → RLS, encryption, audit logging
8. ⬜ Policy assignment → Bulk actions (needs E2E test)
9. ⬜ AI case analysis → PII redaction (needs integration test)
10. ⬜ File uploads → Metadata stripping (needs integration test)

### Testing Best Practices

**1. Test User Behavior, Not Implementation**
```typescript
// ✅ Good
it('should show success message after login', async () => {
  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(screen.getByText(/check your email/i)).toBeInTheDocument();
});

// ❌ Avoid
it('should set loading state', () => {
  expect(component.state.loading).toBe(true);
});
```

**2. Use Semantic Queries (Accessibility-First)**
Priority order:
1. `getByRole` - Most accessible
2. `getByLabelText` - Good for forms
3. `getByText` - Good for content
4. `getByTestId` - Last resort

**3. Always Mock External Dependencies**
- Supabase client
- API calls
- Browser APIs (localStorage, sessionStorage)
- Router navigation

**4. Clean Up After Tests**
```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

**5. Test All States**
- Loading states
- Success states
- Error states
- Edge cases (empty data, null values)

### Manual Testing

**Test Accounts** (in Supabase):
- Anonymous submission: `/test/anonymous-submission`
- Use test organization for report testing

**Critical Manual Tests** (Pre-Launch):
1. Complete anonymous report submission flow
2. Dashboard login and navigation (all roles)
3. Case assignment and status updates
4. Policy creation and acknowledgment
5. Team invitation acceptance
6. Custom domain configuration end-to-end
7. Secure messaging (both directions)
8. File upload with metadata stripping
9. AI case analysis with PII
10. Export functionality (reports, policies)

### CI/CD Integration

**GitHub Actions Example**:
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
      - run: npx playwright install
      - run: npm run test:e2e
```

### Coverage Goals

**Current Coverage**: ~60% of critical paths
**Target Coverage**: >80% before production launch

**Priority Areas for Additional Tests**:
1. Compliance policy bulk actions
2. AI analysis workflows
3. File upload and processing
4. Subscription limit enforcement
5. Advanced search and filtering
6. Analytics and reporting
7. Audit log verification

### Troubleshooting

**Tests timing out?**
```typescript
// In vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 10000, // 10 seconds
  },
});
```

**Mock not working?**
Ensure mocks are defined before imports:
```typescript
vi.mock('@/integrations/supabase/client', () => ({
  // mock implementation
}));

import MyComponent from './MyComponent';
```

**Component test failing?**
Always use `renderWithProviders` to ensure necessary providers (Router, QueryClient) are available.

### Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- **Internal**: `/TESTING.md` - Comprehensive testing guide

---

## 📚 Key Files Reference

### Critical Files to Understand

**App Entry & Routing**:
- `src/App.tsx` - All routes defined here
- `src/main.tsx` - App initialization (Sentry, i18n)

**Authentication**:
- `src/hooks/useAuth.tsx` - Auth state management
- `src/components/ProtectedRoute.tsx` - Route protection
- `src/hooks/useUserRoles.tsx` - Role checking

**Database**:
- `src/integrations/supabase/client.ts` - Supabase client
- `src/integrations/supabase/types.ts` - TypeScript types

**Key Features**:
- `src/components/forms/SubmissionForm.tsx` - Anonymous reporting
- `src/components/dashboard/DashboardView.tsx` - Main dashboard
- `src/pages/CompliancePolicies.tsx` - Policy management

**Edge Functions** (Supabase):
- `supabase/functions/submit-anonymous-report/` - Report submission
- `supabase/functions/analyze-case-with-ai/` - AI analysis
- `supabase/functions/decrypt-report-data/` - Report decryption

---

## 🎯 Development Best Practices

1. **Always Use TypeScript**: No `any` types, leverage generated types
2. **Test RLS Policies**: Verify permissions work before deploying
3. **Error Handling**: Use try/catch, never expose stack traces
4. **Internationalization**: All user-facing text should use i18n
5. **Security First**: Encrypt sensitive data, use RLS, validate inputs
6. **Performance**: Avoid N+1 queries, use React Query for caching
7. **Git Workflow**: Create feature branches, test locally before PR
8. **Environment Variables**: Never commit secrets, use Vercel env vars

---

## 🔗 External Resources

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Sentry**: https://sentry.io (if configured)
- **Contentful**: https://app.contentful.com (for blog content)
- **GitHub**: [Repository URL]

---

## 📞 Support & Communication

- **Support Email**: support@disclosurely.com
- **Documentation**: https://docs.disclosurely.com
- **Main Site**: https://disclosurely.com

---

## ⚡ Quick Reference Commands

```bash
# Development
npm run dev                    # Start main app
cd docs && npm run docs:dev    # Start docs site

# Building
npm run build                  # Build main app
cd docs && npm run docs:build  # Build docs

# Database (requires Supabase CLI)
supabase migration list        # List migrations
supabase db push              # Push migrations

# Supabase with FFmpeg (run in Terminal.app, not Cursor)
./start-edge-functions.sh     # Start edge functions with FFmpeg
docker exec supabase_edge_runtime_cxmuzperkittvibslnff ffmpeg -version  # Verify FFmpeg

# Git
git checkout -b feature/name   # Create feature branch
git commit -m "message"        # Commit changes
git push origin branch         # Push to remote
```

---

**Last Updated**: 2025-11-17  
**Maintained By**: AI Agents (for development continuity)  
**Purpose**: Onboarding new AI agents and maintaining context across chat resets