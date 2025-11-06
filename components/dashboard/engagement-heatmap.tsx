/**
 * Engagement Heatmap Component
 * 
 * Displays activity patterns by day of week and hour
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface HeatmapData {
  dayOfWeek: number
  hour: number
  count: number
}

interface EngagementHeatmapProps {
  tutorId?: string
  days?: number
}

export function EngagementHeatmap({ tutorId, days = 30 }: EngagementHeatmapProps) {
  const [data, setData] = useState<HeatmapData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = tutorId
      ? `/api/engagement/tutors/${tutorId}/timeline?days=${days}`
      : `/api/engagement/metrics?days=${days}`

    fetch(url)
      .then(res => res.json())
      .then(responseData => {
        // Process events into heatmap data
        const events = responseData.events || []
        const heatmapMap = new Map<string, number>()

        events.forEach((event: any) => {
          const date = new Date(event.timestamp)
          const dayOfWeek = date.getDay()
          const hour = date.getHours()
          const key = `${dayOfWeek}-${hour}`

          heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1)
        })

        const heatmapData: HeatmapData[] = []
        for (let day = 0; day < 7; day++) {
          for (let hour = 0; hour < 24; hour++) {
            const key = `${day}-${hour}`
            heatmapData.push({
              dayOfWeek: day,
              hour,
              count: heatmapMap.get(key) || 0
            })
          }
        }

        setData(heatmapData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching heatmap data:', err)
        setLoading(false)
      })
  }, [tutorId, days])

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const maxCount = Math.max(...data.map(d => d.count), 1)

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100'
    const intensity = Math.min(count / maxCount, 1)
    
    if (intensity > 0.75) return 'bg-blue-600'
    if (intensity > 0.5) return 'bg-blue-500'
    if (intensity > 0.25) return 'bg-blue-400'
    return 'bg-blue-200'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
          <CardDescription>Loading activity patterns...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <CardDescription>Activity patterns by day and hour</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Hour labels */}
            <div className="flex mb-1">
              <div className="w-12" /> {/* Spacer for day labels */}
              {hours.map(hour => (
                <div
                  key={hour}
                  className="flex-1 min-w-[20px] text-center text-xs text-gray-500"
                >
                  {hour % 6 === 0 ? hour : ''}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            {dayLabels.map((day, dayIndex) => (
              <div key={day} className="flex items-center mb-1">
                {/* Day label */}
                <div className="w-12 text-xs text-gray-600 font-medium">{day}</div>

                {/* Hour cells */}
                {hours.map(hour => {
                  const cell = data.find(
                    d => d.dayOfWeek === dayIndex && d.hour === hour
                  )
                  const count = cell?.count || 0

                  return (
                    <div
                      key={hour}
                      className={`flex-1 min-w-[20px] h-8 ${getColor(count)} rounded-sm mx-0.5 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all`}
                      title={`${day} ${hour}:00 - ${count} events`}
                    />
                  )
                })}
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-600">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 bg-gray-100 rounded-sm" />
                <div className="w-4 h-4 bg-blue-200 rounded-sm" />
                <div className="w-4 h-4 bg-blue-400 rounded-sm" />
                <div className="w-4 h-4 bg-blue-500 rounded-sm" />
                <div className="w-4 h-4 bg-blue-600 rounded-sm" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
