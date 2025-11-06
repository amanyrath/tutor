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
  laggingAvg: number
  p_value: number
  effect_size: number
  significance: string
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

  const getSignificanceBadge = (significance: string) => {
    if (significance.includes('Highly Significant')) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Highly Significant</Badge>
    }
    if (significance.includes('Significant')) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Significant</Badge>
    }
    return <Badge variant="secondary">Not Significant</Badge>
  }

  const getEffectSizeBadge = (effectSize: number) => {
    const absEffect = Math.abs(effectSize)
    if (absEffect > 0.8) {
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Large Effect</Badge>
    }
    if (absEffect > 0.5) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium Effect</Badge>
    }
    return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Small Effect</Badge>
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
          Metrics that significantly differentiate star performers from lagging performers (p &lt; 0.05)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {factors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600">
              No statistically significant differentiating factors found.
              This could indicate insufficient data or minimal performance differences.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {factors.map((factor, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      {formatMetricName(factor.metric)}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    {getSignificanceBadge(factor.significance)}
                    {getEffectSizeBadge(factor.effect_size)}
                  </div>
                </div>

                {/* Comparison */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Star Performers</p>
                    <p className="text-2xl font-bold text-green-600">
                      {factor.starAvg.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Lagging Performers</p>
                    <p className="text-2xl font-bold text-red-600">
                      {factor.laggingAvg.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Difference</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {calculatePercentDifference(factor.starAvg, factor.laggingAvg)}
                    </p>
                  </div>
                </div>

                {/* Statistical Details */}
                <div className="flex gap-6 text-sm text-gray-600 pt-3 border-t">
                  <div>
                    <span className="font-medium">p-value:</span> {factor.p_value.toFixed(4)}
                  </div>
                  <div>
                    <span className="font-medium">Effect size (Cohen's d):</span> {factor.effect_size.toFixed(2)}
                  </div>
                  <div className="text-xs italic">
                    {factor.significance}
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

