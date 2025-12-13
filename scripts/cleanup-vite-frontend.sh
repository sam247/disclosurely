#!/bin/bash
# Script to safely remove Vite frontend from this repo
# This makes this repo backend-only (Supabase functions, migrations, API routes)

set -e  # Exit on error

echo "🧹 Starting Vite frontend cleanup..."
echo "⚠️  This will remove the React/Vite frontend from this repo"
echo "⚠️  Make sure your Next.js app (disclosurely-site) is fully working first!"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Cleanup cancelled"
  exit 1
fi

echo ""
echo "📋 Step 1: Creating backup of current state..."
git add -A
git commit -m "Backup before removing Vite frontend" || echo "No changes to commit"

echo ""
echo "📋 Step 2: Removing frontend source files..."
rm -rf src/
rm -rf public/
rm -f index.html
rm -f vite.config.ts
rm -f tsconfig.app.json
rm -f vitest.config.ts
rm -f playwright.config.ts
rm -rf e2e/

echo "   ✅ Removed src/, public/, and config files"

echo ""
echo "📋 Step 3: Cleaning up package.json dependencies..."

# Create a backup
cp package.json package.json.backup

# Remove frontend-specific dependencies (keep backend/utility ones)
# We'll use a Node script for this as it's more reliable
node << 'EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Dependencies to remove (frontend-specific)
const frontendDeps = [
  '@contentful/rich-text-html-renderer',
  '@contentful/rich-text-react-renderer',
  '@contentful/rich-text-types',
  '@hookform/resolvers',
  '@openredaction/openredaction',
  '@radix-ui/react-accordion',
  '@radix-ui/react-alert-dialog',
  '@radix-ui/react-aspect-ratio',
  '@radix-ui/react-avatar',
  '@radix-ui/react-checkbox',
  '@radix-ui/react-collapsible',
  '@radix-ui/react-context-menu',
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-hover-card',
  '@radix-ui/react-label',
  '@radix-ui/react-menubar',
  '@radix-ui/react-navigation-menu',
  '@radix-ui/react-popover',
  '@radix-ui/react-progress',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-scroll-area',
  '@radix-ui/react-select',
  '@radix-ui/react-separator',
  '@radix-ui/react-slider',
  '@radix-ui/react-slot',
  '@radix-ui/react-switch',
  '@radix-ui/react-tabs',
  '@radix-ui/react-toast',
  '@radix-ui/react-toggle',
  '@radix-ui/react-toggle-group',
  '@radix-ui/react-tooltip',
  '@sentry/react',
  '@sentry/vite-plugin',
  '@tanstack/react-query',
  '@tiptap/extension-image',
  '@tiptap/extension-link',
  '@tiptap/extension-placeholder',
  '@tiptap/react',
  '@tiptap/starter-kit',
  '@types/dompurify',
  '@types/papaparse',
  'chart.js',
  'class-variance-authority',
  'clsx',
  'cmdk',
  'contentful',
  'crypto-js',
  'date-fns',
  'dompurify',
  'embla-carousel-react',
  'i18next',
  'i18next-browser-languagedetector',
  'input-otp',
  'jspdf',
  'jspdf-autotable',
  'lucide-react',
  'micro',
  'next-themes',
  'papaparse',
  'react',
  'react-chartjs-2',
  'react-day-picker',
  'react-dom',
  'react-helmet-async',
  'react-hook-form',
  'react-i18next',
  'react-resizable-panels',
  'react-router-dom',
  'recharts',
  'sonner',
  'tailwind-merge',
  'tailwindcss-animate',
  'vaul',
  'zod'
];

// DevDependencies to remove
const frontendDevDeps = [
  '@playwright/test',
  '@testing-library/jest-dom',
  '@testing-library/react',
  '@testing-library/user-event',
  '@types/react',
  '@types/react-dom',
  '@vitejs/plugin-react-swc',
  '@vitest/coverage-v8',
  '@vitest/ui',
  'happy-dom',
  'jsdom',
  'playwright',
  'vitest'
];

// Remove from dependencies
frontendDeps.forEach(dep => {
  delete pkg.dependencies[dep];
});

// Remove from devDependencies
frontendDevDeps.forEach(dep => {
  delete pkg.devDependencies[dep];
});

// Update scripts - remove frontend build/test scripts
pkg.scripts = {
  "test": "echo 'No tests configured'",
  "lint": "eslint .",
  "diagnose-reports": "tsx scripts/diagnose-reports-issue.ts"
};

