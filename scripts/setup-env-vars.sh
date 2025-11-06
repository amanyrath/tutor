#!/bin/bash
# Environment Variables Setup Helper for Vercel
# This script helps you set environment variables in Vercel

echo "=== Vercel Environment Variables Setup ==="
echo ""
echo "This script helps you add environment variables to your Vercel project."
echo "Project: tutor"
echo ""

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

echo "Current environment variables:"
vercel env ls
echo ""

echo "=== Required Environment Variables ==="
echo ""
echo "1. DATABASE_URL (Required)"
echo "   - Set after creating Vercel Postgres database"
echo "   - Or use external Postgres connection string"
echo "   Command: vercel env add DATABASE_URL production"
echo ""

echo "2. CRON_SECRET (Required)"
echo "   Generated value: jmII2rr1W70wf8oy7j26RyTS7EK0bszTex2p5gwhiNw="
echo "   Command: vercel env add CRON_SECRET production"
echo "   (Use the generated value above)"
echo ""

echo "3. NEXT_PUBLIC_APP_URL (Required)"
echo "   - Set after first deployment"
echo "   - Format: https://your-project.vercel.app"
echo "   Command: vercel env add NEXT_PUBLIC_APP_URL production"
echo ""

echo "4. AI API Key (Required - Choose ONE)"
echo "   - OPENAI_API_KEY"
echo "   - OR OPENROUTER_API_KEY"
echo "   - OR ANTHROPIC_API_KEY"
echo "   Command: vercel env add OPENAI_API_KEY production"
echo ""

echo "5. Email Service (Required for email alerts)"
echo "   - RESEND_API_KEY"
echo "   - EMAIL_FROM"
echo "   - EMAIL_FROM_NAME"
echo "   Commands:"
echo "     vercel env add RESEND_API_KEY production"
echo "     vercel env add EMAIL_FROM production"
echo "     vercel env add EMAIL_FROM_NAME production"
echo ""

echo "6. GrowthBook (Optional - for experiments)"
echo "   - GROWTHBOOK_API_KEY"
echo "   - GROWTHBOOK_CLIENT_KEY"
echo "   - NEXT_PUBLIC_GROWTHBOOK_API_HOST"
echo ""

echo "=== Quick Setup Commands ==="
echo ""
echo "To add variables interactively, run:"
echo "  vercel env add <VARIABLE_NAME> production"
echo ""
echo "To add for all environments:"
echo "  vercel env add <VARIABLE_NAME> production preview development"
echo ""
echo "To pull environment variables locally:"
echo "  vercel env pull .env.local"
echo ""

echo "=== Recommended Order ==="
echo "1. Create database first (via Vercel dashboard)"
echo "2. Set DATABASE_URL"
echo "3. Set CRON_SECRET"
echo "4. Set AI API key"
echo "5. Set email service variables"
echo "6. Deploy preview"
echo "7. Set NEXT_PUBLIC_APP_URL"
echo "8. Deploy production"
echo ""

