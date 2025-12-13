# Action Plan Summary

## ✅ Completed Steps

### 1. Diagnosed Reports Issue
- **Root Cause Identified**: RLS policy change from September 7, 2025 requires users to have specific roles (`'admin'`, `'case_handler'`, or `'org_admin'`)
- **Diagnostic Script Created**: `scripts/diagnose-reports-issue.ts` - Run with `npm run diagnose-reports <email>`
- **Documentation Created**: `REPORTS_ISSUE_DIAGNOSIS.md` - Complete troubleshooting guide

### 2. Prepared Cleanup Script
- **Cleanup Script Created**: `scripts/cleanup-vite-frontend.sh` - Safely removes Vite frontend
- **Script Features**:
  - Creates git backup before cleanup
  - Removes frontend source files (`src/`, `public/`, etc.)
  - Cleans up `package.json` dependencies
  - Updates README for backend-only repo
  - Removes frontend config files

## 📋 Next Steps (In Order)

### Step 1: Fix Reports Issue in Next.js App

**Priority: HIGH** - Do this first before cleanup

1. **Run Diagnostic**:
   ```bash
   export SUPABASE_SERVICE_ROLE_KEY="your-key"
   npm run diagnose-reports your-email@example.com
   ```

2. **Check User Role**:
   - If user doesn't have `'admin'`, `'case_handler'`, or `'org_admin'` role, update it:
     ```sql
     UPDATE profiles SET role = 'org_admin' WHERE id = '<user-id>';
     ```

3. **Verify Next.js App**:
   - Check Supabase client setup (should use `@supabase/ssr`)
   - Verify middleware is refreshing auth sessions
   - Check browser console for RLS errors
   - See `REPORTS_ISSUE_DIAGNOSIS.md` for detailed steps

4. **Test Reports Display**:
   - Log into Next.js app
   - Verify reports are visible
   - Check browser console for errors

### Step 2: Verify Next.js App is Fully Working

**Priority: HIGH** - Ensure everything works before cleanup

- [ ] Reports are visible
- [ ] Dashboard loads correctly
- [ ] All features work (create, edit, delete reports)
- [ ] Authentication works
- [ ] No console errors

### Step 3: Run Cleanup Script

**Priority: MEDIUM** - Only after Steps 1 & 2 are complete

1. **Review the cleanup script**:
   ```bash
   cat scripts/cleanup-vite-frontend.sh
   ```

2. **Run the cleanup**:
   ```bash
   ./scripts/cleanup-vite-frontend.sh
   ```
   
   The script will:
   - Ask for confirmation
   - Create a git backup commit
   - Remove frontend files
   - Clean up dependencies
   - Update README

3. **Review changes**:
   ```bash
   git status
   git diff
   ```

4. **Test backend still works**:
   - Test Supabase functions
   - Verify migrations can run
   - Check API routes (if any)

5. **Commit cleanup**:
   ```bash
   git add -A
   git commit -m "Remove Vite frontend - migrated to Next.js"
   git push
   ```

### Step 4: Update CI/CD (If Applicable)

**Priority: LOW** - After cleanup

- [ ] Remove frontend build steps from CI/CD
- [ ] Update deployment scripts
- [ ] Update documentation references

## 🔍 Key Files Created

1. **`scripts/diagnose-reports-issue.ts`**
   - Diagnostic script to check user profile and RLS access
   - Usage: `npm run diagnose-reports <email>`

2. **`scripts/cleanup-vite-frontend.sh`**
   - Safe cleanup script for removing Vite frontend
   - Creates backups before cleanup

3. **`REPORTS_ISSUE_DIAGNOSIS.md`**
   - Complete troubleshooting guide for reports issue
   - Includes Next.js setup instructions
   - SQL fixes for common issues

4. **`ACTION_PLAN_SUMMARY.md`** (this file)
   - Step-by-step action plan
   - Checklist for completion

## ⚠️ Important Notes

1. **Don't run cleanup until reports issue is fixed** - You need to verify the Next.js app works first

2. **The cleanup script creates a backup** - But still review changes before committing

3. **Keep `package.json.backup`** - Until you're confident everything works

4. **Test Supabase functions** - After cleanup, verify Edge Functions still work

5. **Update documentation** - After cleanup, update any docs that reference the frontend

## 🐛 Troubleshooting

### If Reports Still Don't Show After Fixing Role

1. Check Next.js app Supabase client setup
2. Verify middleware is refreshing sessions
3. Check browser console for RLS errors
4. Run diagnostic script again
5. Check Supabase logs for policy violations

### If Cleanup Script Fails

1. Check git status - script creates backup commit first
2. Review error message
3. Manually undo changes if needed: `git reset --hard HEAD~1`
4. Check file permissions: `chmod +x scripts/cleanup-vite-frontend.sh`

### If Backend Breaks After Cleanup

1. Restore from backup: `git reset --hard HEAD~1`
2. Check what was removed
3. Verify you're not importing frontend code in backend files
4. Test Supabase functions individually

## 📞 Support

If you encounter issues:
1. Check `REPORTS_ISSUE_DIAGNOSIS.md` for reports issue
2. Review cleanup script output
3. Check git history for what changed
4. Verify Next.js app is using correct Supabase setup
