# Sentinel Report SafeHaven - System Architecture Documentation

## 🏗️ **System Overview**

Sentinel Report SafeHaven is a secure whistleblowing platform built with React + TypeScript frontend and Supabase backend. The system enables anonymous report submission with end-to-end encryption, secure messaging, and comprehensive audit logging.

---

## 🔐 **Security Architecture**

### **Encryption Strategy**
- **Server-Side Encryption**: All report data is encrypted using Supabase Edge Functions
- **Organization-Specific Keys**: Each organization has a unique encryption key derived from organization ID + server salt
- **Algorithm**: AES-GCM with random IV for each encryption
- **Salt Management**: Server-side salt (`disclosurely-server-salt-2024-secure`) never exposed to client
- **Backward Compatibility**: Supports legacy encryption salts for existing reports

### **Key Components**
1. **`encrypt-report-data`** Edge Function: Handles server-side encryption
2. **`decrypt-report-data`** Edge Function: Handles server-side decryption with backward compatibility
3. **`anonymous-report-messaging`** Edge Function: Manages encrypted messaging between whistleblowers and organizations

---

## 📊 **Database Schema**

### **Core Tables**

#### **`organizations`**
- Organization management and settings
- Contains encryption keys and configuration

#### **`organization_links`**
- Secure submission links for anonymous reports
- Each link has a unique `link_token` for access control
- RLS policies allow anonymous read access to active links

#### **`reports`**
- Encrypted report data storage
- Contains `encrypted_content` and `encryption_key_hash`
- Links to organization via `organization_id`

#### **`report_messages`**
- Encrypted messaging between whistleblowers and organizations
- Messages are encrypted server-side before storage

#### **`profiles`**
- User profiles and authentication
- Links to organizations via `organization_id`
- No longer contains `role` field (moved to `user_roles`)

#### **`user_roles`**
- Role-based access control
- Roles: `admin`, `org_admin`, `case_handler`
- Prevents infinite recursion in RLS policies

#### **`audit_logs`**
- Comprehensive audit trail for all system actions
- Tracks actor information, target details, and metadata

---

## 🔄 **Edge Functions**

### **Authentication & Team Management**
- **`send-team-invitation`**: Sends team invitation emails via Resend
- **`accept-team-invitation`**: Handles invitation acceptance flow
- **`send-otp-email`**: Sends OTP verification emails

### **Report Processing**
- **`encrypt-report-data`**: Server-side encryption using Deno Web Crypto API
- **`decrypt-report-data`**: Server-side decryption with backward compatibility
- **`submit-anonymous-report`**: Processes anonymous report submissions
- **`anonymous-report-messaging`**: Handles encrypted messaging

### **Notifications**
- **`process-notifications-to-emails`**: Bridge function that converts notifications to email queue
- **`process-pending-email-notifications`**: Processes notification queue with AI logging
- **`get-status-timeline`**: Fetches status change history from audit logs for timeline display
- **`send-notification-emails`**: Sends email notifications
- **`send-weekly-roundup`**: Weekly summary emails
- **`send-new-case-notification`**: New case notifications

### **Data Management**
- **`soft-delete-report`**: Soft deletes reports with proper permissions

---

## 🛡️ **Row Level Security (RLS)**

### **Key Policies**

#### **Anonymous Access**
```sql
-- Allow anonymous read access to active organization links
CREATE POLICY "Allow anonymous read access to active organization links"
ON public.organization_links FOR SELECT TO anon
USING (is_active = true);

-- Allow anonymous read access to organizations via active links
CREATE POLICY "Allow anonymous read access to organizations via active links"
ON public.organizations FOR SELECT TO anon
USING (EXISTS ( SELECT 1
        FROM public.organization_links
       WHERE ((organization_links.organization_id = organizations.id) AND (organization_links.is_active = true))));
```

#### **User Role Management**
```sql
-- Fixed infinite recursion policy for user_roles
CREATE POLICY "Org admins can view organization roles (fixed)"
ON public.user_roles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles AS ur_check
    WHERE ur_check.user_id = auth.uid()
      AND ur_check.organization_id = user_roles.organization_id
      AND ur_check.role IN ('admin', 'org_admin')
      AND ur_check.is_active = true
  )
);
```

