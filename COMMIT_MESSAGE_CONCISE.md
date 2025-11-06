feat: initial commit - Tutor Quality Dashboard platform

Complete Next.js 16 application for tutor performance monitoring, AI-powered
insights, automated alerts, and intervention campaigns.

BREAKING CHANGE: Initial repository commit

Features:
- Real-time performance monitoring with churn risk analysis
- AI-powered pattern discovery (OpenAI/OpenRouter/Anthropic)
- Automated email alerts with Resend integration
- Intervention campaigns with A/B testing via GrowthBook
- Comprehensive dashboard views (insights, reliability, alerts, engagement)
- Star performer analysis and first session deep dive

Tech Stack:
- Next.js 16 (App Router), React 19, TypeScript
- PostgreSQL with Prisma ORM
- shadcn/ui, Tailwind CSS, Recharts
- AI: OpenAI/OpenRouter/Anthropic SDKs
- Email: Resend with React Email templates
- Experimentation: GrowthBook

Security:
- Comprehensive .gitignore excluding secrets and generated files
- Environment variable template provided

Documentation:
- Organized 33+ docs into structured directories (features/, implementation/, integrations/, pr/)
- Comprehensive README with quick start and setup guides
- API documentation references included

Cleanup:
- Removed unnecessary files (.DS_Store, duplicates, cache)
- Excluded generated data files (6.4MB CSV/PNG) from git
- Updated .gitignore for Python, IDE files, and build artifacts
- Created data/.gitkeep with regeneration instructions

Setup: See QUICKSTART.md and README_SETUP.md for detailed instructions.

This initial commit establishes a production-ready foundation for tutor quality
monitoring with AI-powered insights and automated intervention capabilities.


