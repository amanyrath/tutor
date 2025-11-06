'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlertsOverviewProps {
  severityCount: Record<string, number>
  totalAlerts: number
}

export function AlertsOverview({ severityCount, totalAlerts }: AlertsOverviewProps) {
  const critical = severityCount.critical || 0
  const high = severityCount.high || 0
  const medium = severityCount.medium || 0
  const low = severityCount.low || 0
  const unacknowledged = critical + high + medium + low

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className={cn(
        "mission-card border-red-500/50",
        critical > 0 && "glow-critical"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-300">Critical</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400 font-mono">{critical}</div>
          <p className="text-xs text-red-400/70 mt-1">Immediate action required</p>
        </CardContent>
      </Card>

      <Card className={cn(
        "mission-card border-orange-500/50",
        high > 0 && "glow-warning"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-300">High</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-400 font-mono">{high}</div>
          <p className="text-xs text-orange-400/70 mt-1">Needs attention soon</p>
        </CardContent>
      </Card>

      <Card className="mission-card border-yellow-500/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-300">Medium</CardTitle>
          <Info className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-400 font-mono">{medium}</div>
          <p className="text-xs text-yellow-400/70 mt-1">Monitor and plan</p>
        </CardContent>
      </Card>

      <Card className="mission-card border-blue-500/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-300">Low</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-400 font-mono">{low}</div>
          <p className="text-xs text-blue-400/70 mt-1">For awareness</p>
        </CardContent>
      </Card>
    </div>
  )
}

