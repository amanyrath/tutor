feat: initial commit - Tutor Quality Dashboard platform

Complete Next.js 16 application for tutor performance monitoring, AI-powered
insights, automated alerts, and intervention campaigns.

## Features

### Core Dashboard
- Real-time performance monitoring with churn risk analysis
- Comprehensive tutor profiles with detailed metrics
- Multiple dashboard views: insights, reliability, alerts, engagement
- Star performer analysis and comparisons
- First session performance deep dive
- Customizable landing page with dashboard configuration

### AI & Analytics
- AI-powered pattern discovery using OpenAI/OpenRouter/Anthropic
- Automated insights generation with confidence scoring
- Pattern analysis for engagement trends and churn prediction
- Statistical significance testing and correlation analysis

### Automation
- Automated email alert system with Resend integration
- Intervention campaign builder with A/B testing
- Scheduled cron jobs for alert generation and email delivery
- Engagement event tracking and timeline visualization

### Experimentation
- GrowthBook integration for feature flags and A/B testing
- Experiment assignment and tracking system
- Statistical analysis of experiment results

## Tech Stack

- Next.js 16 (App Router) with React 19
- TypeScript for type safety
- PostgreSQL with Prisma ORM
- shadcn/ui components with Tailwind CSS
- Recharts for data visualization
- AI: OpenAI, OpenRouter, Anthropic SDKs
- Email: Resend with React Email templates
- Experimentation: GrowthBook

## Security

- Redacted exposed API key from SECURITY_ALERT.md
- Comprehensive .gitignore excluding secrets and generated files
- Environment variable template with clear instructions
- Data directory excluded from version control (6.4MB generated files)

## Documentation

Organized 33+ documentation files into structured directories:

- `docs/features/` - Feature guides (email alerts, interventions, insights)
- `docs/implementation/` - Technical implementation details
- `docs/integrations/` - Setup guides (OpenAI, OpenRouter, GrowthBook)
- `docs/pr/` - Pull request documentation

Comprehensive README with:
- Quick start guide
- Detailed setup instructions
- API documentation references
- Project structure overview
- Troubleshooting guide

## Project Structure

```
tutor/
├── app/              # Next.js app directory (API routes + pages)
├── components/       # React components (dashboard, landing, UI)
├── lib/              # Shared libraries (AI, alerts, analytics, email)
├── prisma/           # Database schema
├── scripts/          # Data generation and import scripts
├── docs/             # Comprehensive documentation
└── data/             # Generated CSV files (gitignored)
```

## Database Schema

- Tutor profiles with experience and certification data
- Session records with quality metrics and engagement scores
- Tutor aggregates with 7d/30d rolling metrics
- Alert system for automated issue detection
- Intervention campaigns with delivery tracking
- Pattern insights from AI analysis
- Experiment framework with assignments
- Engagement event tracking

## Setup

1. Install dependencies: `npm install`
2. Configure environment: `cp env.template .env`
3. Set up database: `npx prisma db push`
4. Generate data: `python tutor_data_gen.py --mode production`
5. Import data: `npm run import-data`
6. Start dev server: `npm run dev`

See QUICKSTART.md and README_SETUP.md for detailed instructions.

## Cleanup & Organization

- Removed unnecessary files (.DS_Store, duplicates, cache)
- Organized documentation into logical subdirectories
- Updated .gitignore for Python, IDE files, and generated data
- Created data/.gitkeep with regeneration instructions
- Enhanced README with comprehensive project overview

## Files Excluded from Git

- `data/*.csv` and `data/*.png` (generated, 6.4MB)
- `venv/` and `__pycache__/` (Python artifacts)
- `.cursor/` and IDE files
- `.env*` files (secrets)
- Build artifacts (`.next/`, `node_modules/`)

This initial commit establishes a production-ready foundation for tutor
quality monitoring with AI-powered insights and automated intervention
capabilities.


