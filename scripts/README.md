# Data Import Scripts

## Import CSV Data

Import data from CSV files into the database.

### Usage

```bash
# Import data (skips duplicates)
npm run import-data

# Clear existing data and import fresh
npm run import-data:clear

# Specify custom data directory
npm run import-data -- /path/to/data

# Clear and import from custom directory
npm run import-data -- /path/to/data --clear
```

### Requirements

- CSV files must be in the `data/` directory (or specified path):
  - `tutor_profiles.csv`
  - `sessions.csv`
  - `tutor_aggregates.csv`

- Database must be initialized:
  ```bash
  npx prisma db push
  npx prisma generate
  ```

### Import Order

The script imports data in the correct order to maintain foreign key relationships:
1. **Tutors** - Imported first (parent records)
2. **Sessions** - Imported second (references tutors)
3. **Tutor Aggregates** - Imported last (references tutors)

### Features

- ✅ Batch processing for performance
- ✅ Handles nullable fields correctly
- ✅ Skips duplicates (safe to re-run)
- ✅ Progress indicators
- ✅ Error handling and reporting
- ✅ Type-safe with Prisma

### Notes

- Large datasets (90K+ sessions) may take several minutes
- The script uses `skipDuplicates: true` for tutors, so it's safe to re-run
- Sessions and aggregates are created individually due to relations, but batched for performance


