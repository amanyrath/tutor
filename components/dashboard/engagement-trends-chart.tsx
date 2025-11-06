'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts'
import { useState } from 'react'
import { Download, ZoomIn, ZoomOut } from 'lucide-react'

interface EngagementData {
  date: string
  avgEngagement: number
  avgEmpathy: number
  avgClarity: number
  avgSatisfaction: number
}

interface EngagementTrendsChartProps {
  data: EngagementData[]
}

export function EngagementTrendsChart({ data }: EngagementTrendsChartProps) {
  const [timeRange, setTimeRange] = useState('30')
  const [metric, setMetric] = useState('all')
  const [showBrush, setShowBrush] = useState(false)

  const filteredData = data.slice(-parseInt(timeRange))

  const getLines = () => {
    if (metric === 'all') {
      return [
        { key: 'avgEngagement', color: '#00d4ff', name: 'Engagement' },
        { key: 'avgEmpathy', color: '#10b981', name: 'Empathy' },
        { key: 'avgClarity', color: '#fbbf24', name: 'Clarity' },
        { key: 'avgSatisfaction', color: '#8b5cf6', name: 'Satisfaction' },
      ]
    }
    
    const metricMap: Record<string, { key: string; color: string; name: string }> = {
      engagement: { key: 'avgEngagement', color: '#00d4ff', name: 'Engagement' },
      empathy: { key: 'avgEmpathy', color: '#10b981', name: 'Empathy' },
      clarity: { key: 'avgClarity', color: '#fbbf24', name: 'Clarity' },
      satisfaction: { key: 'avgSatisfaction', color: '#8b5cf6', name: 'Satisfaction' },
    }
    
    return [metricMap[metric]]
  }

  const exportData = () => {
    const csv = [
      ['Date', 'Engagement', 'Empathy', 'Clarity', 'Satisfaction'].join(','),
      ...filteredData.map(d => [
        d.date,
        d.avgEngagement.toFixed(2),
        d.avgEmpathy.toFixed(2),
        d.avgClarity.toFixed(2),
        d.avgSatisfaction.toFixed(2)
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `engagement-trends-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <Card className="mission-card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-cyan-400 font-mono uppercase tracking-wide">Engagement Trends</CardTitle>
            <CardDescription className="text-gray-400">Quality metrics across all tutors over time</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="bg-[#1a1f2e] border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBrush(!showBrush)}
              className="bg-[#1a1f2e] border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              {showBrush ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </Button>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-[150px] bg-[#1a1f2e] border-cyan-500/30 text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f1419] border-cyan-500/30">
                <SelectItem value="all">All Metrics</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="empathy">Empathy</SelectItem>
                <SelectItem value="clarity">Clarity</SelectItem>
                <SelectItem value="satisfaction">Satisfaction</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px] bg-[#1a1f2e] border-cyan-500/30 text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f1419] border-cyan-500/30">
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={showBrush ? 400 : 350}>
          <LineChart data={filteredData}>
            <defs>
              {getLines().map((line) => (
                <linearGradient key={line.key} id={`gradient-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={line.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={line.color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8"
              fontSize={11}
              tickFormatter={(value) => {
                const date = new Date(value)
                return `${date.getMonth() + 1}/${date.getDate()}`
              }}
            />
            <YAxis 
              stroke="#94a3b8"
              fontSize={11}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f1419',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '6px',
                padding: '12px',
                boxShadow: '0 0 15px rgba(0, 212, 255, 0.2)',
              }}
              labelStyle={{ color: '#00d4ff', fontWeight: 'bold', marginBottom: '8px' }}
              itemStyle={{ color: '#e2e8f0', padding: '4px 0' }}
              formatter={(value: number) => [value.toFixed(2), undefined]}
              labelFormatter={(label) => {
                const date = new Date(label)
                return date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value) => <span className="text-gray-300">{value}</span>}
            />
            {getLines().map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={2.5}
                name={line.name}
                dot={{ fill: line.color, r: 4, strokeWidth: 2, stroke: '#0a0e1a' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: line.color, fill: '#0a0e1a' }}
              />
            ))}
            {showBrush && (
              <Brush 
                dataKey="date" 
                height={30} 
                stroke="#00d4ff"
                fill="#1a1f2e"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


