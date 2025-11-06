'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, AlertCircle, CheckCircle, UserCheck, TrendingUp, TrendingDown } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ActivityItem {
  id: string
  type: 'session' | 'alert' | 'status' | 'performance'
  message: string
  timestamp: Date
  severity?: 'success' | 'warning' | 'danger' | 'info'
  tutorId?: string
}

export function ActivityStream() {
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    const generateMockActivities = (): ActivityItem[] => {
      const now = new Date()
      return [
        {
          id: '1',
          type: 'alert',
          message: 'High churn risk detected for T0042',
          timestamp: new Date(now.getTime() - 2 * 60000),
          severity: 'danger',
          tutorId: 'T0042'
        },
        {
          id: '2',
          type: 'session',
          message: 'T0123 completed session with 9.2 rating',
          timestamp: new Date(now.getTime() - 5 * 60000),
          severity: 'success',
          tutorId: 'T0123'
        },
        {
          id: '3',
          type: 'performance',
          message: 'T0089 trending up - 3 consecutive high ratings',
          timestamp: new Date(now.getTime() - 8 * 60000),
          severity: 'success',
          tutorId: 'T0089'
        },
        {
          id: '4',
          type: 'alert',
          message: 'Low engagement score for T0156',
          timestamp: new Date(now.getTime() - 12 * 60000),
          severity: 'warning',
          tutorId: 'T0156'
        },
        {
          id: '5',
          type: 'status',
          message: 'T0234 back online after 2 days',
          timestamp: new Date(now.getTime() - 15 * 60000),
          severity: 'info',
          tutorId: 'T0234'
        },
        {
          id: '6',
          type: 'session',
          message: 'T0067 completed first session - 7.8 rating',
          timestamp: new Date(now.getTime() - 20 * 60000),
          severity: 'info',
          tutorId: 'T0067'
        },
        {
          id: '7',
          type: 'performance',
          message: 'T0198 trending down - below 7.0 avg',
          timestamp: new Date(now.getTime() - 25 * 60000),
          severity: 'danger',
          tutorId: 'T0198'
        },
        {
          id: '8',
          type: 'alert',
          message: 'Alert acknowledged for T0042',
          timestamp: new Date(now.getTime() - 28 * 60000),
          severity: 'success',
          tutorId: 'T0042'
        }
      ]
    }

    setActivities(generateMockActivities())

    const interval = setInterval(() => {
      setActivities(generateMockActivities())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type: string, severity?: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      case 'session':
        return <Activity className="h-4 w-4 text-cyan-400" />
      case 'status':
        return <UserCheck className="h-4 w-4 text-blue-400" />
      case 'performance':
        return severity === 'danger' ? 
          <TrendingDown className="h-4 w-4 text-red-400" /> :
          <TrendingUp className="h-4 w-4 text-green-400" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'danger':
        return 'border-l-red-500 bg-red-900/10'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-900/10'
      case 'success':
        return 'border-l-green-500 bg-green-900/10'
      default:
        return 'border-l-cyan-500 bg-cyan-900/10'
    }
  }

  const getTimeAgo = (timestamp: Date): string => {
    const seconds = Math.floor((new Date().getTime() - timestamp.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <Card className="mission-card h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-cyan-400 font-mono uppercase tracking-wide text-sm">
              Activity Stream
            </CardTitle>
            <CardDescription className="text-gray-500 text-xs">Real-time updates</CardDescription>
          </div>
          <div className="status-dot-success pulse-glow" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`border-l-2 pl-3 py-2 transition-colors hover:bg-cyan-500/5 ${getSeverityColor(activity.severity)}`}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                {getActivityIcon(activity.type, activity.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 leading-snug">
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 font-mono">
                    {getTimeAgo(activity.timestamp)}
                  </span>
                  {activity.tutorId && (
                    <Badge variant="outline" className="text-xs font-mono bg-cyan-900/20 text-cyan-400 border-cyan-500/30">
                      {activity.tutorId}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}


