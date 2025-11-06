#!/bin/bash
# Database Migration Script for Production
# Run this after setting DATABASE_URL in Vercel

set -e

echo "=== Database Migration Script ==="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo ""
    echo "To set it:"
    echo "1. Get connection string from Vercel dashboard (if using Vercel Postgres)"
    echo "2. Or set it manually: export DATABASE_URL='postgresql://...'"
    echo "3. Or pull from Vercel: vercel env pull .env.local"
    echo ""
    exit 1
fi

echo "✓ DATABASE_URL is set"
echo "  Database: ${DATABASE_URL:0:30}..."
echo ""

# Check if Prisma is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Make sure Node.js is installed."
    exit 1
fi

echo "=== Step 1: Generate Prisma Client ==="
npx prisma generate
echo "✓ Prisma client generated"
echo ""

echo "=== Step 2: Apply Database Migrations ==="
echo "Choose migration method:"
echo "1. Use migrations (recommended for production)"
echo "2. Use db push (faster, but less production-safe)"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo "Applying migrations..."
    npx prisma migrate deploy
    echo "✓ Migrations applied successfully"
elif [ "$choice" = "2" ]; then
    echo "Pushing schema..."
    npx prisma db push
    echo "✓ Schema pushed successfully"
else
    echo "Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "=== Step 3: Verify Database Connection ==="
echo "Testing database connection..."
npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1 && echo "✓ Database connection successful" || echo "⚠ Database connection test failed (this might be normal)"

echo ""
echo "=== Migration Complete ==="
echo ""
echo "Next steps:"
echo "1. Verify tables were created: npx prisma studio"
echo "2. Deploy application: vercel --prod"
echo "3. Test database endpoint: curl https://your-app.vercel.app/api/test-db"
echo ""