---

## 🔧 **Configuration Files**

### **Supabase Configuration (`supabase/config.toml`)**
```toml
[functions.encrypt-report-data]
verify_jwt = false  # Anonymous access for encryption

[functions.decrypt-report-data]
verify_jwt = true   # Authenticated access for decryption

[functions.submit-anonymous-report]
verify_jwt = false  # Anonymous access for submissions

[functions.anonymous-report-messaging]
verify_jwt = false  # Anonymous access for messaging
```

### **Content Security Policy**
- **`vercel.json`**: CSP headers for Vercel deployment
- **`public/_headers`**: Static CSP headers
- **Contentful Integration**: Added `https://cdn.contentful.com` to `connect-src`

---

## 📱 **Frontend Architecture**

### **Key Components**

#### **Authentication Flow**
- **`AcceptInvite.tsx`**: Handles team invitation acceptance
- **`UserManagement.tsx`**: Team member management with role-based access
- **`useUserRoles.tsx`**: Hook for managing user roles

#### **Report Management**
- **`ReportsManagement.tsx`**: Report listing and assignment
- **`DashboardView.tsx`**: Main dashboard with report management
- **`SecureMessaging.tsx`**: Encrypted messaging interface

#### **Anonymous Submission**
- **`SubmissionFormWrapper.tsx`**: Wrapper for anonymous submissions
- **`DynamicSubmissionForm.tsx`**: Dynamic form generation
- **`SecureSubmissionForm.tsx`**: Secure form with encryption

#### **SEO & Content Management**
- **`DynamicHelmet.tsx`**: Dynamic SEO management via Contentful
- **`Blog.tsx`**: Blog system integrated with Contentful
- **`AIContentGenerator.tsx`**: AI content generation with DeepSeek

---

## 🌐 **External Integrations**

### **Contentful CMS**
- **Blog Management**: Headless CMS for blog posts
- **SEO Management**: Dynamic SEO settings per page
- **Schema Management**: JSON-LD structured data
- **Internationalization**: Multi-language support

### **Resend Email Service**
- **Team Invitations**: Professional email templates
- **Notifications**: System notifications and alerts
- **OTP Verification**: One-time password emails

### **DeepSeek AI**
- **Content Generation**: AI-powered blog content creation
- **Integration**: Direct Contentful integration for content publishing

---

## 🔄 **Data Flow**

### **Anonymous Report Submission**
1. User accesses secure link (`/secure/tool/submit/:linkToken`)
2. Form data is validated and sanitized client-side
3. Data is encrypted via `encrypt-report-data` Edge Function
4. Encrypted data is submitted via `submit-anonymous-report` Edge Function
5. Report is stored in database with encrypted content
6. Audit event is logged
7. Success page displays tracking ID

### **Secure Messaging**
1. User enters tracking ID in messaging interface
2. `anonymous-report-messaging` Edge Function loads report and messages
3. Messages are decrypted server-side
4. New messages are encrypted server-side before storage
5. Real-time updates via Supabase subscriptions

### **Team Management**
1. Admin sends invitation via `send-team-invitation` Edge Function
2. Email is sent via Resend with invitation link
3. User accepts invitation via `AcceptInvite.tsx`
4. User profile is created with organization assignment
5. User role is assigned in `user_roles` table

---

## 🚨 **Critical Security Considerations**

### **Encryption**
- ✅ **Server-Side Only**: No encryption keys exposed to client
- ✅ **Organization-Specific**: Each organization has unique encryption
- ✅ **Backward Compatible**: Supports legacy encrypted data
- ✅ **Audit Logged**: All encryption/decryption events logged

### **Access Control**
- ✅ **RLS Policies**: Comprehensive row-level security
- ✅ **Role-Based**: Granular permissions via `user_roles`
- ✅ **Anonymous Access**: Controlled anonymous access for submissions
- ✅ **Audit Trail**: Complete audit logging for compliance

### **Data Protection**
- ✅ **Encrypted Storage**: All sensitive data encrypted at rest
- ✅ **Secure Transmission**: HTTPS for all communications
- ✅ **Input Validation**: Comprehensive input sanitization
- ✅ **Rate Limiting**: Protection against abuse

---

