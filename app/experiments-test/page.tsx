'use client';

import { useFeatureIsOn, useFeature, useExperimentVariant, useExperiments } from '@/app/providers/experiment-provider';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, XCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ExperimentsTestPage() {
  const { updateAttributes, isLoading, growthbook } = useExperiments();
  
  // Example 1: Boolean feature flag
  const showNewDashboard = useFeatureIsOn('new-dashboard');
  
  // Example 2: Feature with value
  const maxAlerts = useFeature<number>('max-alerts-displayed', 10);
  
  // Example 3: A/B test variant
  const emailVariant = useExperimentVariant('email-template-test');
  
  // Update attributes when component mounts (simulating tutor context)
  useEffect(() => {
    const tutorAttributes = {
      id: 'tutor-demo-123',
      subject: 'mathematics',
      experience_months: 24,
      risk_level: 'low' as const,
      total_sessions: 150,
      avg_rating: 4.8,
      is_new: false,
    };
    
    updateAttributes(tutorAttributes);
  }, [updateAttributes]);

  const isConnected = !!growthbook;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-cyan-500/20 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-cyan-400 font-mono uppercase">
          GrowthBook Integration Test
        </h1>
        <p className="text-gray-400 mt-1">
          Feature flags and A/B testing configuration
        </p>
      </div>
      
      {isLoading ? (
        <div className="text-gray-400 flex items-center gap-2">
          <Activity className="h-4 w-4 animate-spin text-cyan-400" />
          Loading GrowthBook features...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Connection Status Card */}
          <Card className={cn(
            'border-2 bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]',
            isConnected ? 'border-green-500/50 glow-success' : 'border-red-500/50'
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Connection Status
              </CardTitle>
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    isConnected ? 'status-dot-success' : 'status-dot-critical'
                  )} />
                  <span className="text-sm text-gray-400">GrowthBook:</span>
                  <Badge className={cn(
                    'font-mono',
                    isConnected 
                      ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                      : 'bg-red-500/20 text-red-400 border-red-500/50'
                  )}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY ? 'status-dot-success' : 'status-dot-critical'
                  )} />
                  <span className="text-sm text-gray-400">Client Key:</span>
                  <span className="text-sm font-mono text-gray-300">
                    {process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY ? 'Configured' : 'Not Set'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Flags Card */}
          <Card className="border-2 border-cyan-500/30 bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]">
            <CardHeader>
              <CardTitle className="text-xl text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Active Feature Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-cyan-500/50 pl-4 bg-cyan-500/5 py-3 rounded-r">
                  <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-2">Boolean Feature</h3>
                  <p className="text-lg">
                    <span className="text-gray-400 font-mono">new-dashboard:</span>{' '}
                    <span className={cn(
                      'font-mono font-bold',
                      showNewDashboard ? 'text-green-400' : 'text-gray-500'
                    )}>
                      {showNewDashboard ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </p>
                </div>

                <div className="border-l-4 border-cyan-500/50 pl-4 bg-cyan-500/5 py-3 rounded-r">
                  <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-2">Number Feature</h3>
                  <p className="text-lg">
                    <span className="text-gray-400 font-mono">max-alerts-displayed:</span>{' '}
                    <span className="text-cyan-400 font-mono font-bold tabular-nums">{maxAlerts}</span>
                  </p>
                </div>

                <div className="border-l-4 border-cyan-500/50 pl-4 bg-cyan-500/5 py-3 rounded-r">
                  <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-2">A/B Test Variant</h3>
                  <p className="text-lg">
                    <span className="text-gray-400 font-mono">email-template-test:</span>{' '}
                    <span className="text-cyan-400 font-mono font-bold">
                      {emailVariant || 'NOT ASSIGNED'}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card className="border-2 border-cyan-500/20 bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]">
            <CardHeader>
              <CardTitle className="text-xl text-cyan-400 font-mono uppercase tracking-wider">
                How to Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                <li>
                  Go to your GrowthBook dashboard at{' '}
                  <a 
                    href="https://app.growthbook.io" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-cyan-400 hover:text-cyan-300 underline font-mono"
                  >
                    app.growthbook.io
                  </a>
                </li>
                <li>
                  Create a new feature flag called{' '}
                  <code className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-xs">
                    new-dashboard
                  </code>
                </li>
                <li>
                  Create a feature with a number value called{' '}
                  <code className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-xs">
                    max-alerts-displayed
                  </code>
                </li>
                <li>
                  Create an experiment called{' '}
                  <code className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-xs">
                    email-template-test
                  </code>
                </li>
                <li className="text-gray-400">Publish your changes in GrowthBook</li>
                <li className="text-gray-400">Refresh this page to see the values update</li>
                <li className="text-cyan-300 font-semibold">
                  Try toggling features on/off in GrowthBook and watch them update in real-time!
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Tutor Attributes Card */}
          <Card className="border-2 border-cyan-500/30 bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]">
            <CardHeader>
              <CardTitle className="text-xl text-cyan-400 font-mono uppercase tracking-wider">
                Current Tutor Attributes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider">ID:</span>{' '}
                  <span className="text-gray-300 font-mono">tutor-demo-123</span>
                </div>
                <div>
                  <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Subject:</span>{' '}
                  <span className="text-gray-300 font-mono">mathematics</span>
                </div>
                <div>
                  <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Experience:</span>{' '}
                  <span className="text-gray-300 font-mono tabular-nums">24 months</span>
                </div>
                <div>
                  <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Risk Level:</span>{' '}
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50 font-mono">low</Badge>
                </div>
                <div>
                  <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Total Sessions:</span>{' '}
                  <span className="text-gray-300 font-mono tabular-nums">150</span>
                </div>
                <div>
                  <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Avg Rating:</span>{' '}
                  <span className="text-gray-300 font-mono tabular-nums">4.8</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-cyan-500/20">
                These attributes can be used for targeting features to specific tutor segments in GrowthBook.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

