/**
 * Activation Metric Card Component
 * 
 * Displays key activation metrics
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Activity, Users, Clock, Calendar } from 'lucide-react'

interface ActivationMetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    value: string
  }
  icon?: 'activity' | 'users' | 'clock' | 'calendar'
  status?: 'good' | 'warning' | 'critical'
}

export function ActivationMetricCard({
  title,
  value,
  subtitle,
  trend,
  icon = 'activity',
  status = 'good'
}: ActivationMetricCardProps) {
  const getIcon = () => {
    const iconClass = 'h-5 w-5'
    switch (icon) {
      case 'users':
        return <Users className={iconClass} />
      case 'clock':
        return <Clock className={iconClass} />
      case 'calendar':
        return <Calendar className={iconClass} />
      default:
        return <Activity className={iconClass} />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-green-600 bg-green-50'
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null

    const iconClass = 'h-4 w-4'
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className={`${iconClass} text-green-600`} />
      case 'down':
        return <TrendingDown className={`${iconClass} text-red-600`} />
      default:
        return <Minus className={`${iconClass} text-gray-600`} />
    }
  }

  const getTrendColor = () => {
    if (!trend) return ''

    switch (trend.direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${getStatusColor()}`}>
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="font-medium">{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