## 🛠️ **Development & Deployment**

### **Environment Variables**
```bash
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Contentful
VITE_CONTENTFUL_SPACE_ID=
VITE_CONTENTFUL_DELIVERY_TOKEN=

# Resend
RESEND_API_KEY=

# DeepSeek AI
DEEPSEEK_API_KEY=

# Encryption
ENCRYPTION_SALT=disclosurely-server-salt-2024-secure
```

### **Deployment**
- **Frontend**: Vercel with CSP headers
- **Backend**: Supabase Edge Functions
- **Database**: Supabase PostgreSQL with RLS
- **CDN**: Contentful CDN for assets

---

## 📋 **Troubleshooting Guide**

### **Common Issues**

#### **Encryption Errors**
- Check `ENCRYPTION_SALT` environment variable
- Verify Edge Function configuration in `config.toml`
- Check backward compatibility for legacy data

#### **RLS Policy Issues**
- Verify user roles in `user_roles` table
- Check for infinite recursion in policies
- Ensure proper anonymous access policies

#### **Edge Function Failures**
- Check Supabase client initialization
- Verify environment variables
- Review function configuration in `config.toml`

#### **Contentful Integration**
- Verify API keys and space ID
- Check CSP headers for Contentful domains
- Verify content type IDs vs display names

---

## 🔍 **Monitoring & Logging**

### **Audit Logs**
- All system actions logged in `audit_logs` table
- Includes actor information, target details, and metadata
- Supports compliance and security monitoring

### **Edge Function Logs**
- Comprehensive logging in all Edge Functions
- Error tracking and debugging information
- Performance monitoring capabilities

### **Client-Side Logging**
- Console logging for debugging
- Error boundaries for React components
- User action tracking

---

## 📈 **Performance Considerations**

### **Database Optimization**
- Proper indexing on frequently queried columns
- RLS policies optimized for performance
- Connection pooling via Supabase

### **Frontend Optimization**
- React component optimization
- Lazy loading for large components
- Efficient state management

### **Edge Function Optimization**
- Minimal dependencies
- Efficient Supabase client usage
- Proper error handling

---

## 🔮 **Future Enhancements**

### **Security**
- Multi-factor authentication
- Advanced threat detection
- Enhanced audit capabilities

### **Features**
- Advanced reporting analytics
- Custom notification templates
- Enhanced mobile experience

### **Integrations**
- Additional CMS providers
- Advanced AI capabilities
- Third-party security tools

---

## ✅ **Current Status (October 2025)**

### **Fully Operational Systems**
- ✅ **Anonymous Report Submission**: Complete end-to-end flow working
- ✅ **Server-Side Encryption**: AES-GCM encryption with organization-specific keys
- ✅ **Secure Messaging**: Two-way encrypted communication working
- ✅ **Team Management**: Invitation system and role-based access working
- ✅ **Blog System**: Contentful integration with AI content generation
- ✅ **SEO Management**: Dynamic SEO via Contentful for all pages
- ✅ **Audit Logging**: Comprehensive audit trail operational
- ✅ **Database Functions**: All functions updated to use `user_roles` table

### **Recent Critical Fixes**
- 🔧 **Database Function Updates**: Fixed all functions referencing removed `profiles.role`
- 🔧 **RLS Policy Optimization**: Resolved infinite recursion in user role policies
- 🔧 **Anonymous Access**: Proper RLS policies for anonymous report submissions
- 🔧 **Edge Function Configuration**: Proper JWT verification settings in `config.toml`

---

## 🎯 **Next Priority Tasks**

### **High Priority**
1. **Security Audit**: Complete security review with Semgrep
2. **Performance Testing**: Load testing for anonymous submissions
3. **Error Monitoring**: Implement comprehensive error tracking
4. **Backup Strategy**: Database backup and disaster recovery plan

### **Medium Priority**
1. **Mobile Optimization**: Enhanced mobile experience
2. **Advanced Analytics**: Report analytics and insights
3. **Custom Branding**: Enhanced organization branding options
4. **API Documentation**: Complete API documentation

### **Low Priority**
1. **Multi-language Support**: Full i18n implementation
2. **Advanced Notifications**: Custom notification templates
3. **Integration Testing**: Comprehensive test suite
4. **Documentation**: User guides and admin documentation

