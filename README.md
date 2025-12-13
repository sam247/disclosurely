# Disclosurely Backend

**Backend repository for Disclosurely - Supabase Edge Functions, migrations, and API routes**

> **Note**: The frontend has been migrated to Next.js in a separate repository: [disclosurely-site](https://github.com/sam247/disclosurely-site)

🌐 **Website**: https://disclosurely.com  
📚 **Documentation**: https://docs.disclosurely.com  
📧 **Support**: support@disclosurely.com

---

## What is This Repository?

This repository contains the backend infrastructure for Disclosurely:

- **Supabase Edge Functions** - Serverless functions for business logic (60+ functions)
- **Database Migrations** - PostgreSQL schema and RLS policies (200+ migrations)
- **API Routes** - Vercel serverless functions (if any)
- **Shared Utilities** - Backend utilities and helpers

---

## Technology Stack

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Edge Functions**: Supabase Edge Functions (Deno)
- **Hosting**: Vercel (for API routes)
- **Migrations**: Supabase CLI
- **Language**: TypeScript

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

**Note**: Requires `SUPABASE_SERVICE_ROLE_KEY` environment variable to be set.

---

## Project Structure

```
disclosurely/
├── supabase/
│   ├── functions/         # Edge Functions (Deno)
│   │   ├── _shared/       # Shared utilities
│   │   └── [function-name]/  # Individual functions
│   └── migrations/        # Database migrations (200+)
├── api/                   # Vercel API routes (if any)
├── scripts/               # Utility scripts
│   ├── diagnose-reports-issue.ts  # Diagnostic tool
│   └── cleanup-vite-frontend.sh   # Cleanup script (archived)
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

## Key Edge Functions

Some of the key Edge Functions in this repository:

- `submit-anonymous-report` - Handle anonymous report submissions
- `anonymous-report-messaging` - Two-way encrypted messaging
- `analyze-case-with-ai` - AI-powered case analysis
- `process-gdpr-requests` - GDPR compliance handling
- `stripe-webhook` - Payment processing
- `send-notification-emails` - Email notifications
- And 50+ more...

See `supabase/functions/` for the complete list.

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
- **Documentation**: See frontend repo for user documentation

---

## License

Proprietary - All rights reserved

---

## Support

- **Email**: support@disclosurely.com
- **Documentation**: https://docs.disclosurely.com

---

**Built with ❤️ for secure, ethical workplaces**
