# Database Migration Guide

## Migration Status

✅ Initial migration created: `prisma/migrations/0_init/migration.sql`

## Migration Methods

### Option 1: Use Migrations (Recommended for Production)

```bash
# After setting DATABASE_URL
npx prisma migrate deploy
npx prisma generate
```

This applies all pending migrations in order. Safe for production.

### Option 2: Use db push (Alternative)

```bash
# After setting DATABASE_URL
npx prisma db push
npx prisma generate
```

Faster but less production-safe. Use for development or if migrations aren't set up.

## Running Migrations

### Locally (with production DATABASE_URL)

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Set DATABASE_URL
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2)

# Run migration
npx prisma migrate deploy
npx prisma generate
```

### Via Script

```bash
# Make sure DATABASE_URL is set
export DATABASE_URL="your-connection-string"

# Run migration script
./scripts/migrate-database.sh
```

## Migration File

The migration file `prisma/migrations/0_init/migration.sql` contains:
- All table definitions
- Indexes
- Foreign keys
- Complete schema

## Verification

After migration:

1. **Check tables were created:**
   ```bash
   npx prisma studio
   ```

2. **Test database connection:**
   ```bash
   # After deployment
   curl https://your-app.vercel.app/api/test-db
   ```

3. **Verify in Vercel logs:**
   - Check deployment logs for any migration errors
   - Verify Prisma client generation succeeded

## Troubleshooting

### Migration fails
- Check DATABASE_URL is correct
- Verify database is accessible
- Check database user has CREATE TABLE permissions

### Prisma client not generated
- Run: `npx prisma generate`
- Check for TypeScript errors
- Verify schema.prisma is valid

### Tables already exist
- If using `db push`, it will update existing tables
- If using migrations, mark migration as applied: `npx prisma migrate resolve --applied 0_init`

## Next Steps

After successful migration:
1. Deploy application: `vercel --prod`
2. Verify database connection works
3. Test API endpoints
4. Check Vercel logs for errors

See `PRISMA_MIGRATION.md` for more details.

