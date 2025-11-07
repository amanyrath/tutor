# Deployment Guide

## Prerequisites

### Vercel Plan Requirements
- **Vercel Pro Plan ($20/month)** is required for cron jobs
- Hobby plan only supports daily cron jobs (not hourly)
- Cron jobs configured in `vercel.json`:
  - `/api/cron/generate-alerts` - Hourly (requires Pro)
  - `/api/cron/send-emails` - Every 6 hours (requires Pro)
  - `/api/cron/discover-patterns` - Weekly Monday 2 AM (works on Hobby)

### Options

#### Option 1: Upgrade to Vercel Pro (Recommended)
- Enables all cron jobs
- Best for production use
- Upgrade at: https://vercel.com/dashboard/billing

#### Option 2: Temporarily Disable Cron Jobs
- Comment out cron jobs in `vercel.json` for initial deployment
- Can enable later after upgrading to Pro
- Cron endpoints will still work if called manually

#### Option 3: Use External Cron Service
- Use services like cron-job.org or EasyCron
- Call cron endpoints manually with CRON_SECRET
- Works with any Vercel plan

## Deployment Steps

### 1. Pre-Deployment Checklist
- [ ] Database created (Vercel Postgres or external)
- [ ] Environment variables set in Vercel dashboard
- [ ] DATABASE_URL configured
- [ ] CRON_SECRET set
- [ ] AI API key set
- [ ] Email service configured (optional)
- [ ] Vercel Pro plan active (for cron jobs)

### 2. Deploy to Preview

```bash
# Deploy preview
vercel

# Or deploy specific branch
vercel --prod=false
```

### 3. Verify Preview Deployment
- Check deployment URL in output
- Test application loads
- Verify database connection
- Check logs for errors

### 4. Set NEXT_PUBLIC_APP_URL

After preview deployment:
```bash
# Get preview URL from deployment output
# Set in Vercel dashboard or via CLI
vercel env add NEXT_PUBLIC_APP_URL preview
# Enter: https://tutor-xxxxx.vercel.app
```

### 5. Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or merge to main branch (if auto-deploy enabled)
```

### 6. Post-Deployment

- [ ] Verify production URL works
- [ ] Check cron jobs are registered (Vercel dashboard)
- [ ] Test API endpoints
- [ ] Monitor logs for errors
- [ ] Verify database migrations applied

## Troubleshooting

### Cron Jobs Error
If you see: "Hobby accounts are limited to daily cron jobs"
- Upgrade to Vercel Pro, OR
- Temporarily disable cron jobs in `vercel.json`

### Database Connection Failed
- Verify DATABASE_URL is set correctly
- Check database is accessible
- Run migrations: `npx prisma migrate deploy`

### Build Failed
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Run `npm run build` locally to test

### Environment Variables Not Set
- Verify variables are set in Vercel dashboard
- Check environment scope (Production/Preview/Development)
- Pull variables: `vercel env pull .env.local`

## Alternative: Deploy Without Cron Jobs

If you need to deploy without Pro plan:

1. **Temporarily modify vercel.json:**
   ```json
   {
     "crons": []
   }
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Enable cron jobs later:**
   - Restore original vercel.json
   - Upgrade to Pro plan
   - Redeploy

## Next Steps After Deployment

1. Monitor application logs
2. Test all features
3. Verify cron jobs execute (if Pro plan)
4. Set up monitoring (optional)
5. Configure custom domain (optional)

See `DEPLOYMENT_CHECKLIST.md` for complete checklist.

