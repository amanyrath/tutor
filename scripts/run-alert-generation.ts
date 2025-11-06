import { generateAlerts } from '@/lib/alerts/generator';

/**
 * Script to generate alerts for all active tutors
 * Run with: npx tsx scripts/generate-alerts.ts
 */
async function main() {
  console.log('🚨 Starting alert generation...\n');

  const startTime = Date.now();

  try {
    const result = await generateAlerts();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ Alert generation complete!');
    console.log(`   Duration: ${duration}s`);
    console.log(`   Alerts created: ${result.generated}`);
    console.log(`   Alerts skipped: ${result.skipped}`);
    console.log(`   Errors: ${result.errors}`);

  } catch (error) {
    console.error('❌ Alert generation failed:', error);
    process.exit(1);
  }
}

main();