// Update description
pkg.description = "Disclosurely backend - Supabase Edge Functions, migrations, and API routes";

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('   ✅ Cleaned up package.json');
EOF

echo ""
echo "📋 Step 4: Removing frontend build artifacts..."
rm -rf dist/
rm -rf .vite/
rm -rf node_modules/.vite/
rm -rf coverage/
rm -rf test-results/
rm -rf playwright-report/

echo "   ✅ Removed build artifacts"

echo ""
echo "📋 Step 5: Updating .gitignore..."
# Remove frontend-specific ignores, keep backend ones
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo

# Supabase
.branches/
.temp/
.supabase/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
Thumbs.db
EOF

echo "   ✅ Updated .gitignore"

echo ""
echo "📋 Step 6: Updating README..."
cat > README.md << 'EOF'
# Disclosurely Backend

**Backend repository for Disclosurely - Supabase Edge Functions, migrations, and API routes**

> **Note**: The frontend has been migrated to Next.js in a separate repository: [disclosurely-site](https://github.com/sam247/disclosurely-site)

🌐 **Website**: https://disclosurely.com  
📚 **Documentation**: https://docs.disclosurely.com  
📧 **Support**: support@disclosurely.com

---

## What is This Repository?

This repository contains the backend infrastructure for Disclosurely:

- **Supabase Edge Functions** - Serverless functions for business logic
- **Database Migrations** - PostgreSQL schema and RLS policies
- **API Routes** - Vercel serverless functions (if any)
- **Shared Utilities** - Backend utilities and helpers

---

## Technology Stack

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Edge Functions**: Supabase Edge Functions (Deno)
- **Hosting**: Vercel (for API routes)
- **Migrations**: Supabase CLI

---

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase CLI
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/sam247/disclosurely.git
cd disclosurely

# Install dependencies
npm install

# Set up Supabase CLI
supabase login
supabase link --project-ref <your-project-ref>
```

---

## Development

### Edge Functions

```bash
# List functions
ls supabase/functions/

# Deploy a function
supabase functions deploy <function-name>

# Test locally
supabase functions serve <function-name>
```

### Database Migrations

```bash
# Create a new migration
supabase migration new <migration-name>

# Apply migrations
supabase db push

# Reset database (⚠️ destructive)
supabase db reset
```

### Diagnostics

```bash
# Diagnose reports access issues
npm run diagnose-reports <user-email>
```

---

## Project Structure

```
disclosurely/
├── supabase/
│   ├── functions/         # Edge Functions (Deno)
│   └── migrations/        # Database migrations
├── api/                   # Vercel API routes (if any)
├── scripts/               # Utility scripts
└── package.json           # Backend dependencies
```

---

## Security

- ✅ **Row Level Security (RLS)** - Database-level access control
- ✅ **No Hardcoded Secrets** - All secrets via environment variables
- ✅ **Audit Logging** - Comprehensive audit trails
- ✅ **Rate Limiting** - Protection against abuse

**⚠️ Important**: Never commit secrets or API keys. Always use environment variables.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Related Repositories

- **Frontend**: [disclosurely-site](https://github.com/sam247/disclosurely-site) - Next.js frontend application
- **Documentation**: See frontend repo for docs

---

## License

Proprietary - All rights reserved

---

## Support

- **Email**: support@disclosurely.com
- **Documentation**: https://docs.disclosurely.com

---

**Built with ❤️ for secure, ethical workplaces**
EOF

echo "   ✅ Updated README.md"

echo ""
echo "📋 Step 7: Removing frontend-specific config files..."
rm -f components.json  # shadcn/ui config
rm -f tailwind.config.js 2>/dev/null || true
rm -f postcss.config.js 2>/dev/null || true
rm -f .eslintrc.cjs 2>/dev/null || true
rm -f .eslintrc.json 2>/dev/null || true

echo "   ✅ Removed frontend config files"

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Review the changes: git status"
echo "   2. Test that Supabase functions still work"
echo "   3. Commit the changes: git add -A && git commit -m 'Remove Vite frontend - migrated to Next.js'"
echo "   4. Update any CI/CD pipelines to remove frontend build steps"
echo ""
echo "⚠️  Note: You may want to keep package.json.backup for reference"
echo "   Delete it when you're confident everything works: rm package.json.backup"
