# Deployment Checklist

This checklist helps you gather all required environment variables and configuration before deploying to Vercel.

## Environment Variables Required

### Database (Required)
- [ ] `DATABASE_URL` - Will be auto-configured if using Vercel Postgres
  - OR manually set if using external Postgres (Neon, Supabase, Railway, etc.)

### Application (Required)
- [ ] `NEXT_PUBLIC_APP_URL` - Your production URL (set after first deployment)
  - Example: `https://your-project.vercel.app`
- [ ] `NODE_ENV` - Set to `production` (usually auto-set by Vercel)

### Cron Security (Required)
- [ ] `CRON_SECRET` - Secure random string for cron job authentication
  - Generated value: See below
  - Generate new: `openssl rand -base64 32`

### AI Service (Required - Choose ONE)
- [ ] `OPENAI_API_KEY` - OpenAI API key
  - Get from: https://platform.openai.com/api-keys
- [ ] `OPENROUTER_API_KEY` - OpenRouter API key (alternative)
  - Get from: https://openrouter.ai/keys
- [ ] `ANTHROPIC_API_KEY` - Anthropic API key (alternative)
  - Get from: https://console.anthropic.com/settings/keys

### Email Service (Required for email alerts)
- [ ] `RESEND_API_KEY` - Resend API key
  - Get from: https://resend.com/api-keys
- [ ] `EMAIL_FROM` - Email sender address
  - Example: `noreply@yourdomain.com`
- [ ] `EMAIL_FROM_NAME` - Email sender name
  - Example: `Tutor Quality Platform`

### Experimentation (Optional - for A/B testing)
- [ ] `GROWTHBOOK_API_KEY` - GrowthBook API key
  - Get from: https://app.growthbook.io/settings/api-keys
- [ ] `GROWTHBOOK_CLIENT_KEY` - GrowthBook client key
  - Get from: https://app.growthbook.io/settings/api-keys
- [ ] `NEXT_PUBLIC_GROWTHBOOK_API_HOST` - GrowthBook CDN URL
  - Default: `https://cdn.growthbook.io`

### Monitoring (Optional)
- [ ] `SENTRY_DSN` - Sentry error tracking DSN
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry client-side DSN

## Generated CRON_SECRET

**IMPORTANT**: Keep this secret secure and never commit it to git.

```
jmII2rr1W70wf8oy7j26RyTS7EK0bszTex2p5gwhiNw=
```

Copy this value and set it as `CRON_SECRET` in Vercel environment variables.

## Pre-Deployment Steps

1. [ ] Run `npm run build` locally - verify no build errors
2. [ ] Gather all API keys listed above
3. [ ] Generate CRON_SECRET (if not using the one below)
4. [ ] Install Vercel CLI: `npm i -g vercel`
5. [ ] Login to Vercel: `vercel login`
6. [ ] Link project: `vercel link`

## Deployment Steps

1. [ ] Create Vercel Postgres database OR configure external Postgres
2. [ ] Set all environment variables in Vercel dashboard
3. [ ] Run Prisma migrations: `npx prisma migrate deploy` OR `npx prisma db push`
4. [ ] Deploy to preview: `vercel`
5. [ ] Update `NEXT_PUBLIC_APP_URL` with preview/production URL
6. [ ] Deploy to production: `vercel --prod`
7. [ ] Verify cron jobs are registered in Vercel dashboard
8. [ ] Test all features and check logs

## Post-Deployment Verification

- [ ] Application loads correctly
- [ ] Database connection works
- [ ] API endpoints respond
- [ ] Cron jobs are registered and executing
- [ ] Email sending works (if configured)
- [ ] AI features work (if configured)
- [ ] No errors in Vercel logs

## Notes

- Vercel Postgres automatically provides `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`
- If using Vercel Postgres, you can use `POSTGRES_PRISMA_URL` as `DATABASE_URL`
- Cron jobs require Vercel Pro plan ($20/month) for production
- All environment variables should be set for Production, Preview, and Development environments (or selectively as needed)

