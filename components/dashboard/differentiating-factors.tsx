/**
 * Differentiating Factors Component
 * 
 * Displays statistically significant factors that differentiate star performers
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

interface DifferentiatingFactor {
  metric: string
  starAvg: number
  averageAvg: number
  laggingAvg: number
  pValue: number
  effectSize: number
  significance: 'high' | 'medium' | 'low' | 'not_significant'
  insight: string
}

export function DifferentiatingFactors() {
  const [factors, setFactors] = useState<DifferentiatingFactor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/performers?details=false')
      .then(res => res.json())
      .then(data => {
        setFactors(data.differentiatingFactors || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching differentiating factors:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Differentiating Factors</CardTitle>
          <CardDescription>Loading statistical analysis...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const getSignificanceBadge = (significance: DifferentiatingFactor['significance']) => {
    switch (significance) {
      case 'high':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Highly Significant</Badge>
      case 'medium':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Significant</Badge>
      case 'low':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Marginally Significant</Badge>
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Not Significant</Badge>
    }
  }

  const getEffectSizeBadge = (effectSize: number) => {
    const absEffect = Math.abs(effectSize)
    if (absEffect > 0.8) {
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Large Effect</Badge>
    }
    if (absEffect > 0.5) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Medium Effect</Badge>
    }
    return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Small Effect</Badge>
  }

  const formatMetricName = (metric: string) => {
    return metric
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  const calculatePercentDifference = (starAvg: number, laggingAvg: number) => {
    if (laggingAvg === 0) return 'N/A'
    const diff = ((starAvg - laggingAvg) / laggingAvg) * 100
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-500" />
          Statistically Significant Differentiating Factors
        </CardTitle>
        <CardDescription>
          Metrics that significantly differentiate star performers from lagging performers (p &lt; 0.05). Only statistically significant factors are shown.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {factors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No statistically significant differentiating factors found.
              This could indicate insufficient data or minimal performance differences.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {factors
              .filter(factor => factor.significance !== 'not_significant')
              .map((factor, index) => (
                <div
                  key={index}
                  className="p-5 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg flex items-center gap-2 mb-1">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        {formatMetricName(factor.metric)}
                      </h3>
                      {factor.insight && (
                        <p className="text-sm text-muted-foreground mt-1">{factor.insight}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {getSignificanceBadge(factor.significance)}
                      {getEffectSizeBadge(factor.effectSize)}
                    </div>
                  </div>

                  {/* Comparison */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 rounded-md bg-green-50 dark:bg-green-950/20">
                      <p className="text-xs text-muted-foreground mb-1">Star Performers</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {factor.starAvg.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-md bg-blue-50 dark:bg-blue-950/20">
                      <p className="text-xs text-muted-foreground mb-1">Average Performers</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {factor.averageAvg.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-md bg-red-50 dark:bg-red-950/20">
                      <p className="text-xs text-muted-foreground mb-1">Lagging Performers</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {factor.laggingAvg.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Difference Highlight */}
                  <div className="mb-4 p-3 rounded-md bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Difference (Star vs Lagging)</span>
                      <span className="text-xl font-bold text-primary">
                        {calculatePercentDifference(factor.starAvg, factor.laggingAvg)}
                      </span>
                    </div>
                  </div>

                  {/* Statistical Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">p-value:</span>
                      <span className="font-mono">{factor.pValue.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Effect size (Cohen's d):</span>
                      <span className="font-mono">{factor.effectSize.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


