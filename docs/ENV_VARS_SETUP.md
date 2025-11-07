# Environment Variables Configuration Guide

## Quick Reference

All environment variables should be set in Vercel Dashboard or via CLI.

### Via Vercel Dashboard:
1. Go to: https://vercel.com/dashboard
2. Select project: `tutor`
3. Go to **Settings** → **Environment Variables**
4. Add each variable with appropriate environment scope

### Via Vercel CLI:
```bash
vercel env add <VARIABLE_NAME> production
```

## Required Variables

### Database
- `DATABASE_URL` - PostgreSQL connection string
  - Auto-set if using Vercel Postgres as `POSTGRES_PRISMA_URL`
  - Or manually set for external Postgres

### Application
- `NEXT_PUBLIC_APP_URL` - Production URL (set after first deploy)
- `NODE_ENV` - Usually auto-set to `production` by Vercel

### Cron Security
- `CRON_SECRET` - Secure random string
  - Generated value: `jmII2rr1W70wf8oy7j26RyTS7EK0bszTex2p5gwhiNw=`
  - Generate new: `openssl rand -base64 32`

### AI Service (Choose ONE)
- `OPENAI_API_KEY` - OpenAI API key
- `OPENROUTER_API_KEY` - OpenRouter API key  
- `ANTHROPIC_API_KEY` - Anthropic API key

### Email Service
- `RESEND_API_KEY` - Resend API key
- `EMAIL_FROM` - Sender email address
- `EMAIL_FROM_NAME` - Sender name

### GrowthBook (Optional)
- `GROWTHBOOK_API_KEY` - GrowthBook API key
- `GROWTHBOOK_CLIENT_KEY` - GrowthBook client key
- `NEXT_PUBLIC_GROWTHBOOK_API_HOST` - Default: `https://cdn.growthbook.io`

## Environment Scope

Set variables for:
- **Production** - Live production environment
- **Preview** - Preview deployments (pull requests)
- **Development** - Local development (optional)

## Setup Order

1. Create database → Get `DATABASE_URL`
2. Set `DATABASE_URL` in Vercel
3. Set `CRON_SECRET`
4. Set AI API key (one of the three options)
5. Set email service variables
6. Deploy preview
7. Set `NEXT_PUBLIC_APP_URL` with preview/production URL
8. Deploy production

## Verification

After setting variables:
```bash
# List all environment variables
vercel env ls

# Pull to local .env.local (for testing)
vercel env pull .env.local
```

See `DEPLOYMENT_CHECKLIST.md` for complete checklist.

