# Deployment Verification Checklist

Use this checklist to verify your deployment is working correctly.

## Post-Deployment Verification

### 1. Application Access
- [ ] Production URL loads: `https://your-project.vercel.app`
- [ ] Dashboard page loads: `/dashboard`
- [ ] No build errors in Vercel logs
- [ ] Pages render correctly

### 2. Database Connection
- [ ] Test database endpoint works: `/api/test-db`
- [ ] Database queries execute successfully
- [ ] No connection errors in logs
- [ ] Tables exist and are accessible

### 3. API Endpoints
- [ ] `/api/dashboard/metrics` - Returns data
- [ ] `/api/dashboard/tutors` - Returns tutor list
- [ ] `/api/alerts` - Returns alerts (if any)
- [ ] `/api/insights` - Returns insights (if any)

### 4. Cron Jobs (If Vercel Pro Plan)
- [ ] Cron jobs registered in Vercel dashboard
  - `/api/cron/generate-alerts` - Hourly
  - `/api/cron/send-emails` - Every 6 hours
  - `/api/cron/discover-patterns` - Weekly Monday 2 AM
- [ ] First cron execution logged successfully
- [ ] No cron job errors in logs

### 5. Manual Cron Job Testing
Test cron endpoints manually:
```bash
# Get CRON_SECRET from Vercel environment variables
export CRON_SECRET="your-secret"

# Test generate-alerts
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app.vercel.app/api/cron/generate-alerts

# Test send-emails
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app.vercel.app/api/cron/send-emails

# Test discover-patterns
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app.vercel.app/api/cron/discover-patterns
```

Expected response: `{"success": true, ...}`

### 6. Environment Variables
- [ ] All required variables set in Vercel dashboard
- [ ] DATABASE_URL configured correctly
- [ ] CRON_SECRET set
- [ ] NEXT_PUBLIC_APP_URL matches production URL
- [ ] AI API key configured (if using AI features)
- [ ] Email service configured (if using email alerts)

### 7. Features Testing
- [ ] Dashboard displays metrics
- [ ] Tutor list loads and filters work
- [ ] Tutor detail pages load
- [ ] Alerts page works (if alerts exist)
- [ ] Insights page works (if insights exist)
- [ ] Interventions page works

### 8. Performance
- [ ] Page load times acceptable
- [ ] API response times < 1 second
- [ ] No timeout errors
- [ ] Database queries optimized

### 9. Error Monitoring
- [ ] Check Vercel logs for errors
- [ ] No 500 errors in production
- [ ] No database connection errors
- [ ] No missing environment variable errors

### 10. Monitoring Setup (Optional)
- [ ] Vercel Analytics enabled (if desired)
- [ ] Error tracking configured (Sentry, if using)
- [ ] Logs accessible and monitored

## Verification Commands

```bash
# View recent deployments
vercel ls

# View logs
vercel logs

# View environment variables
vercel env ls

# Test database connection locally
vercel env pull .env.local
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2)
npx prisma db execute --stdin <<< "SELECT 1;"
```

## Troubleshooting

### Application Not Loading
- Check Vercel deployment logs
- Verify build succeeded
- Check for runtime errors

### Database Connection Failed
- Verify DATABASE_URL is correct
- Check database is accessible
- Run migrations: `npx prisma migrate deploy`

### Cron Jobs Not Running
- Verify Vercel Pro plan is active
- Check cron jobs are registered in dashboard
- Verify CRON_SECRET is set correctly
- Check cron job logs in Vercel dashboard

### API Endpoints Returning Errors
- Check Vercel function logs
- Verify environment variables are set
- Test endpoints locally with production DATABASE_URL

## Success Criteria

All items above should be checked for a successful deployment:
- ✅ Application accessible
- ✅ Database connected
- ✅ API endpoints working
- ✅ Cron jobs registered (if Pro plan)
- ✅ No critical errors in logs
- ✅ Features functional

## Next Steps

After verification:
1. Monitor application for 24-48 hours
2. Check cron job execution logs
3. Monitor error rates
4. Set up alerts (optional)
5. Configure custom domain (optional)
6. Set up backup strategy for database

See `DEPLOYMENT_GUIDE.md` for deployment instructions.

