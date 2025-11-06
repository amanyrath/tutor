// Example: Add this to any client component to test
'use client';

import { useFeatureIsOn, useFeature } from '@/app/providers/experiment-provider';

export function FeatureFlagDemo() {
  // Boolean flag example
  const showNewUI = useFeatureIsOn('new-dashboard');
  
  // Number value example
  const maxAlertsToShow = useFeature<number>('max-alerts-displayed', 10);

  return (
    <div className="border border-cyan-500/20 rounded-lg p-4 mb-4 bg-gray-900/50">
      <h3 className="text-cyan-400 font-semibold mb-2">🎯 Feature Flags Active:</h3>
      <div className="space-y-1 text-sm">
        <p className="text-gray-300">
          New Dashboard UI: <span className={showNewUI ? 'text-green-400' : 'text-gray-500'}>
            {showNewUI ? '✓ Enabled' : '✗ Disabled'}
          </span>
        </p>
        <p className="text-gray-300">
          Max Alerts: <span className="text-cyan-400">{maxAlertsToShow}</span>
        </p>
      </div>
    </div>
  );
}


