/**
 * Activation Timeline Component
 * 
 * Displays a timeline of tutor engagement events
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, CheckCircle, XCircle, Calendar, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

interface EngagementEvent {
  id: string
  eventType: string
  timestamp: string
  eventData?: any
}

interface ActivationTimelineProps {
  tutorId: string
  days?: number
}

export function ActivationTimeline({ tutorId, days = 30 }: ActivationTimelineProps) {
  const [events, setEvents] = useState<EngagementEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/engagement/tutors/${tutorId}/timeline?days=${days}`)
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching timeline:', err)
        setLoading(false)
      })
  }, [tutorId, days])

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'session_completed':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'session_scheduled':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'message_sent':
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'login':
        return 'bg-green-100 text-green-800'
      case 'session_completed':
        return 'bg-blue-100 text-blue-800'
      case 'session_scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'message_sent':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatEventType = (eventType: string) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Loading engagement history...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Last {days} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <XCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600">No activity recorded in the last {days} days</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>{events.length} events in last {days} days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Events */}
          {events.map((event, index) => (
            <div key={event.id} className="relative flex gap-4 pl-2">
              {/* Icon */}
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-gray-200">
                {getEventIcon(event.eventType)}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className={getEventColor(event.eventType)}>
                    {formatEventType(event.eventType)}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                  </span>
                </div>

                {event.eventData && Object.keys(event.eventData).length > 0 && (
                  <div className="text-sm text-gray-600 mt-2">
                    {Object.entries(event.eventData).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
