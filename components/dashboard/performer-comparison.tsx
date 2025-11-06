/**
 * Performer Comparison Component
 * 
 * Side-by-side comparison of star vs average vs lagging performers
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PerformerAnalysis {
  starPerformerCount: number
  laggingPerformerCount: number
  differentiatingFactors: {
    metric: string
    starAvg: number
    laggingAvg: number
    p_value: number
    effect_size: number
    significance: string
  }[]
}

export function PerformerComparison() {
  const [analysis, setAnalysis] = useState<PerformerAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/performers?details=false')
      .then(res => res.json())
      .then(data => {
        setAnalysis(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching performer analysis:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performer Comparison</CardTitle>
          <CardDescription>Loading comparison data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performer Comparison</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const chartData = analysis.differentiatingFactors.slice(0, 5).map(factor => ({
    metric: formatMetricName(factor.metric),
    'Star Avg': factor.starAvg,
    'Lagging Avg': factor.laggingAvg,
    difference: Math.abs(factor.starAvg - factor.laggingAvg)
  }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Star Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {analysis.starPerformerCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">Top 10% of tutors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {/* Calculate from total - star - lagging */}
              ~80%
            </div>
            <p className="text-xs text-gray-500 mt-1">Middle 80% of tutors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Lagging Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {analysis.laggingPerformerCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">Bottom 10% of tutors</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metric Comparison</CardTitle>
          <CardDescription>
            Comparison of top metrics between star and lagging performers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" angle={-15} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Star Avg" fill="#10b981" />
              <Bar dataKey="Lagging Avg" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function formatMetricName(metric: string): string {
  return metric
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

