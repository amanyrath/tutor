import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ScoreCardProps {
  title: string
  score: number | null
  maxScore: number
  description?: string
  benchmark?: number
  critical?: boolean
}

export function ScoreCard({
  title,
  score,
  maxScore,
  description,
  benchmark,
  critical,
}: ScoreCardProps) {
  if (score === null) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-400">N/A</div>
          <p className="text-xs text-gray-500 mt-2">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const percentage = (score / maxScore) * 100
  const isAboveBenchmark = benchmark ? score >= benchmark : null

  const getColor = () => {
    if (critical) return 'border-red-200 bg-red-50'
    if (percentage >= 75) return 'border-green-200 bg-green-50'
    if (percentage >= 50) return 'border-yellow-200 bg-yellow-50'
    return 'border-red-200 bg-red-50'
  }

  const getProgressColor = () => {
    if (critical) return 'bg-red-500'
    if (percentage >= 75) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className={cn('transition-shadow hover:shadow-md', getColor())}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {isAboveBenchmark !== null && (
            <div className="flex items-center">
              {isAboveBenchmark ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold">{score.toFixed(1)}</span>
          <span className="text-sm text-gray-500">/ {maxScore}</span>
        </div>
        
        <Progress 
          value={percentage} 
          className="h-2 mb-3"
        />
        
        {description && (
          <p className="text-xs text-gray-600 mb-2">{description}</p>
        )}
        
        {benchmark && (
          <p className="text-xs text-gray-500">
            Benchmark: {benchmark.toFixed(1)} 
            {isAboveBenchmark ? ' ✓' : ' ⚠️'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

