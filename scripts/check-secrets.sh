#!/bin/bash
# scripts/check-secrets.sh
# Pre-deployment script to check for hardcoded secrets

echo "🔍 Checking for hardcoded secrets..."

ERRORS=0

# Exclude build artifacts and node_modules
EXCLUDE_DIRS="--exclude-dir=dist --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=build"

# Check for Contentful token pattern (only in source files)
if grep -r $EXCLUDE_DIRS "e3JfeWQKBvfCQoqi22f6F_XzWgbZPXR9JWTyuSTGcFw" --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null; then
  echo "❌ ERROR: Hardcoded Contentful token found!"
  ERRORS=$((ERRORS + 1))
fi

# Check for GA4 secret pattern (only in source files)
if grep -r $EXCLUDE_DIRS "8PERvggaTUublSyLXCDB8A" --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null; then
  echo "❌ ERROR: Hardcoded GA4 secret found!"
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
  echo "✅ No hardcoded secrets found in source files"
  exit 0
else
  echo "❌ Found $ERRORS hardcoded secret(s). Please remove them before deploying."
  exit 1
fi

