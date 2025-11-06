'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  status?: 'success' | 'warning' | 'danger' | 'default'
  description?: string
  sparklineData?: number[]
}

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <svg className="w-full h-8 mt-2" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="opacity-70"
      />
    </svg>
  )
}

export function MetricCard({
  title,
  value,
  change,
  trend,
  status = 'default',
  description,
  sparklineData,
}: MetricCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const statusClasses = {
    success: 'border-green-500/50 bg-gradient-to-br from-green-900/20 to-green-800/10',
    warning: 'border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10',
    danger: 'border-red-500/50 bg-gradient-to-br from-red-900/20 to-red-800/10',
    default: 'border-cyan-500/30 bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]',
  }

  const glowClasses = {
    success: 'glow-success',
    warning: 'glow-warning',
    danger: 'glow-critical',
    default: '',
  }

  const textColorClasses = {
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    default: 'text-cyan-400',
  }

  const trendIcon = {
    up: <TrendingUp className="h-4 w-4 text-green-400" />,
    down: <TrendingDown className="h-4 w-4 text-red-400" />,
    neutral: <Minus className="h-4 w-4 text-gray-400" />,
  }

  const statusIcon = {
    success: <Activity className="h-4 w-4 text-green-400" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
    danger: <AlertTriangle className="h-4 w-4 text-red-400 pulse-glow" />,
    default: <Activity className="h-4 w-4 text-cyan-400" />,
  }

  return (
    <Card 
      className={cn(
        'transition-all hover:shadow-lg border-2 relative overflow-hidden',
        statusClasses[status],
        status === 'danger' && mounted && glowClasses[status]
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {trend && trendIcon[trend]}
          {statusIcon[status]}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-3xl font-bold font-mono tabular-nums', textColorClasses[status])}>
          {value}
        </div>
        {change && (
          <p className="text-xs text-gray-400 mt-1 font-mono">
            {change}
          </p>
        )}
        {description && (
          <p className={cn('text-xs mt-1 font-semibold', status === 'danger' ? 'text-red-400' : status === 'warning' ? 'text-yellow-400' : 'text-gray-400')}>
            {description}
          </p>
        )}
        {sparklineData && sparklineData.length > 0 && (
          <div className={textColorClasses[status]}>
            <Sparkline data={sparklineData} />
          </div>
        )}
        {mounted && status === 'danger' && (
          <div className="absolute top-0 right-0 w-2 h-2 m-2">
            <div className="status-dot-critical pulse-glow" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}


