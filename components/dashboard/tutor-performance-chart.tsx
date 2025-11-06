'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState } from 'react'

interface PerformanceDataPoint {
  date: string
  avgRating: number | null
  avgEngagement: number | null
  avgEmpathy: number | null
  avgClarity: number | null
  avgSatisfaction: number | null
}

interface TutorPerformanceChartProps {
  data: PerformanceDataPoint[]
}

export function TutorPerformanceChart({ data }: TutorPerformanceChartProps) {
  const [metric, setMetric] = useState<'rating' | 'quality'>('rating')

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>No performance data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getLines = () => {
    if (metric === 'rating') {
      return [
        { key: 'avgRating', color: '#3b82f6', name: 'Student Rating' },
      ]
    } else {
      return [
        { key: 'avgEngagement', color: '#3b82f6', name: 'Engagement' },
        { key: 'avgEmpathy', color: '#10b981', name: 'Empathy' },
        { key: 'avgClarity', color: '#f59e0b', name: 'Clarity' },
        { key: 'avgSatisfaction', color: '#8b5cf6', name: 'Satisfaction' },
      ]
    }
  }

  const yDomain = metric === 'rating' ? [0, 5] : [0, 10]
  const yTicks = metric === 'rating' ? [0, 1, 2, 3, 4, 5] : [0, 2, 4, 6, 8, 10]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Last 30 days of daily averages</CardDescription>
          </div>
          <Select value={metric} onValueChange={(v) => setMetric(v as 'rating' | 'quality')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Student Rating</SelectItem>
              <SelectItem value="quality">Quality Scores</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value)
                return `${date.getMonth() + 1}/${date.getDate()}`
              }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              domain={yDomain}
              ticks={yTicks}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px',
              }}
              formatter={(value: any) => {
                if (value === null || value === undefined) return 'N/A'
                const num = typeof value === 'string' ? parseFloat(value) : value
                return isNaN(num) ? 'N/A' : num.toFixed(2)
              }}
              labelFormatter={(label) => {
                const date = new Date(label)
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
            {getLines().map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={2}
                name={line.name}
                dot={{ fill: line.color, r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

