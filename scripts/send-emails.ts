import { sendPendingInterventionEmails } from '@/lib/email/scheduler';

/**
 * Script to send pending intervention emails
 * Run with: npx tsx scripts/send-emails.ts
 */
async function main() {
  console.log('📧 Starting email delivery...\n');

  const startTime = Date.now();

  try {
    const result = await sendPendingInterventionEmails();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ Email delivery complete!');
    console.log(`   Duration: ${duration}s`);
    console.log(`   Emails sent: ${result.sent}`);
    console.log(`   Failed: ${result.failed}`);
    console.log(`   Skipped: ${result.skipped}`);

    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered: ${result.errors.length}`);
      result.errors.slice(0, 5).forEach(error => {
        console.log(`   - ${error}`);
      });
      if (result.errors.length > 5) {
        console.log(`   ... and ${result.errors.length - 5} more`);
      }
    }

  } catch (error) {
    console.error('❌ Email delivery failed:', error);
    process.exit(1);
  }
}

main();

