# Tutor Quality Dashboard

A comprehensive Next.js dashboard application for monitoring tutor performance, identifying at-risk tutors, and delivering data-driven interventions. Built with AI-powered pattern discovery, automated email alerts, and A/B testing capabilities.

## Features

- **Real-time Performance Monitoring**: Track tutor engagement, quality scores, and churn risk
- **AI-Powered Insights**: Automated pattern discovery using OpenAI/OpenRouter/Anthropic
- **Automated Alerts**: Email notifications for critical issues and engagement opportunities
- **Intervention Campaigns**: Targeted outreach with A/B testing via GrowthBook
- **Comprehensive Analytics**: Insights dashboards, reliability tracking, first-session analysis
- **Customizable Landing Page**: Personalized dashboard configuration for different user roles

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI**: shadcn/ui components, Tailwind CSS
- **Visualization**: Recharts
- **AI**: OpenAI, OpenRouter, Anthropic
- **Email**: Resend
- **Experimentation**: GrowthBook
- **Data Generation**: Python with pandas, scikit-learn

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (running locally or remote)
- Python 3.8+ (for data generation)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.template .env
   ```
   Edit `.env` and configure:
   - `DATABASE_URL` - PostgreSQL connection string
   - AI API key (one of): `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, or `ANTHROPIC_API_KEY`
   - `RESEND_API_KEY` - For email functionality
   - `GROWTHBOOK_CLIENT_KEY` - For experimentation
   - `NEXT_PUBLIC_APP_URL` - Your app URL

3. **Set up database**:
   ```bash
   # Create database
   createdb tutor_quality
   
   # Initialize schema
   npx prisma db push
   npx prisma generate
   ```

4. **Generate and import data**:
   ```bash
   # Activate Python venv (if using)
   source venv/bin/activate
   
   # Generate synthetic data
   python tutor_data_gen.py --mode production
   
   # Import to database
   npm run import-data
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the dashboard.

For detailed setup instructions, see [QUICKSTART.md](./QUICKSTART.md).

## Project Structure

```
tutor/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── alerts/          # Alert management
│   │   ├── analytics/       # Analytics endpoints
│   │   ├── cron/            # Scheduled jobs
│   │   ├── dashboard/       # Dashboard data
│   │   ├── email-preview/   # Email template preview
│   │   ├── engagement/      # Engagement tracking
│   │   ├── insights/        # Pattern insights
│   │   └── interventions/   # Intervention campaigns
│   ├── dashboard/            # Dashboard pages
│   │   ├── activation/      # Activation tracking
│   │   ├── alerts/          # Alert management
│   │   ├── engagement/      # Engagement metrics
│   │   ├── first-sessions/  # First session analysis
│   │   ├── insights/        # AI insights dashboard
│   │   ├── interventions/   # Campaign management
│   │   ├── performers/      # Star performer analysis
│   │   ├── reliability/     # Reliability metrics
│   │   └── tutors/          # Tutor profiles
│   └── providers/            # React context providers
├── components/               # React components
│   ├── dashboard/           # Dashboard-specific components
│   ├── landing/             # Landing page components
│   ├── tutor-detail/        # Tutor profile components
│   └── ui/                  # shadcn/ui components
├── lib/                      # Shared libraries
│   ├── ai/                  # AI integration (pattern analysis)
│   ├── alerts/              # Alert generation logic
│   ├── analytics/           # Analytics calculations
│   ├── email/               # Email templates and sending
│   ├── experiments/         # GrowthBook integration
│   └── interventions/       # Intervention builder
├── prisma/                  # Database schema
├── scripts/                 # Utility scripts
│   ├── import-data.ts       # CSV to database importer
│   ├── test-ai-connection.ts # AI API testing
│   └── *.py                # Python data generation scripts
├── data/                    # CSV data files
├── docs/                    # Documentation
│   ├── features/           # Feature documentation
│   ├── implementation/    # Implementation guides
│   ├── integrations/      # Integration guides
│   └── pr/                # Pull request docs
└── public/                  # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run import-data` - Import CSV data to database
- `npm run import-data:clear` - Clear and re-import data
- `npm run generate-alerts` - Generate demo alerts
- `npm run demo-insights` - Create demo AI insights
- `npm run send-emails` - Send pending email alerts
- `npm run test-ai` - Test AI API connection
- `npm run test-endpoints` - Test API endpoints

## Key Features

### Dashboard Pages

- **Home Dashboard** (`/dashboard`): Overview metrics, churn risk table, quick insights
- **Tutor Profiles** (`/dashboard/tutors/[tutorId]`): Detailed tutor performance and interventions
- **Insights** (`/dashboard/insights`): AI-discovered patterns and recommendations
- **Alerts** (`/dashboard/alerts`): Active alerts and management
- **Reliability** (`/dashboard/reliability`): Rescheduling and no-show analysis
- **First Sessions** (`/dashboard/first-sessions`): First session performance analysis
- **Engagement** (`/dashboard/engagement`): Engagement metrics and trends
- **Performers** (`/dashboard/performers`): Star performer analysis and comparisons
- **Interventions** (`/dashboard/interventions`): Campaign builder and management

### API Endpoints

