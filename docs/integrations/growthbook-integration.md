# GrowthBook Integration - Setup Guide

## Overview
GrowthBook is integrated into the Tutor Quality Dashboard for feature flagging and A/B testing capabilities. This allows you to:
- Control feature rollouts with feature flags
- Run A/B tests on interventions (especially email templates)
- Target features to specific tutor segments
- Update features in real-time without deploying

## What Was Implemented

### Files Created
1. **`lib/experiments/growthbook.ts`** - Core SDK setup and configuration
2. **`app/providers/experiment-provider.tsx`** - React context provider with custom hooks
3. **`app/experiments-test/page.tsx`** - Test page to verify integration

### Files Modified
1. **`app/layout.tsx`** - Wrapped app with ExperimentProvider

## Setup Instructions

### 1. Environment Variables

You need to set up your GrowthBook client key. Create or edit `.env.local`:

```bash
# GrowthBook Configuration
NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY=sdk-hm2pmLtGTHtHm1s
```

**Note:** The key `sdk-hm2pmLtGTHtHm1s` is already configured in your code. If you need to change it, update both `.env.local` and the fallback in `lib/experiments/growthbook.ts`.

### 2. Create Features in GrowthBook Dashboard

1. Go to [https://app.growthbook.io](https://app.growthbook.io)
2. Navigate to your project
3. Create these test features:

#### Feature 1: Boolean Flag
- **Key:** `new-dashboard`
- **Type:** Boolean (on/off)
- **Default Value:** `false`
- **Description:** "Enable new dashboard layout"

#### Feature 2: Number Value
- **Key:** `max-alerts-displayed`
- **Type:** Number
- **Default Value:** `10`
- **Description:** "Maximum number of alerts to show"

#### Feature 3: A/B Test
- **Key:** `email-template-test`
- **Type:** Experiment
- **Variations:** 
  - `control`
  - `treatment`
- **Description:** "Test different email templates"

### 3. Publish Features
Make sure to **publish** your features in GrowthBook. Features in draft mode won't be served to the SDK.

### 4. Test the Integration

1. Start the dev server:
```bash
npm run dev
```

2. Visit the test page:
```
http://localhost:3000/experiments-test
```

3. You should see:
   - ✅ GrowthBook connection status
   - Feature flag values loading from GrowthBook
   - Current tutor attributes

4. Try changing feature values in GrowthBook and watch them update in real-time!

## Usage in Your Components

### Boolean Feature Flag

```typescript
import { useFeatureIsOn } from '@/app/providers/experiment-provider';

function MyComponent() {
  const showNewFeature = useFeatureIsOn('new-dashboard');
  
  return showNewFeature ? <NewDashboard /> : <OldDashboard />;
}
```

### Feature with Value

```typescript
import { useFeature } from '@/app/providers/experiment-provider';

function AlertsList() {
  const maxAlerts = useFeature<number>('max-alerts-displayed', 10);
  
  return <div>Showing {maxAlerts} alerts</div>;
}
```

### A/B Test Variant

```typescript
import { useExperimentVariant } from '@/app/providers/experiment-provider';

function EmailCampaign() {
  const variant = useExperimentVariant('email-template-test');
  
  const template = variant === 'treatment' 
    ? <NewEmailTemplate />
    : <OldEmailTemplate />;
    
  return template;
}
```

### Update Tutor Context

When you have tutor information available (e.g., from authentication or URL params), update the attributes:

```typescript
import { useExperiments } from '@/app/providers/experiment-provider';
import { useEffect } from 'react';

function TutorDashboard({ tutorId }: { tutorId: string }) {
  const { updateAttributes } = useExperiments();
  
  useEffect(() => {
    // Fetch or compute tutor attributes
    const attributes = {
      id: tutorId,
      subject: 'mathematics',
      experience_months: 24,
      risk_level: 'low' as const,
      total_sessions: 150,
      avg_rating: 4.8,
      is_new: false,
    };
    
    updateAttributes(attributes);
  }, [tutorId, updateAttributes]);
  
  return <div>Dashboard content...</div>;
}
```

## Tutor Targeting Attributes

The system passes these attributes to GrowthBook for targeting:

- `id` (string) - Tutor unique identifier
- `subject` (string) - Teaching subject (e.g., "mathematics", "physics")
- `experience_months` (number) - Months of tutoring experience
- `risk_level` ('low' | 'medium' | 'high') - Churn risk level
- `total_sessions` (number) - Total sessions conducted
- `avg_rating` (number) - Average tutor rating
- `is_new` (boolean) - Whether tutor is new (e.g., < 3 months)

### Example Targeting Rules in GrowthBook

Target only high-risk tutors:
```
risk_level = "high"
```

Target experienced tutors:
```
experience_months >= 12
```

Target math tutors with low engagement:
```
subject = "mathematics" AND total_sessions < 50
```

## Features Included

### ✅ Real-time Updates
Features update automatically when changed in GrowthBook (via streaming).

### ✅ Auto Attributes Plugin
Automatically captures browser and device information for additional targeting.

### ✅ Experiment Tracking
All experiment exposures are logged to the console (ready to send to analytics).

### ✅ Dev Mode
Enhanced logging in development environment for debugging.

### ✅ Type Safety
Full TypeScript support with proper types for tutor attributes.

## Next Steps

See related PRs:
- **PR-013:** Experiment assignment persistence (store assignments in database)
- **PR-014:** Experiments dashboard (view and manage experiments in the UI)
- **PR-026:** Intervention builder (use experiments for email A/B testing)

## Troubleshooting

### Features not loading?
- Check that `NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY` is set correctly
- Verify the client key is active in GrowthBook dashboard
- Make sure features are published (not draft) in GrowthBook
- Check browser console for errors

### Experiments not tracking?
- Check browser console for "Viewed Experiment" logs
- Ensure trackingCallback is firing
- Verify experiment configuration in GrowthBook

### Targeting not working?
- Verify attributes are being set with `updateAttributes()`
- Check attribute values in browser console
- Test targeting rules in GrowthBook's visual editor

## Resources

- [GrowthBook Documentation](https://docs.growthbook.io/)
- [GrowthBook JavaScript SDK](https://docs.growthbook.io/lib/js)
- [Feature Flags Best Practices](https://docs.growthbook.io/features)
- [Running A/B Tests](https://docs.growthbook.io/guide/experiments)