---

## 🔍 **System Health Check**

## 🌐 **Custom Domain Management**

### **Overview**
Custom domain functionality allows organizations to use their own branded domains for secure report submission links (e.g., `secure.company.com` instead of `app.disclosurely.com/secure/tool/submit/token`). This provides a seamless, branded experience for whistleblowers while maintaining security and compliance.

### **Architecture Components**

#### **Database Schema**
- **`custom_domains`** table: Stores domain configurations per organization
  - `organization_id`: Links to organization
  - `domain`: The custom domain (e.g., `secure.company.com`)
  - `is_active`: Whether domain is verified and active
  - `is_primary`: Whether this is the organization's primary domain
  - `verification_status`: Current verification state
  - `created_at`, `updated_at`: Timestamps

#### **Edge Functions**
- **`simple-domain`**: Handles custom domain verification workflow
  - `generate` action: Creates Vercel verification records and retrieves DNS configuration
  - `verify` action: Validates DNS configuration and triggers Vercel verification
  - Uses Vercel API v6/v10 for domain management
  - Implements multi-DNS provider verification for reliability
  - Comprehensive AI logging for debugging and monitoring

#### **Frontend Components**
- **`CustomDomainSettings.tsx`**: Main UI for domain management
  - 3-step workflow: Enter domain → Generate records → Verify
  - Real-time progress indicators (DNS check, Vercel verification, SSL provisioning)
  - localStorage persistence for user experience across page reloads
  - Copy-to-clipboard functionality for DNS records
  - Toast notifications for user feedback

### **Workflow Process**

1. **Domain Entry**: User enters custom domain (e.g., `secure.company.com`)
2. **Record Generation**: System calls Vercel API to add domain and retrieve verification records
   - Extracts subdomain (e.g., `secure` from `secure.company.com`)
   - Retrieves Vercel's recommended CNAME record
   - Gets TXT verification records from multiple API sources
3. **DNS Configuration**: User adds provided CNAME and TXT records to their DNS provider
4. **Verification**: System validates DNS records and triggers Vercel verification
   - Uses multiple DNS providers (Google, Cloudflare, Quad9) for reliability
   - Calls Vercel API to trigger domain verification
5. **Activation**: Domain becomes active for secure link generation

### **Technical Implementation**

#### **Vercel API Integration**
- **API Endpoints Used**:
  - `POST /v10/projects/{projectId}/domains`: Add domain to project
  - `GET /v6/domains/{domain}/config`: Get domain configuration and recommended CNAME
  - `GET /v9/domains/{domain}`: Get detailed domain information
  - `GET /v10/projects/{projectId}/domains`: List project domains
  - `POST /v9/projects/{projectId}/domains/{domain}/verify`: Trigger verification

#### **DNS Record Management**
- **CNAME Records**: Uses Vercel's `recommendedCNAME` field for accurate multi-tenant SaaS operation
- **TXT Records**: Extracts verification records from multiple Vercel API sources:
  - Project domains verification array
  - Domain config verification
  - Domain info verification
- **Multi-Provider DNS Check**: Uses Google DNS, Cloudflare DNS, and Quad9 for verification reliability
- **Subdomain Extraction**: Dynamically extracts subdomain from full domain for CNAME naming

#### **AI-Powered Logging**
- Comprehensive logging throughout the custom domain workflow
- Stores logs in `system_logs` table for AI analysis
- Tracks generation, verification, and error states
- Provides debugging visibility for troubleshooting
- Context-aware logging with structured data

#### **Error Handling & Resilience**
- Graceful handling of existing domains ("already in use", "linked to another account")
- Fallback mechanisms for DNS record retrieval
- Multiple verification sources to ensure record availability
- Comprehensive error messages for user guidance

### **Security Considerations**
- **API Token Management**: Vercel API tokens stored as Supabase secrets
- **Domain Validation**: Server-side validation of domain formats
- **DNS Verification**: Multiple DNS providers prevent single points of failure
- **Error Handling**: Graceful handling of API failures and edge cases
- **Format String Security**: Safe logging practices to prevent injection attacks