- `/api/dashboard/metrics` - Dashboard KPIs
- `/api/dashboard/tutors` - Tutor list with filtering
- `/api/alerts` - Alert CRUD operations
- `/api/insights` - Pattern insights
- `/api/interventions` - Intervention campaigns
- `/api/analytics/*` - Various analytics endpoints
- `/api/cron/*` - Scheduled background jobs

See [docs/implementation/API_ENDPOINTS_IMPLEMENTATION.md](./docs/implementation/API_ENDPOINTS_IMPLEMENTATION.md) for full API documentation.

## Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Detailed setup guide
- **[README_SETUP.md](./README_SETUP.md)** - Additional setup information
- **[docs/](./docs/)** - Complete documentation
  - **Features**: Feature-specific guides (email alerts, interventions, etc.)
  - **Implementation**: Technical implementation details
  - **Integrations**: Setup guides for AI, email, GrowthBook
  - **PR**: Pull request documentation

## Environment Variables

See `env.template` for all available environment variables. Key variables:

- `DATABASE_URL` - PostgreSQL connection string (required)
- `OPENAI_API_KEY` / `OPENROUTER_API_KEY` / `ANTHROPIC_API_KEY` - AI API key (one required)
- `RESEND_API_KEY` - Email service API key
- `GROWTHBOOK_CLIENT_KEY` - GrowthBook client key
- `NEXT_PUBLIC_APP_URL` - App URL for email links
- `CRON_SECRET` - Secret for cron job authentication

## Database Schema

The application uses PostgreSQL with the following main models:

- **Tutor**: Profile information, experience, subjects
- **Session**: Individual session records with quality metrics
- **TutorAggregate**: Pre-calculated 7d/30d aggregates and churn predictions
- **Alert**: Generated alerts for tutor issues
- **Intervention**: Intervention campaigns and tracking
- **PatternInsight**: AI-discovered patterns
- **Experiment**: A/B test configurations
- **EngagementEvent**: Engagement tracking events

See `prisma/schema.prisma` for the complete schema.

## Development

### Adding New Features

1. Update Prisma schema if database changes needed
2. Run `npx prisma db push` to apply changes
3. Create API routes in `app/api/`
4. Build UI components in `components/`
5. Add pages in `app/dashboard/`
6. Update documentation

### Testing

- Test database connection: Visit `/api/test-db`
- Test AI connection: `npm run test-ai`
- Test endpoints: `npm run test-endpoints`

## Deployment

The application is configured for Vercel deployment with PostgreSQL database and automated cron jobs.

### Quick Start

1. **Prerequisites:**
   - Vercel account (Pro plan required for cron jobs)
   - PostgreSQL database (Vercel Postgres recommended)
   - API keys for AI, email, and optional services

2. **Deployment Steps:**
   ```bash
   # Install Vercel CLI (if not already installed)
   npm i -g vercel
   
   # Login and link project
   vercel login
   vercel link
   
   # Create database (via Vercel dashboard or CLI)
   # Set environment variables in Vercel dashboard
   # Run migrations
   npx prisma migrate deploy
   
   # Deploy
   vercel --prod
   ```

### Detailed Guides

- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Complete deployment checklist
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Step-by-step deployment guide
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database setup instructions
- **[ENV_VARS_SETUP.md](./ENV_VARS_SETUP.md)** - Environment variables configuration
- **[DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md)** - Database migration guide
- **[DEPLOYMENT_VERIFICATION.md](./DEPLOYMENT_VERIFICATION.md)** - Post-deployment verification

### Free Tier Option

For demo deployments, you can run completely free:

- Use `vercel.free-tier.json` (daily cron jobs, works on Hobby plan)
- Set `DISABLE_AI=true` to avoid AI API costs (uses mock data)
- Use Neon or Supabase free tier for database
- Resend free tier for email (100/day)

See **[FREE_TIER_GUIDE.md](./FREE_TIER_GUIDE.md)** for complete free tier setup.

### Key Requirements

- **Vercel Pro Plan** ($20/month) - Required for hourly cron jobs
- **PostgreSQL Database** - Vercel Postgres or external provider
- **Environment Variables** - See `ENV_VARS_SETUP.md` for complete list
- **CRON_SECRET** - Generated secure string for cron authentication

### Cron Jobs

The application includes automated cron jobs (requires Vercel Pro):
- Alert generation: Every hour
- Email sending: Every 6 hours  
- Pattern discovery: Weekly (Mondays 2 AM)

See `vercel.json` for configuration. Cron endpoints are protected with `CRON_SECRET`.

### Helper Scripts

- `scripts/deploy.sh` - Interactive deployment script
- `scripts/migrate-database.sh` - Database migration helper
- `scripts/setup-env-vars.sh` - Environment variables setup guide
- `scripts/setup-database.sh` - Database setup helper

For more details, see the deployment documentation files listed above.

## Contributing

1. Create a feature branch
2. Make your changes
3. Update documentation as needed
4. Test thoroughly
5. Submit a pull request

## License

Built for Nerdy (Tutor.com) tutor quality monitoring system.

## Support

For issues or questions:
- Check the [QUICKSTART.md](./QUICKSTART.md) guide
- Review [docs/](./docs/) documentation
- See troubleshooting section in documentation
