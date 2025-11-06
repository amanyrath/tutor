#!/bin/bash
# Deployment Script for Vercel
# Handles preview and production deployments

set -e

echo "=== Vercel Deployment Script ==="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Run: vercel login"
    exit 1
fi

echo "✓ Vercel CLI ready"
echo ""

# Ask for deployment type
echo "Select deployment type:"
echo "1. Preview deployment (for testing)"
echo "2. Production deployment"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "=== Deploying to Preview ==="
    vercel --yes
    echo ""
    echo "✓ Preview deployment complete"
    echo ""
    echo "Next steps:"
    echo "1. Get preview URL from output above"
    echo "2. Set NEXT_PUBLIC_APP_URL: vercel env add NEXT_PUBLIC_APP_URL preview"
    echo "3. Test the preview deployment"
    echo "4. Deploy to production when ready: vercel --prod"
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "⚠️  Production deployment requires:"
    echo "  - Vercel Pro plan (for cron jobs)"
    echo "  - DATABASE_URL set"
    echo "  - All environment variables configured"
    echo ""
    read -p "Continue with production deployment? (y/n): " confirm
    
    if [ "$confirm" != "y" ]; then
        echo "Deployment cancelled"
        exit 0
    fi
    
    echo ""
    echo "=== Deploying to Production ==="
    vercel --prod --yes
    echo ""
    echo "✓ Production deployment complete"
    echo ""
    echo "Next steps:"
    echo "1. Verify production URL works"
    echo "2. Check cron jobs in Vercel dashboard"
    echo "3. Monitor logs for errors"
    echo "4. Test all features"
    
else
    echo "Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "View deployment:"
echo "  vercel ls"
echo ""
echo "View logs:"
echo "  vercel logs"
echo ""