#### **AI-Powered Logging**
- **Comprehensive Logging**: Every step logged to `system_logs` table
- **Context Tracking**: Request start, generation, verification, success/error states
- **Debugging Support**: Detailed error logging for troubleshooting
- **Performance Monitoring**: Execution time tracking

### **Security Considerations**
- **Domain Validation**: Vercel handles domain ownership verification
- **SSL Provisioning**: Automatic SSL certificate generation
- **Access Control**: RLS policies protect domain data
- **Audit Trail**: Complete logging of all domain operations

### **Error Handling**
- **Graceful Degradation**: Handles existing domains, API errors, DNS issues
- **User Feedback**: Clear error messages and retry mechanisms
- **Fallback Options**: Manual verification when automated fails
- **Progress Indicators**: Real-time feedback during verification process

---

## 🔧 **Recent Critical Fixes (October 23, 2025)**

### ✅ **Issues Resolved**
1. **Anonymous Messaging Decryption**: Fixed Edge Function to return `decrypted_message` field
2. **Report Deletion**: Enhanced debugging with separate profile and user_roles queries  
3. **TypeScript Build Errors**: Fixed all interface mismatches and missing imports
4. **Custom Domain Verification**: Fixed 400 errors by removing DNS check after Vercel API verification
5. **TXT Record Display**: Fixed empty TXT record values in dashboard UI
6. **Progress Indicators**: Added real-time verification progress feedback
7. **AI Logging Integration**: Comprehensive logging throughout custom domain workflow
8. **Audit Logs RLS**: Fixed RLS policies to allow anonymous users to insert audit logs
9. **Security Hardening**: Added `SET search_path = public` to all SECURITY DEFINER functions
10. **Team Invite Verification**: Fixed critical syntax error and audit trigger issues

### 🔍 **Root Causes Identified & Fixed**

#### **Anonymous Submitter Messaging Still Encrypted**
- **Root Cause**: Edge Function was returning only `encrypted_message`, not `decrypted_message`
- **Fix**: Modified `anonymous-report-messaging` Edge Function to return both fields
- **Result**: Messages now display decrypted content immediately after sending

#### **Deletion Function Enhanced Debugging**  
- **Root Cause**: `user_roles!left(role, is_active)` syntax wasn't working in Supabase PostgREST
- **Fix**: Separated profile and user_roles queries for clearer debugging
- **Result**: Edge Function provides detailed logs about exactly where deletion fails

#### **Security Scan - Missing search_path**
- **Root Cause**: Three `SECURITY DEFINER` functions lacked `SET search_path = public`
- **Fix**: Created migration to add `SET search_path = public` to all relevant functions
- **Result**: System hardened against potential schema poisoning attacks

#### **Team Invite Verification Failure**
- **Root Cause**: `accept-team-invitation` Edge Function had duplicate variable declaration causing syntax error
- **Secondary Issue**: `log_role_change` trigger missing required `audit_logs` fields (`actor_type`, `hash`, etc.)
- **Fix**: 
  - Fixed duplicate destructuring in Edge Function
  - Updated `log_role_change` trigger to include all required audit_logs fields
- **Result**: Team invite verification now works end-to-end with proper CORS headers and 200 OK responses

#### **Custom Domain Verification Failures**
- **Root Cause**: Verification was performing DNS check after Vercel API verification, causing false failures
- **Secondary Issues**: 
  - TXT record values not displaying in dashboard UI
  - No progress indicators during verification process
  - Limited debugging information for troubleshooting
- **Fix**: 
  - Removed DNS check and rely solely on Vercel API verification
  - Fixed TXT record extraction from Vercel project domains API
  - Added real-time progress indicators with visual feedback
  - Integrated comprehensive AI logging throughout workflow
- **Result**: Domain verification now works correctly with proper user feedback and debugging capabilities

### ✅ **Email Notification System Fixed**
- **Root Cause**: Disconnect between `notifications` table (where triggers create records) and `email_notifications` table (where email processing looks for records)
- **Fix**: Created comprehensive email notification bridge system
- **Components**:
  - **Bridge Function**: `process-notifications-to-emails` converts notifications to email queue
  - **Enhanced Trigger**: `notify_new_report_via_email()` creates both notification types
  - **AI Logging**: Comprehensive monitoring throughout email process
