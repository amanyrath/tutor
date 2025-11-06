'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Check, Eye } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  severity: string
  category: string
  title: string
  message: string
  metric: string | null
  metricValue: number | null
  threshold: number | null
  isAcknowledged: boolean
  isResolved: boolean
  createdAt: Date
  tutor: {
    tutorId: string
    primarySubject: string
    activeStatus: boolean
  }
}

interface AlertsListProps {
  initialAlerts: Alert[]
}

export function AlertsList({ initialAlerts }: AlertsListProps) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('unacknowledged')
  const [isAcknowledging, setIsAcknowledging] = useState<string | null>(null)

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'unacknowledged' && !alert.isAcknowledged) ||
      (statusFilter === 'acknowledged' && alert.isAcknowledged)
    return matchesSeverity && matchesStatus
  })

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-400" />
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-400" />
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-400" />
      case 'low':
        return <CheckCircle2 className="h-5 w-5 text-blue-400" />
      default:
        return <Info className="h-5 w-5 text-gray-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-900/30 text-red-400 border-red-500/50'
      case 'high':
        return 'bg-orange-900/30 text-orange-400 border-orange-500/50'
      case 'medium':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50'
      case 'low':
        return 'bg-blue-900/30 text-blue-400 border-blue-500/50'
      default:
        return 'bg-gray-800/50 text-gray-400 border-gray-600/50'
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'churn':
        return 'bg-red-900/30 text-red-400 border-red-500/50'
      case 'engagement':
        return 'bg-blue-900/30 text-blue-400 border-blue-500/50'
      case 'quality':
        return 'bg-purple-900/30 text-purple-400 border-purple-500/50'
      case 'technical':
        return 'bg-orange-900/30 text-orange-400 border-orange-500/50'
      default:
        return 'bg-gray-800/50 text-gray-400 border-gray-600/50'
    }
  }

  const getAlertBorderColor = (severity: string, isAcknowledged: boolean) => {
    if (isAcknowledged) return 'border-l-gray-600/50'
    switch (severity) {
      case 'critical':
        return 'border-l-red-500'
      case 'high':
        return 'border-l-orange-500'
      case 'medium':
        return 'border-l-yellow-500'
      case 'low':
        return 'border-l-blue-500'
      default:
        return 'border-l-gray-600/50'
    }
  }

  const handleAcknowledge = async (alertId: string) => {
    setIsAcknowledging(alertId)
    
    try {
      const response = await fetch('/api/alerts/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      })

      if (response.ok) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId
              ? { ...alert, isAcknowledged: true, acknowledgedAt: new Date() }
              : alert
          )
        )
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    } finally {
      setIsAcknowledging(null)
    }
  }

  if (alerts.length === 0) {
    return (
      <Card className="mission-card">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono">No Alerts</CardTitle>
          <CardDescription className="text-gray-400">
            No alerts have been generated yet. Run the alert generation script to create alerts.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="mission-card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-cyan-400 font-mono uppercase tracking-wide">Active Alerts</CardTitle>
            <CardDescription className="text-gray-400">
              {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} found
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-[#1a1f2e] border-cyan-500/30 text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f1419] border-cyan-500/30">
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px] bg-[#1a1f2e] border-cyan-500/30 text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f1419] border-cyan-500/30">
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'border-l-4 rounded-r-lg p-4 transition-all hover:bg-cyan-500/5',
                getAlertBorderColor(alert.severity, alert.isAcknowledged),
                alert.isAcknowledged ? 'bg-gray-900/20 opacity-70' : 'bg-[#1a1f2e] border border-cyan-500/20'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-200">{alert.title}</h3>
                      <Badge variant="outline" className={cn('text-xs font-mono', getSeverityColor(alert.severity))}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={cn('text-xs', getCategoryBadgeColor(alert.category))}>
                        {alert.category}
                      </Badge>
                      {alert.isAcknowledged && (
                        <Badge variant="outline" className="text-xs bg-green-900/20 text-green-400 border-green-500/50">
                          <Check className="h-3 w-3 mr-1" />
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-300">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                      <span>Tutor: <span className="text-cyan-400">{alert.tutor.tutorId}</span></span>
                      <span>Subject: {alert.tutor.primarySubject}</span>
                      <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                      {alert.metric && alert.metricValue !== null && (
                        <span className="text-yellow-400">
                          {alert.metric}: {alert.metricValue.toFixed(2)}
                          {alert.threshold && ` (threshold: ${alert.threshold.toFixed(2)})`}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Link href={`/dashboard/tutors/${alert.tutor.tutorId}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Tutor
                        </Button>
                      </Link>
                      {!alert.isAcknowledged && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={isAcknowledging === alert.id}
                          className="bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30"
                        >
                          {isAcknowledging === alert.id ? (
                            'Acknowledging...'
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Acknowledge
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


