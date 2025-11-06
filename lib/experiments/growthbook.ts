// lib/experiments/growthbook.ts
import { GrowthBook } from "@growthbook/growthbook";
import { autoAttributesPlugin } from "@growthbook/growthbook/plugins";

export interface TutorAttributes {
  id: string;
  subject?: string;
  experience_months?: number;
  risk_level?: 'low' | 'medium' | 'high';
  total_sessions?: number;
  avg_rating?: number;
  is_new?: boolean;
}

/**
 * Creates a new GrowthBook instance with the provided configuration
 * Uses the official GrowthBook setup pattern
 */
export function createGrowthBook(attributes?: TutorAttributes): GrowthBook<TutorAttributes> {
  const growthbook = new GrowthBook<TutorAttributes>({
    apiHost: "https://cdn.growthbook.io",
    clientKey: process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY || "sdk-hm2pmLtGTHtHm1s",
    enableDevMode: process.env.NODE_ENV === 'development',
    trackingCallback: (experiment, result) => {
      // Send experiment exposure to analytics
      console.log("Viewed Experiment", {
        experimentId: experiment.key,
        variationId: result.key,
        attributes,
      });
      
      // TODO: Send to your analytics provider
      // Example: analytics.track('Experiment Viewed', {...})
    },
    plugins: [autoAttributesPlugin()],
    attributes: attributes || {},
  });

  return growthbook;
}

/**
 * Initialize GrowthBook and load features with streaming
 * Call this once when the app starts
 */
export async function initializeGrowthBook(
  growthbook: GrowthBook<TutorAttributes>
): Promise<void> {
  try {
    await growthbook.init({ streaming: true });
    console.log('GrowthBook initialized successfully');
  } catch (error) {
    console.error('Failed to initialize GrowthBook:', error);
  }
}

/**
 * Update tutor attributes in the GrowthBook instance
 */
export function updateTutorAttributes(
  growthbook: GrowthBook<TutorAttributes>,
  attributes: TutorAttributes
): void {
  growthbook.setAttributes(attributes);
}

