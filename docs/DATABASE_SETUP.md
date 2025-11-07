# Database Setup Instructions

## Option A: Vercel Postgres (Recommended)

### Via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project: `tutor`
3. Navigate to **Storage** tab
4. Click **Create Database** → Select **Postgres**
5. Name it: `tutor-quality-db`
6. Select a region (recommended: US East for low latency)
7. Click **Create**

### Environment Variables Auto-Configured:
After creating Vercel Postgres, these variables are automatically added:
- `POSTGRES_PRISMA_URL` - Connection pooling URL (use this for Prisma)
- `POSTGRES_URL_NON_POOLING` - Direct connection URL (use for migrations)

### Update Prisma Configuration:
You can use `POSTGRES_PRISMA_URL` as your `DATABASE_URL`:
- In Vercel dashboard, add: `DATABASE_URL` = value of `POSTGRES_PRISMA_URL`
- OR update `prisma/schema.prisma` to use `POSTGRES_PRISMA_URL` directly

## Option B: External Postgres Database

### Providers:
- **Neon** (Serverless Postgres): https://neon.tech
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app
- **AWS RDS**: https://aws.amazon.com/rds

### Steps:
1. Create a PostgreSQL database in your chosen provider
2. Get the connection string
3. Add to Vercel environment variables as `DATABASE_URL`
4. Format: `postgresql://user:password@host:port/database?sslmode=require`

## Next Steps After Database Creation:

1. Set `DATABASE_URL` environment variable in Vercel
2. Run Prisma migrations: `npx prisma migrate deploy` OR `npx prisma db push`
3. Generate Prisma client: `npx prisma generate`
4. Verify connection: Test `/api/test-db` endpoint after deployment

