/**
 * Reliability Heatmap Component
 * 
 * Visualizes reschedule patterns by time of day and day of week
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TimeOfDayPattern {
  morning: number
  afternoon: number
  evening: number
  night: number
}

interface DayOfWeekPattern {
  [key: string]: number
}

interface ReliabilityHeatmapProps {
  timeOfDayPattern: TimeOfDayPattern
  dayOfWeekPattern?: DayOfWeekPattern
  title?: string
  description?: string
}

export function ReliabilityHeatmap({
  timeOfDayPattern,
  dayOfWeekPattern,
  title = 'Reschedule Pattern Heatmap',
  description = 'When do reschedules happen most frequently?'
}: ReliabilityHeatmapProps) {
  // Convert rate to color intensity (dark theme)
  const getColorIntensity = (rate: number): string => {
    if (rate > 0.3) return 'bg-red-600 border-red-500/50 glow-critical'
    if (rate > 0.2) return 'bg-red-500 border-red-500/40'
    if (rate > 0.15) return 'bg-amber-500 border-amber-500/40 glow-warning'
    if (rate > 0.1) return 'bg-yellow-500/80 border-yellow-500/40'
    if (rate > 0.05) return 'bg-yellow-600/60 border-yellow-500/30'
    return 'bg-green-600/40 border-green-500/30'
  }

  const timeOfDayLabels = {
    morning: '6am-12pm',
    afternoon: '12pm-6pm',
    evening: '6pm-12am',
    night: '12am-6am'
  }

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <Card className="mission-card border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-cyan-400">{title}</CardTitle>
        <CardDescription className="text-gray-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Time of Day Heatmap */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-cyan-300 mb-3">Time of Day Pattern</h4>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(timeOfDayPattern).map(([time, rate]) => (
              <div key={time} className="text-center">
                <div
                  className={`${getColorIntensity(rate)} rounded-lg p-6 transition-all hover:scale-105 cursor-pointer border`}
                >
                  <p className="text-white font-bold text-2xl font-mono">
                    {(rate * 100).toFixed(0)}%
                  </p>
                </div>
                <p className="text-xs text-cyan-300 mt-2 font-medium capitalize">{time}</p>
                <p className="text-xs text-gray-500">{timeOfDayLabels[time as keyof typeof timeOfDayLabels]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Day of Week Heatmap */}
        {dayOfWeekPattern && (
          <div>
            <h4 className="text-sm font-medium text-cyan-300 mb-3">Day of Week Pattern</h4>
            <div className="grid grid-cols-7 gap-2">
              {dayOrder.map((day) => {
                const rate = dayOfWeekPattern[day] || 0
                return (
                  <div key={day} className="text-center">
                    <div
                      className={`${getColorIntensity(rate)} rounded-lg p-4 transition-all hover:scale-105 cursor-pointer border`}
                    >
                      <p className="text-white font-bold text-lg font-mono">
                        {(rate * 100).toFixed(0)}%
                      </p>
                    </div>
                    <p className="text-xs text-cyan-300 mt-1 font-medium">{day.slice(0, 3)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-cyan-500/20">
          <p className="text-xs font-medium text-cyan-300 mb-2">Reschedule Rate</p>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-600/40 border border-green-500/30"></div>
              <span className="text-gray-400">0-5%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-yellow-600/60 border border-yellow-500/30"></div>
              <span className="text-gray-400">5-10%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-yellow-500/80 border border-yellow-500/40"></div>
              <span className="text-gray-400">10-15%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-amber-500 border border-amber-500/40"></div>
              <span className="text-gray-400">15-20%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-500 border border-red-500/40"></div>
              <span className="text-gray-400">20-30%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-600 border border-red-500/50"></div>
              <span className="text-gray-400">30%+</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

