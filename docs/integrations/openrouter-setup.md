# AI Setup Guide

This platform supports three AI providers: OpenAI, OpenRouter, and Anthropic. Choose the one that best fits your needs.

## Quick Comparison

| Provider | Best For | Cost | Setup Difficulty |
|----------|----------|------|------------------|
| **OpenAI** | Latest GPT-4 models, simple setup | $$ | Easy |
| **OpenRouter** | Access to multiple models, flexibility | $ - $$ | Easy |
| **Anthropic** | Direct Claude access | $$ | Easy |

## Option 1: OpenAI (Recommended)

### What is OpenAI?

OpenAI provides direct access to GPT-4 models. This is the simplest option with excellent performance.

### Setup Steps

1. Visit [https://platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Create a new API key
5. Copy your key (starts with `sk-proj-`)

### Configure Your Environment

Add to your `.env` file:

```bash
# OpenAI API Key
OPENAI_API_KEY=sk-proj-your-key-here
```

### Models Used

The platform uses GPT-4o by default, which provides:
- Excellent reasoning capabilities
- Fast response times
- JSON mode support
- Competitive pricing

## Option 2: OpenRouter

OpenRouter is a unified API that provides access to multiple AI models (Claude, GPT-4, Gemini, etc.) through a single interface. It offers several advantages:

- **Lower costs** - Often cheaper than direct API access
- **Model flexibility** - Easy to switch between different AI models
- **Fallback options** - Automatic failover if primary model is unavailable
- **Better rate limiting** - Handles rate limits more gracefully
- **Free credits** - Often provides free credits to get started

### Setup Steps

1. Visit [https://openrouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy your key (starts with `sk-or-v1-`)

### Configure Your Environment

Add to your `.env` file:

```bash
# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# App URL (required by OpenRouter for tracking)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: You can use `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, or `ANTHROPIC_API_KEY`. The system automatically detects which one is available. Priority order: OpenAI > OpenRouter > Anthropic.

### Test the Configuration

Run the test script:

```bash
npx tsx scripts/discover-patterns.ts
```

Or test in code:

```typescript
import { testAIConfiguration } from '@/lib/ai/pattern-analyzer'

const isConfigured = await testAIConfiguration()
console.log('AI configured:', isConfigured)
```

## Supported Models

The platform currently uses Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`), but OpenRouter supports many models:

### Recommended Models

| Model | OpenRouter Path | Best For | Cost |
|-------|----------------|----------|------|
| Claude 3.5 Sonnet | `anthropic/claude-3.5-sonnet` | Default choice, excellent quality | $$ |
| Claude 3 Opus | `anthropic/claude-3-opus` | Most capable, complex analysis | $$$ |
| GPT-4 Turbo | `openai/gpt-4-turbo` | Alternative to Claude | $$ |
| GPT-4o | `openai/gpt-4o` | Latest GPT-4, faster | $$ |
| Gemini Pro 1.5 | `google/gemini-pro-1.5` | Google's latest | $ |
| Llama 3.1 70B | `meta-llama/llama-3.1-70b-instruct` | Open source, cheaper | $ |

### Changing the Model

To use a different model, update `lib/ai/pattern-analyzer.ts`:

```typescript
// Find this line:
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022', // Change this
  // ...
})

// Change to:
const message = await anthropic.messages.create({
  model: 'anthropic/claude-3.5-sonnet', // OpenRouter format
  // ...
})
```

## Cost Comparison

Example costs for 1M tokens (as of Nov 2024):

| Provider | Model | Input | Output | Notes |
|----------|-------|-------|--------|-------|
| OpenAI | GPT-4o | $2.50 | $10.00 | Default choice |
| OpenAI | GPT-4 Turbo | $10.00 | $30.00 | More capable |
| OpenRouter | Claude 3.5 | $3.00 | $15.00 | Often has discounts |
| Direct Anthropic | Claude 3.5 | $3.00 | $15.00 | Standard pricing |
| OpenRouter | Gemini Pro | $0.50 | $1.50 | Very affordable |

**Note**: Prices vary and OpenRouter often offers promotional credits. Check [OpenRouter Pricing](https://openrouter.ai/docs#models) for current rates.

## Rate Limits

OpenRouter handles rate limiting automatically:

- **Free tier**: 200 requests/minute
- **Paid tier**: 3,000 requests/minute
- **Automatic retry**: Built-in retry logic on rate limit errors

The platform's pattern discovery script runs weekly, so rate limits are rarely an issue.

## Troubleshooting

### Error: "AI API key not configured"

**Solution**: Ensure one of the API keys is set in your `.env` file:

```bash
# Choose one:
OPENAI_API_KEY=sk-proj-xxxxx
# OR
OPENROUTER_API_KEY=sk-or-v1-xxxxx
# OR
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

