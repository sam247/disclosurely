# Team Management

Manage your team members, assign roles, send invitations, and control access to your Disclosurely organization.

## User Roles Overview

Disclosurely uses role-based access control with four primary roles:

### Admin
**Full system access** including:
- All reports and cases
- Team management (add/remove users)
- Organization settings
- Billing and subscription management
- Custom domain configuration
- All compliance modules
- System configuration

**Best for**: IT administrators, compliance officers, system owners

### Org Admin  
**Organization-level administration**:
- View and manage all reports
- Team management (invite/remove members)
- Organization settings
- Custom branding
- Compliance management
- Analytics and reporting
- **Cannot modify billing**

**Best for**: HR directors, legal team, department heads

### Case Handler
**Day-to-day case management**:
- View assigned reports
- Update report status
- Add case notes
- Send messages to whistleblowers
- Assign reports to team members
- Access analytics
- **Cannot modify organization settings**

**Best for**: Investigators, compliance team, case managers

### Reviewer
**Read-only access**:
- View assigned reports
- Read messages and notes
- Access analytics
- **Cannot modify cases or settings**

**Best for**: Auditors, oversight roles, board members

## Inviting Team Members

### Send an Invitation

1. Navigate to **Dashboard > Team**
2. Click **"Invite Team Member"** button
3. Fill in invitation form:
   - **Email Address**: Invitee's work email
   - **Role**: Select appropriate role
   - **First Name**: Optional, personalizes invitation
   - **Last Name**: Optional
   - **Custom Message**: Optional welcome message
4. Click **"Send Invitation"**

### What Happens Next

**Invitee Receives**:
- Email with invitation link
- Information about your organization
- Role assignment details
- Expiration notice (7 days)
- Instructions to create account

**Invitation Process**:
1. Invitee clicks link in email
2. Creates Disclosurely account
3. Sets up password
4. Automatically added to your organization
5. Role is assigned

### Managing Invitations

**View Pending Invitations**:
- Navigate to **Team > Invitations**
- See all pending invitations
- Check status and expiration

**Resend Invitation**:
- Click **Resend** next to expired invitation
- Generates new invitation link
- Resets 7-day expiration timer

**Cancel Invitation**:
- Click **Cancel** next to pending invitation
- Invitee can no longer accept
- Can send new invitation if needed

## Managing Team Members

### View Team Members

Navigate to **Dashboard > Team** to see:
- All active team members
- Their roles
- Last login date
- Account status
- Contact information

### Edit Team Member

**Change Role**:
1. Click on team member
2. Select **"Edit Role"**
3. Choose new role
4. Click **"Save"**
5. Changes take effect immediately

**Update Information**:
- Edit name, email (requires verification)
- Update phone number
- Modify department or title

### Deactivate Team Member

**When employee leaves**:
1. Click on team member
2. Select **"Deactivate Account"**
3. Confirm deactivation
4. User loses access immediately
5. Can be reactivated later if needed

**What Happens**:
- User cannot log in
- Assigned cases remain
- Audit history preserved
- No data is deleted
- Subscription seat freed (Pro/Enterprise)

### Remove Team Member

**Permanently remove**:
1. Click on team member
2. Select **"Remove from Organization"**
3. Type member's email to confirm
4. Click **"Remove"**

**What Happens**:
- User removed from organization
- Cannot access your data
- Audit logs maintained
- Assigned cases need reassignment

## Role Permissions Matrix

| Permission | Admin | Org Admin | Case Handler | Reviewer |
|------------|-------|-----------|--------------|----------|
| View all reports | ✅ | ✅ | ✅ | ❌ View assigned only |
| Create/edit reports | ✅ | ✅ | ✅ | ❌ |
| Delete reports | ✅ | ✅ | ❌ | ❌ |
| Assign cases | ✅ | ✅ | ✅ | ❌ |
| Add case notes | ✅ | ✅ | ✅ | ❌ |
| Send messages | ✅ | ✅ | ✅ | ❌ |
| View analytics | ✅ | ✅ | ✅ Limited | ✅ Limited |
| Manage team | ✅ | ✅ | ❌ | ❌ |
| Organization settings | ✅ | ✅ | ❌ | ❌ |
| Billing | ✅ | ❌ | ❌ | ❌ |
| Custom branding | ✅ | ✅ | ❌ | ❌ |
| Custom domains | ✅ | ✅ | ❌ | ❌ |
| Compliance modules | ✅ | ✅ | ✅ Limited | ✅ View only |
| Audit logs | ✅ | ✅ | ❌ | ✅ View only |
| API access | ✅ | ❌ | ❌ | ❌ |

## Best Practices

### Onboarding New Team Members

1. **Send invitation** with role appropriate to duties
2. **Provide training** on platform usage
3. **Assign test case** for practice
4. **Share documentation** links
5. **Set up 1-on-1** to answer questions
6. **Monitor first cases** for quality

### Team Structure Recommendations

**Small Organization (1-10 employees)**:
- 1 Admin
- 1-2 Case Handlers

**Medium Organization (11-100 employees)**:
- 1-2 Admins
- 1 Org Admin
- 2-4 Case Handlers
- 1 Reviewer (optional)

**Large Organization (100+ employees)**:
- 2-3 Admins
- 2-3 Org Admins
- 5-10 Case Handlers
- 2-3 Reviewers

### Security Best Practices

✅ **Review team access quarterly**
✅ **Remove access immediately upon employee departure**
✅ **Use principle of least privilege** (minimum necessary access)
✅ **Require strong passwords**
✅ **Enable MFA for administrators**
✅ **Monitor login activity**
✅ **Regular training on data handling**

## Troubleshooting

**Invitation not received**:
- Check spam/junk folder
- Verify email address is correct
- Resend invitation
- Try different email address

**Can't change someone's role**:
- Ensure you have Admin or Org Admin rights
- User must not be only Admin (keep one Admin always)
- User must be active

**Team member can't access cases**:
- Verify their role permissions
- Check if cases are assigned to them
- Ensure account is active
- Check for system-wide access issues

## Billing Impact

**Pro Plan**:
- Seats included: 5 team members
- Additional seats: £5/user/month
- Add/remove users anytime
- Prorated billing

**Enterprise Plan**:
- Custom seat count
- Volume discounts available
- Annual billing options
- Dedicated support

See [Subscription & Billing](/admin/subscription-billing) for details.

---

**Next Steps:**
- [Organization Settings](/admin/organization-settings)
- [User Guides](/guides/administrators)
- [Security & Access Control](/security/access-control)
