
# Disclosurely Project Plan: Launch Roadmap

## Current Status
- ✅ Basic authentication system with Google OAuth
- ✅ Protected routes and dashboard structure  
- ✅ Supabase integration with encrypted report storage
- ✅ Landing page and branding completed

## Phase 1: Foundation & Authentication (✅ Completed)
- [x] Basic authentication system with Google OAuth
- [x] Protected routes and dashboard structure
- [x] Supabase integration with encrypted report storage
- [x] Landing page and branding

## Phase 2: Organization Management & Unique Links (Priority 1)
**Goal**: Enable organizations to generate unique submission links for their workforce

### 2.1 Organization Setup System
- Create organization onboarding flow after user signup
- Implement organization profile management (branding, settings)
- Set up organization-specific domains/subdomains system

### 2.2 Unique Link Generation System
- Build link generator in dashboard for organizations
- Create customizable link parameters (department, location, etc.)
- Implement link analytics and tracking
- Add link expiration and usage limits options

### 2.3 Dynamic Form Landing Pages
- Create dynamic landing pages based on unique links
- Implement organization branding on submission forms
- Add custom fields per organization/link
- Build mobile-responsive submission interface

## Phase 3: Enhanced Dashboard & Report Management (Priority 2)
**Goal**: Complete the subscriber management dashboard

### 3.1 Report Management Interface
- Build comprehensive report viewing system
- Implement case assignment and delegation
- Create internal notes and communication system
- Add report status workflow (new → in progress → resolved)

### 3.2 User Role Management
- Implement role-based access control (Admin, Case Handler, Reviewer)
- Create user invitation system for organizations
- Build permission management interface

### 3.3 Secure Communication System
- Implement two-way encrypted messaging between whistleblowers and organization
- Build notification system for new reports/messages
- Create secure file sharing capability

## Phase 4: Security & Compliance Features (Priority 3)
**Goal**: Ensure enterprise-grade security and compliance

### 4.1 Advanced Security Features
- Implement multi-factor authentication (MFA)
- Add audit trail system for all actions
- Build data retention and deletion policies
- Create security monitoring dashboard

### 4.2 Compliance Features
- GDPR compliance tools (data export, deletion requests)
- Generate compliance reports
- Implement data anonymization features
- Add legal hold capabilities

## Phase 5: Launch Preparation (Priority 4)
**Goal**: Prepare for production launch

### 5.1 Production Infrastructure
- Set up production Supabase environment
- Configure CDN and performance optimization
- Implement monitoring and alerting
- Set up backup and disaster recovery

### 5.2 Launch Features
- Create public website with pricing
- Build subscription and billing system
- Implement customer onboarding flow
- Add support documentation and help center

## Key Technical Considerations for Unique Links

### Link Structure Approach:
```
https://app.disclosurely.com/submit/[org-slug]/[unique-token]
```

### Database Changes Needed:
1. **Organization Links Table**: Store generated links with metadata
2. **Link Analytics Table**: Track usage and submissions per link
3. **Custom Fields Table**: Store organization-specific form fields

### Form-to-Dashboard Communication:
1. **Encrypted Submission Pipeline**: Form submissions encrypted with organization keys
2. **Real-time Notifications**: Dashboard receives instant notifications of new submissions
3. **Link Attribution**: Each report tagged with originating link for analytics

## Estimated Timeline:
- **Phase 2**: 2-3 weeks (Core functionality)
- **Phase 3**: 3-4 weeks (Dashboard completion)
- **Phase 4**: 2-3 weeks (Security & compliance)
- **Phase 5**: 1-2 weeks (Launch prep)

**Total: 8-12 weeks to launch**

## Next Immediate Steps:
1. Create organization management system
2. Build unique link generation interface
3. Implement dynamic form routing based on links
4. Test the complete flow from link generation to report submission to dashboard viewing

## Focus Areas:
- **Primary**: Unique link generation and form-to-dashboard communication
- **Secondary**: Complete dashboard functionality
- **Tertiary**: Security and compliance features
- **Final**: Launch preparation and production deployment
