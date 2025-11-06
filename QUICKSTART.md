# Quick Start Guide

Get the Tutor Quality Dashboard running locally in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL running locally
- Python 3.8+ (for data generation)

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Database

Create a `.env.local` file (or `.env`):

```env
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/tutor_quality?schema=public"
```

Replace `YOUR_USERNAME` with your PostgreSQL username (typically your macOS username for Homebrew installs).

Create the database:

```bash
createdb tutor_quality
```

Initialize Prisma schema:

```bash
npx prisma db push
npx prisma generate
```

## 3. Generate Data

```bash
# Activate Python virtual environment
source venv/bin/activate

# Generate synthetic tutor data (150 tutors, 90K sessions)
python tutor_data_gen.py --mode production

# Deactivate venv
deactivate
```

This creates 3 CSV files in the `data/` directory:
- `tutor_profiles.csv`
- `sessions.csv`
- `tutor_aggregates.csv`

## 4. Import Data

```bash
# Import data to PostgreSQL
npm run import-data:clear
```

This will:
- Clear existing data
- Import 150 tutors
- Import 90,000+ sessions (takes 2-3 minutes)
- Import tutor aggregates
- Show progress bars and summary stats

## 5. Generate Alerts

```bash
# Create demo alerts for the alerts page
npm run demo-alerts
```

This creates 12 sample alerts (1 critical, 3 high, 4 medium, 4 low).

## 6. Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** (automatically redirects to `/dashboard`)

## What You'll See

### Dashboard (`/dashboard`)
- 4 KPI metric cards
- Engagement trends chart (30-day)
- Churn risk priority table with pagination
- Filters and search

### Alerts (`/dashboard/alerts`)
- Alert overview cards by severity
- Filterable alert list
- Acknowledge alerts
- Link to tutor details

### Tutor Detail (`/dashboard/tutors/[tutorId]`)
- Tutor profile card
- AI-generated intervention recommendations
- 9 performance metric cards
- 30-day performance chart
- Session history table

## Available Scripts

```bash
npm run dev                    # Start development server (port 3000)
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Data management
npm run import-data            # Import CSV data
npm run import-data:clear      # Clear DB and import fresh
npm run generate-alerts        # Generate alerts from data
npm run generate-alerts:clear  # Clear and regenerate alerts
npm run demo-alerts            # Create 12 demo alerts
```

## Quick Database Check

Test your database connection:

```bash
curl http://localhost:3000/api/test-db
```

Should return:
```json
{
  "success": true,
  "message": "Database connected!",
  "tutorCount": 143
}
```

## Troubleshooting

### Database Connection Error

If you see `P1010: User was denied access`:

1. Check PostgreSQL is running:
   ```bash
   brew services list | grep postgresql
   ```

2. Update `DATABASE_URL` with correct username:
   ```bash
   # For Homebrew PostgreSQL, use your macOS username
   DATABASE_URL="postgresql://$(whoami)@localhost:5432/tutor_quality"
   ```

3. Verify you can connect:
   ```bash
   psql -d tutor_quality
   ```

### Import Data Fails

If CSV import fails:

```bash
# Regenerate data
python tutor_data_gen.py --mode production

# Clear and retry
npm run import-data:clear
```

### Port 3000 Already in Use

```bash
# Kill existing Next.js process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## Project Structure

```
tutor/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── dashboard/        # Dashboard-specific components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities
│   └── db.ts             # Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
├── scripts/              # Data scripts
│   ├── import-data.ts
│   ├── generate-alerts.ts
│   └── create-demo-alerts.ts
├── data/                 # CSV files (generated)
└── .env.local           # Environment variables
```

## Next Steps

Once running locally:

1. **Explore the Dashboard** - Review KPIs and trends
2. **Check Alerts** - Visit `/dashboard/alerts` to see notifications
3. **View Tutor Details** - Click any tutor to see full analytics
4. **Customize Thresholds** - Edit `scripts/generate-alerts.ts` for custom alert rules
5. **Deploy to Vercel** - See main README for deployment instructions

## Development Tips

- **Prisma Studio** - Visual database browser:
  ```bash
  npx prisma studio
  ```
  Opens at http://localhost:5555

- **Hot Reload** - Changes auto-refresh in dev mode

- **Type Safety** - Run `npx prisma generate` after schema changes

- **Clear Cache** - If you see stale data:
  ```bash
  rm -rf .next
  npm run dev
  ```

## Need Help?

Check the main [README.md](./README.md) for:
- Detailed architecture documentation
- API endpoint reference
- Data model specifications
- Deployment guide
- Advanced configuration

Built with Next.js 14, Prisma, PostgreSQL, and shadcn/ui.


