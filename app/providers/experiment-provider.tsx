// app/providers/experiment-provider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GrowthBook } from '@growthbook/growthbook';
import { createGrowthBook, initializeGrowthBook, TutorAttributes } from '@/lib/experiments/growthbook';

interface ExperimentContextType {
  growthbook: GrowthBook<TutorAttributes> | null;
  isLoading: boolean;
  updateAttributes: (attributes: TutorAttributes) => void;
}

const ExperimentContext = createContext<ExperimentContextType>({
  growthbook: null,
  isLoading: true,
  updateAttributes: () => {},
});

export function ExperimentProvider({ children }: { children: React.ReactNode }) {
  const [growthbook, setGrowthbook] = useState<GrowthBook<TutorAttributes> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize GrowthBook on mount
    const gb = createGrowthBook();
    
    // Initialize with streaming support
    initializeGrowthBook(gb).then(() => {
      setGrowthbook(gb);
      setIsLoading(false);
    });

    // Cleanup on unmount
    return () => {
      gb.destroy();
    };
  }, []);

  const updateAttributes = (attributes: TutorAttributes) => {
    if (growthbook) {
      growthbook.setAttributes(attributes);
    }
  };

  return (
    <ExperimentContext.Provider value={{ growthbook, isLoading, updateAttributes }}>
      {children}
    </ExperimentContext.Provider>
  );
}

// Custom hook to access the experiment context
export function useExperiments() {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperiments must be used within an ExperimentProvider');
  }
  return context;
}

// Custom hook to access a specific feature flag
export function useFeature<T = any>(featureKey: string, defaultValue: T): T {
  const { growthbook, isLoading } = useExperiments();
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    if (!growthbook || isLoading) {
      setValue(defaultValue);
      return;
    }

    // Get initial value
    const featureValue = growthbook.getFeatureValue(featureKey as any, defaultValue);
    setValue(featureValue as T);

    // Subscribe to changes (streaming updates)
    const unsubscribe = growthbook.subscribe(() => {
      const newValue = growthbook.getFeatureValue(featureKey as any, defaultValue);
      setValue(newValue as T);
    });

    return unsubscribe;
  }, [growthbook, isLoading, featureKey, defaultValue]);

  return value;
}

// Custom hook to check if a feature is enabled
export function useFeatureIsOn(featureKey: string): boolean {
  const { growthbook, isLoading } = useExperiments();
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    if (!growthbook || isLoading) {
      setIsOn(false);
      return;
    }

    // Get initial state
    setIsOn(growthbook.isOn(featureKey as any));

    // Subscribe to changes
    const unsubscribe = growthbook.subscribe(() => {
      setIsOn(growthbook.isOn(featureKey as any));
    });

    return unsubscribe;
  }, [growthbook, isLoading, featureKey]);

  return isOn;
}

// Custom hook for A/B test variants
export function useExperimentVariant(experimentKey: string): string | null {
  const { growthbook, isLoading } = useExperiments();
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    if (!growthbook || isLoading) {
      setVariant(null);
      return;
    }

    // Run the experiment and get the variant
    const result = growthbook.run({
      key: experimentKey,
      variations: ['control', 'treatment'],
    });
    
    setVariant(result.value as string);

    // Subscribe to changes
    const unsubscribe = growthbook.subscribe(() => {
      const newResult = growthbook.run({
        key: experimentKey,
        variations: ['control', 'treatment'],
      });
      setVariant(newResult.value as string);
    });

    return unsubscribe;
  }, [growthbook, isLoading, experimentKey]);

  return variant;
}

