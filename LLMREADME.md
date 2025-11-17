# CURSORREADME.md - Disclosurely Agent Guide

**Purpose**: This document provides AI agents with a complete understanding of the Disclosurely application, its architecture, current state, and critical considerations for development work.

---

## 🎯 What is Disclosurely?

**Disclosurely** is a secure, GDPR-compliant whistleblowing SaaS platform that enables organizations to receive, manage, and resolve misconduct reports safely and anonymously.

- **Primary URL**: https://disclosurely.com
- **Documentation URL**: https://docs.disclosurely.com (VitePress)
- **Support**: support@disclosurely.com

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

### 9. AI Chat Support
- **Location**: Available on all pages (floating widget, bottom-right)
- **Key Files**:
  - `src/components/ChatWidget.tsx` - Frontend chat widget
  - `src/components/dashboard/ChatAdminView.tsx` - Admin panel
  - `supabase/functions/chat-support/index.ts` - Edge function
  - `supabase/functions/delete-chat-conversation/index.ts` - Delete handler
- **Features**:
  - AI-powered support using DeepSeek API
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
- ✅ **AI Chat Support** - 24/7 AI-powered chat widget with "Speak to Human" feature
- ✅ **Chat Admin Panel** - Admin interface for managing chat conversations with delete functionality
- ✅ **PII Scanner** - Server-side PII detection and redaction for anonymous reports
- ✅ **Privacy Enhancements** - Filename hashing, audit log filtering, PII sanitization in logs
- ✅ **Subscription Access Fixes** - Improved subscription status checking and access control
- ✅ **Removed Hardcoded Secrets** - Fixed critical security vulnerability (see SECURITY_MITIGATION_PLAN.md)

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

## 🧪 Testing

### Manual Testing
- Anonymous submission flow: `/test/anonymous-submission`
- Test reports: Use test organization in Supabase

### Key Test Scenarios
1. Anonymous report submission → Access code generation
2. Two-way messaging → Encryption/decryption
3. Policy assignment → Bulk actions
4. Role-based access → RLS policies
5. Custom domain → DNS verification

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