Restart your development server after adding it.

### Error: "HTTP-Referer is required"

**Solution**: Set `NEXT_PUBLIC_APP_URL` in your `.env`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production:

```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Error: "Model not found"

**Solution**: Ensure you're using the OpenRouter model format:

- ✅ Correct: `anthropic/claude-3.5-sonnet`
- ❌ Wrong: `claude-3-5-sonnet-20241022`

Or check [OpenRouter Models](https://openrouter.ai/models) for the exact model name.

### Error: "Insufficient credits"

**Solution**: Add credits to your OpenRouter account:

1. Go to [OpenRouter Billing](https://openrouter.ai/credits)
2. Add credits via credit card
3. Minimum: $5 (usually lasts for many requests)

### Pattern discovery not generating insights

**Solutions**:

1. **Check API key**: Verify key is correct and has credits
2. **Check database**: Ensure sufficient tutor data exists
3. **Check logs**: Look for error messages in console
4. **Test manually**:

```bash
npx tsx scripts/discover-patterns.ts
```

## Advanced Configuration

### Using Multiple Models

You can set up fallback models by modifying the client:

```typescript
// In lib/ai/pattern-analyzer.ts
const models = [
  'anthropic/claude-3.5-sonnet',
  'openai/gpt-4-turbo',
  'google/gemini-pro-1.5'
]

// Try each model until one succeeds
for (const model of models) {
  try {
    const message = await anthropic.messages.create({
      model,
      // ...
    })
    return parseResponse(message)
  } catch (error) {
    console.log(`Model ${model} failed, trying next...`)
  }
}
```

### Custom Headers

OpenRouter allows custom headers for tracking:

```typescript
const anthropic = new Anthropic({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
    'X-Title': 'Tutor Quality Platform',
    'X-Description': 'AI-powered tutor engagement analysis'
  }
})
```

### Monitoring Usage

View your usage and costs:

1. Go to [OpenRouter Dashboard](https://openrouter.ai/activity)
2. See requests, costs, and errors
3. Set up spending limits if desired

## Migration from Anthropic Direct API

If you're currently using Anthropic's API directly:

1. Get an OpenRouter API key
2. Add to `.env`: `OPENROUTER_API_KEY=sk-or-v1-xxxxx`
3. Remove or comment out: `ANTHROPIC_API_KEY=...`
4. Restart your server
5. Test: `npx tsx scripts/discover-patterns.ts`

That's it! The code automatically detects and uses OpenRouter.

## Support

- **OpenRouter Docs**: [https://openrouter.ai/docs](https://openrouter.ai/docs)
- **Discord**: [OpenRouter Discord](https://discord.gg/openrouter)
- **Status**: [https://status.openrouter.ai](https://status.openrouter.ai)

## Best Practices

1. **Set spending limits** - Prevent unexpected charges
2. **Monitor usage** - Check dashboard regularly
3. **Test locally first** - Before deploying to production
4. **Use cheaper models** - For development/testing
5. **Keep API keys secure** - Never commit to git

## Next Steps

After setup:

1. Run pattern discovery: `npx tsx scripts/discover-patterns.ts`
2. View insights: Navigate to `/dashboard/insights`
3. Monitor costs: Check OpenRouter dashboard
4. Experiment with models: Try different models for better results/costs

