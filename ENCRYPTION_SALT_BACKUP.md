# CRITICAL: ENCRYPTION_SALT Backup

**⚠️ NEVER ROTATE THIS SALT WITHOUT A MIGRATION PLAN**

## Current Salt Status
- **Location**: Supabase Edge Function Secrets
- **Secret Name**: `ENCRYPTION_SALT`
- **Set Date**: January 31, 2025 (after near-catastrophic salt change incident)
- **Backup Location**: [Store in your password manager - DO NOT commit to git]

## ⚠️ CRITICAL RULES

1. **NEVER change this salt** without a complete migration plan
2. **NEVER delete this secret** from Supabase
3. **ALWAYS backup** before any changes
4. **Document all changes** in migration files
5. **Test on staging** before production

## Impact of Salt Change

Changing this salt will cause:
- **ALL existing encrypted reports** become permanently unreadable
- **ALL existing encrypted messages** become permanently unreadable
- **Data loss is PERMANENT and IRREVERSIBLE**
- **No recovery possible** without the old salt

## Edge Functions Using This Salt

1. `encrypt-report-data` - Encrypts new reports
2. `decrypt-report-data` - Decrypts reports for authorized users
3. `anonymous-report-messaging` - Encrypts/decrypts messages

All three functions check for `ENCRYPTION_SALT` on startup and will fail fast if missing.

## Backup Instructions

### Recommended Storage Locations

1. **Password Manager** (1Password, LastPass, Bitwarden, etc.)
   - Create entry: "Disclosurely ENCRYPTION_SALT"
   - Store value securely
   - Tag as "Critical" / "Production Secret"

2. **Secure Document Storage**
   - Encrypted file (PGP, AES-256)
   - Store in secure location (not in codebase)

3. **Disaster Recovery Plan**
   - Include in your disaster recovery documentation
   - Ensure multiple team members have access (if applicable)

### DO NOT Store In:
- ❌ Git repository
- ❌ Code files
- ❌ Public documentation
- ❌ Environment files checked into git
- ❌ Supabase dashboard only (must have backup)

## Verification

To verify the salt is set correctly:

```bash
# Check Supabase Edge Function secrets
supabase secrets list

# Or check in Supabase Dashboard:
# Settings > Edge Functions > Secrets
```

## Incident History

**January 31, 2025**: Near-catastrophic salt change incident
- Old salt was lost/not backed up
- New salt was set without migration plan
- All test reports encrypted with old salt permanently lost
- **Lesson Learned**: Salt must be backed up and never changed without migration

## Migration Plan (If Salt Must Change)

If you ever need to change the salt (for security reasons):

1. **Backup old salt** securely
2. **Implement dual-salt support**:
   - Decrypt with old salt (for existing data)
   - Encrypt with new salt (for new data)
3. **Create migration Edge Function** to re-encrypt all data
4. **Test thoroughly** on staging environment
5. **Execute migration** in production during maintenance window
6. **Verify all data** is accessible
7. **Remove old salt support** after verification
8. **Update documentation**

This is a complex operation requiring careful planning and testing.

## Monitoring

The system now includes:
- Encryption salt audit table (`encryption_salt_audit`)
- Startup checks in all Edge Functions
- Verification functions

Check the audit table regularly to ensure salt hasn't been changed unexpectedly.

## Emergency Contacts

If the salt is lost or corrupted:
- **Immediate Action**: All encrypted data becomes inaccessible
- **No Recovery**: Without the salt, data cannot be decrypted
- **Prevention**: Multiple secure backups are essential

---

**Last Updated**: January 31, 2025  
**Maintained By**: [Your Name/Team]  
**Review Frequency**: Quarterly

