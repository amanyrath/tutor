# Free Tier Optimization Guide

This guide helps you deploy the Tutor Quality Dashboard completely free for demo purposes.

## Cost Breakdown & Free Alternatives

### 1. Vercel Hosting ✅ FREE
- **Vercel Hobby Plan**: Free forever
- Unlimited deployments
- 100GB bandwidth/month
- **Limitation**: Only daily cron jobs (not hourly)

### 2. Database ✅ FREE Options

#### Option A: Vercel Postgres (Recommended)
- **Free Tier**: 256 MB storage, 60 hours compute/month
- **Perfect for**: Demo with limited data
- **Limitation**: Auto-pauses after inactivity

#### Option B: Neon (Serverless Postgres)
- **Free Tier**: 0.5 GB storage, unlimited projects
- **Perfect for**: Demo deployments
- **Better**: Doesn't auto-pause

#### Option C: Supabase
- **Free Tier**: 500 MB database, 2 GB bandwidth
- **Perfect for**: Demo with PostgreSQL

**Recommendation**: Use Neon or Supabase for demos (no auto-pause)

### 3. Cron Jobs ✅ FREE Alternatives

#### Current Issue
- Vercel Hobby: Only daily cron jobs allowed
- Your cron jobs: Hourly and 6-hourly (requires Pro)

#### Solution: External Free Cron Services

**Option A: cron-job.org** (Recommended)
- Free tier: 1 job every 5 minutes
- Perfect for demo
- Setup:
  1. Sign up at https://cron-job.org
  2. Create cron job pointing to your endpoint
  3. Set Authorization header: `Bearer YOUR_CRON_SECRET`
  4. Schedule: Hourly, 6-hourly, weekly

**Option B: EasyCron**
- Free tier: 1 job every 5 minutes
- Similar setup to cron-job.org

**Option C: Use Daily Cron Only**
- Modify `vercel.json` to use daily schedules
- All jobs run once per day (good enough for demo)

### 4. AI API Costs ⚠️ PAY-PER-USE

#### Free Tier Options

**OpenRouter** (Recommended for Demo)
- Free tier: $5 credit to start
- Access to multiple models
- Pay only for what you use
- **Demo tip**: Use cheaper models (GPT-3.5 instead of GPT-4)

**OpenAI**
- No free tier
- Pay per request
- **Demo tip**: Disable AI features or use mock data

**Anthropic**
- No free tier
- Pay per request

**Recommendation**: 
- For demo: Use OpenRouter with GPT-3.5-turbo (cheapest)
- Or: Disable AI features entirely (pattern discovery)

### 5. Email Service ✅ FREE

**Resend** (Recommended)
- **Free Tier**: 100 emails/day, 3,000/month
- Perfect for demo
- No credit card required

**Alternative: Disable Email**
- Comment out email sending code
- Still shows email functionality in UI
- No actual emails sent

## Free Tier Configuration

### Step 1: Use Free-Tier Vercel Config

Replace `vercel.json` with `vercel.free-tier.json`:
```bash
cp vercel.free-tier.json vercel.json
```

This changes cron jobs to daily (works on Hobby plan).

### Step 2: Use Free Database

**Neon Setup:**
1. Sign up at https://neon.tech
2. Create free PostgreSQL database
3. Get connection string
4. Set as `DATABASE_URL` in Vercel

**Supabase Setup:**
1. Sign up at https://supabase.com
2. Create free project
3. Get connection string from Settings → Database
4. Set as `DATABASE_URL` in Vercel

### Step 3: External Cron Jobs (Optional)

If you want hourly cron jobs without Pro plan:

1. **Sign up for cron-job.org**
2. **Create 3 cron jobs:**

   **Job 1: Generate Alerts (Hourly)**
   - URL: `https://your-app.vercel.app/api/cron/generate-alerts`
   - Method: GET
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: Every hour

   **Job 2: Send Emails (Every 6 hours)**
   - URL: `https://your-app.vercel.app/api/cron/send-emails`
   - Method: GET
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: Every 6 hours

   **Job 3: Discover Patterns (Weekly)**
   - URL: `https://your-app.vercel.app/api/cron/discover-patterns`
   - Method: GET
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: Every Monday 2 AM

### Step 4: Optimize AI Usage

**Option A: Use Cheaper Models**
- Use GPT-3.5-turbo instead of GPT-4
- Costs ~10x less
- Still works great for demo

**Option B: Disable AI Features**
- Set `DISABLE_AI=true` environment variable
- Pattern discovery will skip AI calls
- Still shows UI, just no AI insights

**Option C: Mock AI Responses**
- Return sample insights instead of calling API
- Perfect for demo presentations

### Step 5: Limit Email Usage

- Resend free tier: 100 emails/day
- For demo: This is plenty
- Monitor usage in Resend dashboard

## Complete Free Tier Setup

### Minimal Configuration

```bash
# 1. Use free-tier vercel config
cp vercel.free-tier.json vercel.json

# 2. Set environment variables in Vercel
# - DATABASE_URL (from Neon/Supabase)
# - CRON_SECRET (generate one)
# - RESEND_API_KEY (free tier)
# - EMAIL_FROM
# - EMAIL_FROM_NAME
# - DISABLE_AI=true (optional, to avoid AI costs)

# 3. Deploy
vercel --prod
```

### Environment Variables for Free Tier

```env
# Database (Free - Neon or Supabase)
DATABASE_URL=postgresql://...

# Cron Security
CRON_SECRET=your-secret-here

# Email (Free - Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=demo@yourdomain.com
EMAIL_FROM_NAME="Tutor Quality Platform"

# AI (Optional - disable to avoid costs)
DISABLE_AI=true

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Cost Summary

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| Vercel Hosting | ✅ Hobby Plan | $0 |
| Database | ✅ Neon/Supabase | $0 |
| Cron Jobs | ✅ cron-job.org | $0 |
| Email | ✅ Resend (100/day) | $0 |
| AI API | ⚠️ Optional | $0-5 (if used) |
| **Total** | | **$0-5/month** |

## Demo Optimization Tips

1. **Use Daily Cron**: Good enough for demo, works on free Vercel
2. **Disable AI**: Set `DISABLE_AI=true` to avoid API costs
3. **Use Mock Data**: Pre-populate database with demo data
4. **Limit Email**: Only send emails when demonstrating email feature
5. **Use Cheaper Models**: GPT-3.5 instead of GPT-4
6. **Monitor Usage**: Check Resend dashboard for email limits

## Quick Start: Free Tier Deployment

```bash
# 1. Use free-tier config
cp vercel.free-tier.json vercel.json

# 2. Create free Neon database
# Visit: https://neon.tech → Create Database

# 3. Set environment variables in Vercel
vercel env add DATABASE_URL production
# Paste Neon connection string

vercel env add CRON_SECRET production
# Use generated secret

vercel env add RESEND_API_KEY production
# Get from Resend dashboard

vercel env add DISABLE_AI production
# Set to: true

# 4. Deploy
vercel --prod
```

## External Cron Setup (If Needed)

If you want hourly cron jobs:

1. Sign up: https://cron-job.org (free)
2. Create cron job
3. URL: `https://your-app.vercel.app/api/cron/generate-alerts`
4. Headers: `Authorization: Bearer YOUR_CRON_SECRET`
5. Schedule: Hourly

Repeat for other cron endpoints.

## Monitoring Free Tier Limits

- **Vercel**: Check dashboard for bandwidth usage
- **Neon**: Check dashboard for compute hours
- **Resend**: Check dashboard for email count (100/day limit)
- **OpenRouter**: Check dashboard for API usage

All free tiers are generous enough for demo purposes!

