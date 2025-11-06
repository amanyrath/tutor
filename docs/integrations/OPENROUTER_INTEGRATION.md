# OpenRouter Integration - Quick Start

## What Changed?

The platform now supports **both OpenRouter and Anthropic** API keys for AI features. OpenRouter is recommended as it's often cheaper and more flexible.

## Setup (Choose One)

### Option 1: OpenRouter (Recommended)

1. **Get API Key**: Visit [https://openrouter.ai](https://openrouter.ai) and create an account
2. **Add to .env**:
   ```bash
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
3. **Done!** The system automatically uses OpenRouter

### Option 2: Direct Anthropic API

1. **Get API Key**: Visit [https://console.anthropic.com](https://console.anthropic.com)
2. **Add to .env**:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```
3. **Done!** The system automatically uses Anthropic

## Why OpenRouter?

- ✅ **Cheaper** - Often 20-50% lower costs
- ✅ **Flexible** - Easy to switch between Claude, GPT-4, Gemini
- ✅ **Fallback** - Automatic failover if model unavailable
- ✅ **Free Credits** - Often provides free credits to start
- ✅ **Better Rate Limits** - Handles rate limiting gracefully

## Testing

```bash
# Test pattern discovery
npx tsx scripts/discover-patterns.ts

# Create demo insights
npm run demo-insights

# View in dashboard
http://localhost:3000/dashboard/insights
```

## What Models Can I Use?

The system uses Claude 3.5 Sonnet by default, but with OpenRouter you can easily switch to:

- `anthropic/claude-3.5-sonnet` - Default, excellent quality
- `openai/gpt-4-turbo` - OpenAI's latest
- `google/gemini-pro-1.5` - Google's model (cheaper)
- `meta-llama/llama-3.1-70b-instruct` - Open source

See `docs/openrouter-setup.md` for detailed model information.

## Troubleshooting

**Error: AI API key not configured**
- Add `OPENROUTER_API_KEY` or `ANTHROPIC_API_KEY` to `.env`
- Restart dev server

**Error: HTTP-Referer required**
- Add `NEXT_PUBLIC_APP_URL=http://localhost:3000` to `.env`

**Pattern discovery not working**
- Check API key has sufficient credits
- Ensure database has tutor data
- See full guide: `docs/openrouter-setup.md`

## More Info

- Full OpenRouter setup guide: `docs/openrouter-setup.md`
- Insights dashboard docs: `docs/insights-dashboard.md`
- Quick reference: `docs/insights-quickref.md`

## Files Modified

- `lib/ai/pattern-analyzer.ts` - Now supports both APIs
- `.env.example` - Added configuration examples
- Documentation updated with OpenRouter info

## Cost Comparison (per 1M tokens)

| Provider | Input | Output |
|----------|-------|--------|
| OpenRouter (Claude) | ~$3 | ~$15 |
| Direct Anthropic | $3 | $15 |
| OpenRouter (Gemini) | ~$0.50 | ~$1.50 |

OpenRouter often has promotional credits and discounts!

---

**Ready to go!** Add your API key and start generating insights.

