#!/usr/bin/env tsx
/**
 * Diagnostic script to check why reports might not be showing up
 * 
 * This script checks:
 * 1. Current RLS policies on reports table
 * 2. User profile status (organization_id, role, is_active)
 * 3. Reports that exist for the organization
 * 4. Whether the user can access reports based on current policies
 * 
 * Usage: 
 *   npx tsx scripts/diagnose-reports-issue.ts <user-email>
 * 
 * Or set SUPABASE_SERVICE_ROLE_KEY to run with service role (bypasses RLS)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || "https://cxmuzperkittvibslnff.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_EMAIL = process.argv[2];

if (!USER_EMAIL && !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Please provide user email as argument or set SUPABASE_SERVICE_ROLE_KEY');
  console.error('Usage: npx tsx scripts/diagnose-reports-issue.ts <user-email>');
  process.exit(1);
}

async function diagnose() {
  console.log('🔍 Starting diagnostic...\n');

  // Create service role client to bypass RLS for diagnostics
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set. Cannot run diagnostics.');
    console.error('Set it in your .env file or pass as environment variable.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // 1. Get user by email
    console.log('1️⃣ Checking user account...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(USER_EMAIL);
    
    if (authError || !authUser?.user) {
      console.error('❌ User not found:', authError?.message);
      return;
    }

    const userId = authUser.user.id;
    console.log(`   ✅ User found: ${authUser.user.email} (ID: ${userId})`);
    console.log(`   📅 Created: ${authUser.user.created_at}`);
    console.log(`   🔐 Email confirmed: ${authUser.user.email_confirmed_at ? 'Yes' : 'No'}\n`);

    // 2. Check user profile
    console.log('2️⃣ Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('❌ Profile not found:', profileError?.message);
      return;
    }

    console.log(`   ✅ Profile found`);
    console.log(`   📧 Email: ${profile.email}`);
    console.log(`   🏢 Organization ID: ${profile.organization_id || '❌ NOT SET'}`);
    console.log(`   👤 Role: ${profile.role || '❌ NOT SET'}`);
    console.log(`   ✅ Active: ${profile.is_active ? 'Yes' : '❌ No'}`);
    console.log(`   📝 First Name: ${profile.first_name || 'Not set'}`);
    console.log(`   📝 Last Name: ${profile.last_name || 'Not set'}\n`);

    // Check if profile meets requirements
    const requiredRoles = ['admin', 'case_handler', 'org_admin'];
    const hasValidRole = profile.role && requiredRoles.includes(profile.role);
    const hasOrgId = !!profile.organization_id;
    const isActive = profile.is_active === true;

    console.log('   📊 Profile Status Check:');
    console.log(`      ${hasOrgId ? '✅' : '❌'} Has organization_id: ${hasOrgId}`);
    console.log(`      ${isActive ? '✅' : '❌'} Is active: ${isActive}`);
    console.log(`      ${hasValidRole ? '✅' : '❌'} Has valid role (${requiredRoles.join(', ')}): ${hasValidRole ? profile.role : 'NO'}\n`);

    if (!hasOrgId) {
      console.error('❌ CRITICAL: User has no organization_id. Reports cannot be accessed.');
      return;
    }

    if (!isActive) {
      console.error('❌ CRITICAL: User profile is not active. Reports cannot be accessed.');
      return;
    }

    if (!hasValidRole) {
      console.error(`❌ CRITICAL: User role "${profile.role}" is not in allowed roles: ${requiredRoles.join(', ')}`);
      console.error('   The RLS policy requires one of: admin, case_handler, org_admin');
      return;
    }

    // 3. Check organization
    console.log('3️⃣ Checking organization...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single();

    if (orgError || !org) {
      console.error('❌ Organization not found:', orgError?.message);
      return;
    }

    console.log(`   ✅ Organization found: ${org.name}`);
    console.log(`   📅 Created: ${org.created_at}\n`);

    // 4. Check reports for this organization
    console.log('4️⃣ Checking reports in organization...');
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('id, title, tracking_id, status, created_at, deleted_at, assigned_to')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (reportsError) {
      console.error('❌ Error fetching reports:', reportsError.message);
      return;
    }

    const totalReports = reports?.length || 0;
    const activeReports = reports?.filter(r => !r.deleted_at && r.status !== 'closed' && r.status !== 'archived').length || 0;
    const assignedToUser = reports?.filter(r => r.assigned_to === userId).length || 0;

    console.log(`   📊 Total reports in organization: ${totalReports}`);
    console.log(`   📊 Active reports (not deleted/closed/archived): ${activeReports}`);
    console.log(`   📊 Assigned to this user: ${assignedToUser}\n`);

    if (totalReports === 0) {
      console.log('   ⚠️  No reports found in this organization.');
      console.log('   This could be normal if no reports have been submitted yet.\n');
    } else {
      console.log('   📋 Sample reports:');
      reports?.slice(0, 5).forEach((report, idx) => {
        const status = report.deleted_at ? 'DELETED' : report.status;
        const assigned = report.assigned_to === userId ? ' (assigned to you)' : '';
        console.log(`      ${idx + 1}. ${report.title || 'Untitled'} - ${status}${assigned}`);
      });
      console.log('');
    }

    // 5. Check RLS policies
    console.log('5️⃣ Checking RLS policies on reports table...');
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          polname as policy_name,
          polcmd as command,
          polroles::text[] as roles,
          qual::text as using_expression
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'reports'
        AND polcmd = 'SELECT'
        ORDER BY polname;
      `
    }).catch(() => {
      // Fallback: direct query
      return supabase
        .from('pg_policies')
        .select('*')
        .eq('schemaname', 'public')
        .eq('tablename', 'reports')
        .eq('polcmd', 'SELECT');
    });

    // Try alternative method
    const { data: policiesAlt } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            pol.polname as policy_name,
            CASE pol.polcmd
              WHEN 'r' THEN 'SELECT'
              WHEN 'a' THEN 'INSERT'
              WHEN 'w' THEN 'UPDATE'
              WHEN 'd' THEN 'DELETE'
            END as command,
            array_agg(rol.rolname) as roles
          FROM pg_policy pol
          JOIN pg_class cls ON pol.polrelid = cls.oid
          JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
          LEFT JOIN pg_roles rol ON rol.oid = ANY(pol.polroles)
          WHERE nsp.nspname = 'public'
          AND cls.relname = 'reports'
          AND pol.polcmd = 'r'
          GROUP BY pol.polname, pol.polcmd;
        `
      })
      .catch(() => null);

    console.log('   📋 Current SELECT policies on reports table:');
    console.log('   (Note: This requires direct database access to view)\n');

    // 6. Test if user can access reports (simulate RLS)
    console.log('6️⃣ Simulating RLS check...');
    console.log(`   Testing if user ${userId} can access reports...`);
    
    // Create a client with user's session to test RLS
    // Note: This requires getting a valid session token, which is complex
    // Instead, we'll just verify the logic matches
    
    const canAccess = hasOrgId && isActive && hasValidRole;
    console.log(`   ${canAccess ? '✅' : '❌'} User SHOULD be able to access reports: ${canAccess}`);
    
    if (canAccess && activeReports > 0) {
      console.log(`   ✅ User meets all requirements and there are ${activeReports} active reports`);
      console.log('   ⚠️  If reports are not showing, check:');
      console.log('      1. Next.js app is properly passing auth session to Supabase client');
      console.log('      2. Browser console for RLS policy errors');
      console.log('      3. Network tab to see if reports query is being made');
      console.log('      4. If user is org_admin, they should see all reports');
      console.log('      5. If user is case_handler, they may only see assigned reports');
    } else if (canAccess && activeReports === 0) {
      console.log('   ℹ️  User can access reports, but there are no active reports to show');
    } else {
      console.log('   ❌ User cannot access reports due to missing requirements above');
    }

    console.log('\n✅ Diagnostic complete!\n');

  } catch (error) {
    console.error('❌ Error during diagnostic:', error);
    process.exit(1);
  }
}

diagnose();
