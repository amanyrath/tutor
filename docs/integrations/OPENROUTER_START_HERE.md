# OpenRouter Integration - Done! 🎉

## What You Can Do Now

You can now use **either** OpenRouter or Anthropic API for all AI features. OpenRouter is recommended because it's often cheaper and more flexible.

## Quick Setup

### Step 1: Get an API Key

**Option A: OpenRouter (Recommended)**
1. Go to https://openrouter.ai
2. Sign up (free credits often available)
3. Get your API key (starts with `sk-or-v1-`)

**Option B: Anthropic Direct**
1. Go to https://console.anthropic.com
2. Sign up
3. Get your API key (starts with `sk-ant-`)

### Step 2: Add to Your .env

**For OpenRouter:**
```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For Anthropic:**
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Step 3: Restart & Test

```bash
# Restart dev server
npm run dev

# Test it works (requires database)
npm run demo-insights
# or
npx tsx scripts/discover-patterns.ts

# View insights
http://localhost:3000/dashboard/insights
```

## What Changed?

### The Code Now Supports Both APIs

```typescript
// Before (only Anthropic):
const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

// After (both OpenRouter and Anthropic):
const apiKey = process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY
const isOpenRouter = !!process.env.OPENROUTER_API_KEY

const anthropic = apiKey
  ? new Anthropic({ 
      apiKey: apiKey,
      baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
      defaultHeaders: isOpenRouter ? {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Tutor Quality Platform'
      } : undefined
    })
  : null
```

### Files Changed

1. **`lib/ai/pattern-analyzer.ts`** - Now supports both APIs
2. **`lib/ai/prompts.ts`** - Fixed TypeScript typo
3. **Docs updated** - Added OpenRouter guides

### New Files Created

1. **`OPENROUTER_INTEGRATION.md`** - This quick start
2. **`docs/openrouter-setup.md`** - Detailed 260+ line guide
3. **`env.template`** - Complete environment template
4. **`OPENROUTER_COMPLETE.md`** - Technical summary

## Why OpenRouter?

| Feature | OpenRouter | Direct Anthropic |
|---------|-----------|------------------|
| Cost | Often 20-50% cheaper | Standard pricing |
| Models | Claude, GPT-4, Gemini, Llama | Claude only |
| Rate Limits | 3,000 req/min (paid) | Varies by tier |
| Free Credits | Often available | No |
| Setup | Super easy | Easy |

## Troubleshooting

**❌ Error: AI API key not configured**
```bash
# Add one of these to .env:
OPENROUTER_API_KEY=sk-or-v1-xxxxx
# OR
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Then restart:
npm run dev
```

**❌ Error: HTTP-Referer is required**
```bash
# Add to .env (OpenRouter only):
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**❌ Pattern discovery fails**
- Check API key has credits
- Check database has data
- See `docs/openrouter-setup.md`

## Model Options with OpenRouter

Default: `claude-3-5-sonnet-20241022`

You can easily switch to:
- `anthropic/claude-3.5-sonnet` - Latest Claude
- `openai/gpt-4-turbo` - GPT-4 Turbo  
- `google/gemini-pro-1.5` - Gemini (cheaper!)
- `meta-llama/llama-3.1-70b-instruct` - Open source

Just change the `model` parameter in `lib/ai/pattern-analyzer.ts`

## Cost Example

For generating 100 insights (approx 500K tokens):

| Provider | Cost | Notes |
|----------|------|-------|
| OpenRouter (Claude) | ~$9 | Standard |
| OpenRouter (Gemini) | ~$1 | 89% savings! |
| Direct Anthropic | ~$9 | Standard |

## More Info

- **Quick Start**: `OPENROUTER_INTEGRATION.md`
- **Full Guide**: `docs/openrouter-setup.md`
- **Insights Docs**: `docs/insights-dashboard.md`
- **Quick Ref**: `docs/insights-quickref.md`

## Test It Now

```bash
# 1. Add API key to .env
echo "OPENROUTER_API_KEY=sk-or-v1-your-key" >> .env

# 2. Restart
npm run dev

# 3. Test (needs database)
npm run demo-insights

# 4. View
open http://localhost:3000/dashboard/insights
```

## Need Help?

1. Check `docs/openrouter-setup.md` for detailed setup
2. Verify your API key is correct
3. Make sure you restarted the dev server
4. Check console for error messages

---

**You're all set!** Add your API key and start generating AI insights. 🚀

