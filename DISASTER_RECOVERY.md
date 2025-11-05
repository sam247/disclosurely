# Disaster Recovery Plan

## Critical Systems Overview

This document outlines disaster recovery procedures for critical Disclosurely infrastructure.

---

## Encryption Salt Management

### ⚠️ CRITICAL RULE

**NEVER change `ENCRYPTION_SALT` without a complete migration plan that includes:**
1. Secure backup of old salt
2. Migration script to re-encrypt all data
3. Rollback plan
4. Comprehensive testing on staging
5. Approval process

### Impact of Salt Change

Changing `ENCRYPTION_SALT` will cause:
- **ALL existing encrypted reports** become permanently unreadable
- **ALL existing encrypted messages** become permanently unreadable
- **Data loss is PERMANENT and IRREVERSIBLE**
- **No recovery possible** without the old salt

### If Salt Must Change (Production Data Exists)

**Required Steps:**

1. **Preparation Phase**
   - Export all encrypted data (backup)
   - Store old salt securely (multiple secure locations)
   - Document current salt value and creation date
   - Create migration Edge Function with dual-salt support

2. **Implementation Phase**
   - Implement dual-salt support:
     - Attempt decryption with new salt first
     - Fall back to old salt if new fails
     - Encrypt all new data with new salt
   - Create re-encryption Edge Function
   - Test thoroughly on staging environment
   - Run test migration on sample data

3. **Execution Phase**
   - Schedule maintenance window
   - Execute migration in production
   - Monitor for errors
   - Verify all data accessible
   - Confirm no data loss

4. **Cleanup Phase**
   - Verify all data re-encrypted with new salt
   - Remove old salt support code
   - Update documentation
   - Archive old salt securely

**This is a complex operation requiring:**
- 2-4 hour maintenance window
- Database backup before migration
- Rollback plan
- Multiple verification steps
- Team coordination

### Current Salt Status

- **Salt Location**: Supabase Edge Function Secrets
- **Secret Name**: `ENCRYPTION_SALT`
- **Set Date**: January 31, 2025
- **Last Verified**: January 31, 2025
- **Backup Location**: [Password Manager]
- **Status**: ✅ Active and verified

### Monitoring

The system includes:
- **Startup checks** in all Edge Functions
- **Audit table** (`encryption_salt_audit`) for tracking changes
- **Verification functions** for health checks

**Regular Checks:**
- Weekly: Verify salt exists in Supabase secrets
- Monthly: Review audit table for unexpected changes
- Quarterly: Verify backup is still accessible

---

## Database Recovery

### Backup Strategy

- **Frequency**: Daily automated backups
- **Retention**: 30 days
- **Location**: Supabase managed backups
- **Verification**: Weekly restore tests on staging

### Recovery Procedures

1. **Identify issue** and scope of data loss
2. **Determine recovery point** (last known good state)
3. **Restore from backup** via Supabase dashboard
4. **Verify data integrity**
5. **Notify affected users** if necessary

---

## Edge Function Recovery

### Function Deployment Issues

If an Edge Function deployment fails:
1. Check Edge Function logs for errors
2. Verify environment variables are set
3. Rollback to previous version if needed
4. Test locally before redeploying

### Environment Variable Issues

If environment variables are missing:
1. Check Supabase Dashboard > Settings > Edge Functions > Secrets
2. Verify all required secrets are present
3. Check function logs for specific missing variables
4. Set missing variables immediately

---

## Storage Recovery

### Bucket Corruption

If storage buckets are corrupted:
1. Verify bucket policies are correct
2. Check RLS policies on storage.objects
3. Restore from backup if needed
4. Re-upload files if necessary

---

## Incident Response

### Critical Issues

1. **Immediate**: Stop all deployments
2. **Assess**: Determine scope and impact
3. **Contain**: Prevent further data loss
4. **Recover**: Restore from backup if possible
5. **Document**: Record incident details
6. **Review**: Post-incident analysis

### Communication

- **Internal**: Immediate notification to team
- **External**: Notify affected users if data loss occurs
- **Documentation**: Update disaster recovery plan with lessons learned

---

## Prevention Measures

### Regular Checks

- **Daily**: Monitor Edge Function logs for errors
- **Weekly**: Verify critical environment variables
- **Monthly**: Review audit logs
- **Quarterly**: Test disaster recovery procedures

### Safeguards

- **Multiple backups** of critical secrets
- **Version control** for all migrations
- **Staging environment** for testing
- **Audit trails** for all changes
- **Documentation** for all procedures

---

## Emergency Contacts

- **Technical Lead**: [Your Contact]
- **Supabase Support**: support@supabase.com
- **Vercel Support**: [Support Channel]

---

**Last Updated**: January 31, 2025  
**Next Review**: April 30, 2025  
**Maintained By**: [Your Name/Team]

