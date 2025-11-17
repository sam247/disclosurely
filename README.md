# Disclosurely

**Secure, GDPR-compliant whistleblowing SaaS platform**

🌐 **Website**: https://disclosurely.com  
📚 **Documentation**: https://docs.disclosurely.com  
📧 **Support**: support@disclosurely.com

---

## What is Disclosurely?

Disclosurely is a secure, GDPR-compliant whistleblowing SaaS platform that enables organizations to receive, manage, and resolve misconduct reports safely and anonymously.

### Core Features

- 🔒 **Secure Anonymous Reporting** - End-to-end encryption, no login required
- 📂 **Case Management Dashboard** - Comprehensive tools for managing reports
- 📨 **Two-Way Encrypted Communication** - Secure messaging between reporters and handlers
- 🌍 **GDPR / UK GDPR Compliance** - Built-in compliance features
- 🤖 **AI-Powered Analysis** - Smart case categorization and risk assessment
- 💬 **24/7 AI Chat Support** - Instant help with "Speak to Human" option
- 🎨 **Custom Branding** - White-label capabilities with custom domains
- 👥 **Team Management** - Role-based access control
- 📊 **Analytics & Reporting** - Comprehensive compliance analytics
- 🎁 **Referral Program** - Earn rewards by referring new customers

---

## Technology Stack

### Frontend
- **Framework**: React 18.1+ with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router DOM v6
- **State Management**: React Context + TanStack Query
- **Internationalization**: i18next (12 languages)

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Edge Functions**: Supabase Edge Functions (Deno)
- **Hosting**: Vercel
- **Error Tracking**: Sentry

### External Services
- **Payments**: Stripe
- **Content Management**: Contentful
- **Email**: Resend API
- **Referrals**: Partnero
- **AI**: DeepSeek AI (chat support)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase CLI (for local development)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/sam247/disclosurely.git
cd disclosurely

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Environment Variables

Required environment variables (see `.env.example` for full list):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CONTENTFUL_SPACE_ID=your_contentful_space_id
VITE_CONTENTFUL_DELIVERY_TOKEN=your_contentful_token
```

---

## Development

### Running Locally

```bash
# Main application
npm run dev              # Runs on http://localhost:8080

# Documentation site (separate)
cd docs
npm install
npm run docs:dev        # Runs on http://localhost:5173
```

### Building

```bash
# Production build
npm run build

# Development build
npm run build:dev
```

### Database Migrations

```bash
# List migrations
supabase migration list

# Apply migrations
supabase db push
```

---

## Project Structure

```
disclosurely/
├── src/                    # React application source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── integrations/      # External service integrations
├── docs/                  # VitePress documentation site
├── supabase/
│   ├── functions/         # Edge Functions (Deno)
│   └── migrations/        # Database migrations
├── api/                   # Vercel API routes
└── public/                # Static assets
```

---

## Security

Disclosurely takes security seriously:

- ✅ **End-to-End Encryption** - AES-256-GCM encryption for sensitive data
- ✅ **Row Level Security (RLS)** - Database-level access control
- ✅ **No Hardcoded Secrets** - All secrets via environment variables
- ✅ **PII Detection & Redaction** - Automatic PII scanning and sanitization
- ✅ **Audit Logging** - Comprehensive audit trails
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **CSP Headers** - Content Security Policy enforcement

**⚠️ Important**: Never commit secrets or API keys. Always use environment variables.

See `SECURITY_MITIGATION_PLAN.md` for security best practices and known issues.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Documentation

- **User Documentation**: https://docs.disclosurely.com
- **Developer Guide**: See `LLMREADME.md` for comprehensive development guide
- **Security Plan**: See `SECURITY_MITIGATION_PLAN.md`

---

## License

Proprietary - All rights reserved

---

## Support

- **Email**: support@disclosurely.com
- **Chat**: Available in-app (bottom-right corner)
- **Documentation**: https://docs.disclosurely.com

---

**Built with ❤️ for secure, ethical workplaces**
