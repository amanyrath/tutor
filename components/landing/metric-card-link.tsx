'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { MetricDefinition, MetricStatus, getMetricStatus, isHigherBetter } from '@/lib/dashboard-config'
import { cn } from '@/lib/utils'

interface MetricCardLinkProps {
  metric: MetricDefinition
  value: number
  trend?: number // Percentage change from previous period
  className?: string
}

const statusStyles: Record<MetricStatus, string> = {
  success: 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20',
  warning: 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20',
  danger: 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20',
  neutral: 'border-border bg-card'
}

const statusTextStyles: Record<MetricStatus, string> = {
  success: 'text-green-700 dark:text-green-400',
  warning: 'text-yellow-700 dark:text-yellow-400',
  danger: 'text-red-700 dark:text-red-400',
  neutral: 'text-foreground'
}

const statusBadgeStyles: Record<MetricStatus, string> = {
  success: 'bg-green-500/10 text-green-700 dark:text-green-400',
  warning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  danger: 'bg-red-500/10 text-red-700 dark:text-red-400',
  neutral: 'bg-muted text-muted-foreground'
}

export function MetricCardLink({ metric, value, trend, className }: MetricCardLinkProps) {
  const higherBetter = isHigherBetter(metric.id)
  const status = getMetricStatus(value, metric.statusThresholds, higherBetter)
  const formattedValue = metric.valueFormatter?.(value) ?? value.toString()

  const renderTrend = () => {
    if (!metric.trendEnabled || trend === undefined) return null

    const isPositive = trend > 0
    const isNegative = trend < 0
    const isNeutral = trend === 0

    const trendColor = isNeutral
      ? 'text-muted-foreground'
      : (isPositive && higherBetter) || (isNegative && !higherBetter)
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400'

    return (
      <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
        {isPositive && <TrendingUp className="h-3 w-3" />}
        {isNegative && <TrendingDown className="h-3 w-3" />}
        {isNeutral && <Minus className="h-3 w-3" />}
        <span>{Math.abs(trend).toFixed(1)}%</span>
      </div>
    )
  }

  return (
    <Link href={metric.targetDashboard} className={cn('block group', className)}>
      <Card
        className={cn(
          'relative overflow-hidden border-2 transition-all duration-200',
          'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1',
          statusStyles[status]
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {metric.title}
              </h3>
              <p className="text-xs text-muted-foreground/70">
                {metric.description}
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>

          {/* Value */}
          <div className="flex items-end justify-between">
            <div>
              <div className={cn('text-3xl font-bold mb-1', statusTextStyles[status])}>
                {formattedValue}
              </div>
              {renderTrend()}
            </div>

            {/* Status Badge */}
            <div
              className={cn(
                'px-2 py-1 rounded-md text-xs font-medium',
                statusBadgeStyles[status]
              )}
            >
              {status === 'success' && 'Good'}
              {status === 'warning' && 'Warning'}
              {status === 'danger' && 'Critical'}
              {status === 'neutral' && 'Normal'}
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </Card>
    </Link>
  )
}