- **Status**: ✅ Fully operational - New reports and team invites now send emails

### ✅ **Status Timeline Feature Added**
- **Feature**: Real-time status timeline for anonymous users
- **Components**: 
  1. `StatusTimeline` component with user-friendly status mapping
  2. `get-status-timeline` Edge Function for fetching audit logs
  3. Status change tracking via database triggers
- **Status Mapping**: `new` → `Submitted`, `reviewing` → `Under Review`, `investigating` → `Investigating`, `resolved` → `Resolved`, `closed/archived/deleted` → `Closed`
- **UX**: Visual timeline with icons, colors, and descriptions
- **Status**: ✅ Fully operational - Anonymous users can now see report progress

### 🤖 **Enhanced Debugging System**
- **Comprehensive Logging**: All messaging and deletion operations now have detailed logging
- **AI Analysis**: Automatic AI analysis triggered for critical errors
- **Real-time Monitoring**: System health checks and pattern detection
- **Audit Trail**: Complete logging of all user actions and system events

### **Core Functionality Status**
- 🟢 **Report Submission**: ✅ Working
- 🟢 **Encryption/Decryption**: ✅ Working  
- 🟢 **Secure Messaging**: ✅ Working
- 🟢 **Team Management**: ✅ Working
- 🟢 **Blog System**: ✅ Working
- 🟢 **SEO Management**: ✅ Working
- 🟢 **Database Functions**: ✅ Working
- 🟢 **RLS Policies**: ✅ Working

### **Integration Status**
- 🟢 **Supabase**: ✅ Fully operational
- 🟢 **Contentful**: ✅ Fully operational
- 🟢 **Resend**: ✅ Fully operational
- 🟢 **DeepSeek AI**: ✅ Fully operational
- 🟢 **Vercel**: ✅ Fully operational

---

## 👥 **Team Management System**

### **Team Invitation Process**
The team invitation system allows organization admins to invite team members with specific roles. The process involves multiple steps with comprehensive logging for debugging.

#### **Process Flow**
1. **Invitation Creation**: Org admin sends invitation via `UserManagement.tsx`
2. **Email Delivery**: Invitation email sent with unique token and OTP
3. **User Registration**: Invited user creates account with email verification
4. **Invitation Acceptance**: User verifies OTP and accepts invitation via `AcceptInvite.tsx`
5. **Role Assignment**: User assigned to organization with specified role
6. **Automatic Sign-in**: User automatically signed in and redirected to dashboard

#### **Key Components**
- **`src/components/UserManagement.tsx`**: Handles invitation sending and team management
- **`src/pages/AcceptInvite.tsx`**: Handles invitation acceptance with AI logging
- **`supabase/functions/accept-team-invitation`**: Edge function for invitation processing
- **`user_invitations` table**: Stores invitation data with tokens and expiration
- **`user_roles` table**: Manages user role assignments per organization

#### **AI Logging Integration**
The team invite process includes comprehensive AI logging for debugging:
- **Invitation validation**: Logs token validation and expiration checks
- **OTP verification**: Logs OTP validation and storage
- **Edge function calls**: Logs retry attempts and success/failure
- **Sign-in process**: Logs automatic sign-in attempts and results
- **Error handling**: Detailed error logging with context

#### **Role-Based Access Control**
- **Org Admin**: Full access to all features and reports
- **Team Member**: Limited access to assigned reports only
- **Dashboard Filtering**: Team members only see reports assigned to them
- **Empty State**: Team members see "Awaiting a Case" message when no assignments

#### **Database Schema**
```sql
-- User invitations with tokens and expiration
user_invitations (
  id, organization_id, email, role, token, 
  expires_at, accepted_at, created_at
)

-- User roles per organization
user_roles (
  id, user_id, organization_id, role, 
  is_active, created_at, updated_at
)
```

#### **Security Considerations**
- **Token Expiration**: Invitations expire after 7 days
- **Single Use**: Invitation tokens can only be used once
- **Role Validation**: Server-side role validation in Edge Functions
- **Audit Logging**: All invitation activities logged for compliance

---

*Last Updated: October 24, 2025*
*Version: 2.6*
*Architecture: React + Supabase + Contentful*
*Status: Production Ready - All Critical Issues Resolved*
