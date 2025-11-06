# Additional Setup Instructions

This document provides additional setup details beyond the main [QUICKSTART.md](./QUICKSTART.md) guide.

## Python Virtual Environment Setup

### Create Virtual Environment (if not exists)

```bash
python3 -m venv venv
```

### Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Verify Installation

```bash
python tutor_data_gen.py --help
```

## Data Generation

### Generate Dev Dataset (Fast, for Testing)

```bash
python tutor_data_gen.py --mode dev
```

This generates:
- 25 tutors
- 14 days of data
- ~1,000 sessions

### Generate Production Dataset (Full Dataset)

```bash
python tutor_data_gen.py --mode production
```

This generates:
- 150 tutors
- 30 days of data
- ~90,000 sessions
- All CSV files in `data/` directory

### Custom Dataset

```bash
python tutor_data_gen.py --tutors 50 --days 7 --sessions-per-day 200
```

### Available Options

```bash
python tutor_data_gen.py --help
```

Options include:
- `--mode`: `dev` or `production`
- `--tutors`: Number of tutors to generate
- `--days`: Number of days of data
- `--sessions-per-day`: Average sessions per day
- `--output-dir`: Output directory (default: `data/`)
- `--include-engagement-events`: Include engagement events CSV
- `--include-interventions`: Include interventions CSV
- `--include-experiments`: Include experiments CSV

## Database Setup Details

### PostgreSQL Installation

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### Create Database

```bash
createdb tutor_quality
```

Or via psql:
```bash
psql -U postgres
CREATE DATABASE tutor_quality;
\q
```

### Verify Connection

```bash
psql -U YOUR_USERNAME -d tutor_quality
```

### Database URL Format

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

Example for local development:
```
postgresql://alexismanyrath@localhost:5432/tutor_quality?schema=public
```

## Environment Variables

Copy `env.template` to `.env`:

```bash
cp env.template .env
```

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string

### Optional but Recommended

- `OPENAI_API_KEY` or `OPENROUTER_API_KEY` or `ANTHROPIC_API_KEY` - For AI features
- `RESEND_API_KEY` - For email alerts
- `GROWTHBOOK_CLIENT_KEY` - For A/B testing
- `NEXT_PUBLIC_APP_URL` - App URL for email links

See `env.template` for complete list.

## Import Data

After generating data:

```bash
npm run import-data
```

This will:
1. Clear existing data (optional prompt)
2. Import tutors from `data/tutor_profiles.csv`
3. Import sessions from `data/sessions.csv`
4. Import aggregates from `data/tutor_aggregates.csv`
5. Import engagement events, interventions, experiments (if present)

### Clear and Re-import

```bash
npm run import-data:clear
```

## Troubleshooting

### Python Import Errors

```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### PostgreSQL Connection Issues

Check PostgreSQL is running:
```bash
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql
```

Verify connection string format and credentials.

### Data Import Errors

1. Check CSV files exist in `data/` directory
2. Verify CSV format matches expected schema
3. Check database connection
4. Review error messages in console

### Port Already in Use

If port 3000 is in use:
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)
```

Or use different port:
```bash
PORT=3001 npm run dev
```

## Deactivate Virtual Environment

When done working:
```bash
deactivate
```

## Next Steps

After setup:
1. Visit `http://localhost:3000` to see the dashboard
2. Check `/api/test-db` to verify database connection
3. Test AI connection: `npm run test-ai`
4. Review [QUICKSTART.md](./QUICKSTART.md) for usage guide
5. See [docs/](./docs/) for detailed documentation

