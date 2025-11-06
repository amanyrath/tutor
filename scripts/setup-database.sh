#!/bin/bash
# Database Setup Helper Script
# This script helps set up the database connection for Vercel deployment

echo "=== Database Setup Helper ==="
echo ""
echo "This script helps you configure your database for Vercel deployment."
echo ""

# Check if DATABASE_URL is set locally
if [ -f .env ] && grep -q "DATABASE_URL" .env; then
    echo "✓ Found DATABASE_URL in .env file"
    LOCAL_DB=$(grep "DATABASE_URL" .env | cut -d '=' -f2 | tr -d '"')
    echo "  Local DB: ${LOCAL_DB:0:30}..."
else
    echo "⚠ No DATABASE_URL found in .env"
fi

echo ""
echo "=== Option 1: Vercel Postgres (Recommended) ==="
echo ""
echo "To create Vercel Postgres database:"
echo "1. Visit: https://vercel.com/dashboard"
echo "2. Select project: tutor"
echo "3. Go to Storage tab"
echo "4. Click 'Create Database' → Select 'Postgres'"
echo "5. Name: tutor-quality-db"
echo "6. Select region and create"
echo ""
echo "After creation, environment variables will be auto-added:"
echo "  - POSTGRES_PRISMA_URL (use this for DATABASE_URL)"
echo "  - POSTGRES_URL_NON_POOLING (for migrations)"
echo ""

echo "=== Option 2: External Postgres ==="
echo ""
echo "If using external Postgres (Neon, Supabase, Railway, etc.):"
echo "1. Create database in your provider"
echo "2. Get connection string"
echo "3. Add to Vercel: vercel env add DATABASE_URL"
echo ""

echo "=== Next Steps ==="
echo ""
echo "After database is created:"
echo "1. Set DATABASE_URL in Vercel dashboard or via CLI"
echo "2. Run: npx prisma migrate deploy (or npx prisma db push)"
echo "3. Run: npx prisma generate"
echo "4. Deploy: vercel --prod"
echo ""

echo "=== Current Vercel Environment Variables ==="
vercel env ls 2>&1 | grep -v "Common next commands" || echo "No variables set yet"
echo ""

echo "To add DATABASE_URL via CLI:"
echo "  vercel env add DATABASE_URL production"
echo "  (Then paste your connection string when prompted)"
echo ""

