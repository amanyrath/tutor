#!/usr/bin/env tsx

/**
 * Test AI API Connection
 * 
 * Verifies that OpenRouter or Anthropic API is configured and working
 */

// Load environment variables from .env file
import { config } from 'dotenv'
config()

import { testAIConfiguration } from '../lib/ai/pattern-analyzer'

async function main() {
  console.log('=== AI API Connection Test ===\n')

  // Check environment variables
  console.log('1. Checking environment variables...')
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
  const hasAppUrl = !!process.env.NEXT_PUBLIC_APP_URL

  if (hasOpenAI) {
    console.log('   ✅ OPENAI_API_KEY found')
    console.log(`      Key: ${process.env.OPENAI_API_KEY?.substring(0, 15)}...`)
  } else {
    console.log('   ❌ OPENAI_API_KEY not found')
  }

  if (hasOpenRouter) {
    console.log('   ✅ OPENROUTER_API_KEY found')
    console.log(`      Key: ${process.env.OPENROUTER_API_KEY?.substring(0, 15)}...`)
  } else {
    console.log('   ❌ OPENROUTER_API_KEY not found')
  }

  if (hasAnthropic) {
    console.log('   ✅ ANTHROPIC_API_KEY found')
    console.log(`      Key: ${process.env.ANTHROPIC_API_KEY?.substring(0, 15)}...`)
  } else {
    console.log('   ❌ ANTHROPIC_API_KEY not found')
  }

  if (hasOpenRouter && !hasAppUrl) {
    console.log('   ⚠️  NEXT_PUBLIC_APP_URL not set (recommended for OpenRouter)')
  } else if (hasOpenRouter && hasAppUrl) {
    console.log(`   ✅ NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`)
  }

  if (!hasOpenAI && !hasOpenRouter && !hasAnthropic) {
    console.log('\n❌ ERROR: No API key configured!')
    console.log('\nPlease add one of the following to your .env file:')
    console.log('  OPENAI_API_KEY=sk-proj-xxxxx')
    console.log('  or')
    console.log('  OPENROUTER_API_KEY=sk-or-v1-xxxxx')
    console.log('  or')
    console.log('  ANTHROPIC_API_KEY=sk-ant-xxxxx')
    console.log('\nSee docs/openrouter-setup.md for setup instructions.')
    process.exit(1)
  }

  const usingProvider = hasOpenAI ? 'OpenAI' : hasOpenRouter ? 'OpenRouter' : 'Anthropic'
  console.log(`\n   Using: ${usingProvider}`)
  // Test API connection
  console.log('\n2. Testing API connection...')
  console.log('   Sending test request to AI...')

  try {
    const isWorking = await testAIConfiguration()

    if (isWorking) {
      console.log('   ✅ API connection successful!')
      console.log(`   ✅ ${usingProvider} is working correctly`)
      console.log('\n=== Test Complete ===')
      console.log(`\n✅ SUCCESS! Your ${usingProvider} API is configured and working.`)
      console.log('\nYou can now:')
      console.log('  • Run pattern discovery: npx tsx scripts/discover-patterns.ts')
      console.log('  • Create demo insights: npm run demo-insights')
      console.log('  • View dashboard: http://localhost:3000/dashboard/insights')
      process.exit(0)
    } else {
      console.log('   ❌ API connection failed')
      console.log('\n=== Test Failed ===')
      console.log('\nPossible issues:')
      console.log('  • API key is invalid or expired')
      console.log('  • No credits available on your account')
      console.log('  • Network/firewall blocking the request')
      console.log(`  • ${usingProvider} service is down`)
      console.log('\nTroubleshooting:')
      console.log('  1. Verify your API key is correct')
      if (hasOpenRouter) {
        console.log('  2. Check credits at https://openrouter.ai/credits')
        console.log('  3. Verify HTTP-Referer is set: NEXT_PUBLIC_APP_URL in .env')
      } else {
        console.log('  2. Check credits at https://console.anthropic.com')
      }
      console.log('  4. See docs/openrouter-setup.md for detailed troubleshooting')
      process.exit(1)
    }
  } catch (error) {
    console.log('   ❌ Error during API test')
    console.log('\n=== Test Failed ===')
    console.log('\nError details:')
    if (error instanceof Error) {
      console.log(`  ${error.message}`)
      if (error.message.includes('fetch')) {
        console.log('\n  This looks like a network error.')
        console.log('  Check your internet connection and firewall settings.')
      } else if (error.message.includes('401') || error.message.includes('403')) {
        console.log('\n  This looks like an authentication error.')
        console.log('  Verify your API key is correct and has sufficient permissions.')
      } else if (error.message.includes('429')) {
        console.log('\n  This looks like a rate limit error.')
        console.log('  Wait a moment and try again.')
      }
    } else {
      console.log(`  ${error}`)
    }
    console.log('\nFor help, see docs/openrouter-setup.md')
    process.exit(1)
  }
}

main()

