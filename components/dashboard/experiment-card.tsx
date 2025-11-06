'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FlaskConical, 
  ExternalLink, 
  Calendar, 
  Users, 
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Pause,
  Archive
} from 'lucide-react'
import Link from 'next/link'

interface ExperimentCardProps {
  experiment: {
    id: string
    name: string
    hypothesis: string
    description?: string | null
    variants: any // JSON array
    primaryMetric: string
    secondaryMetrics?: any | null
    startDate: Date | string
    endDate?: Date | string | null
    status: string
    sampleSize?: number | null
    significance?: number | null
    winner?: string | null
    _count?: {
      assignments: number
    }
  }
}

export function ExperimentCard({ experiment }: ExperimentCardProps) {
  const variants = Array.isArray(experiment.variants) ? experiment.variants : []
  const startDate = new Date(experiment.startDate)
  const endDate = experiment.endDate ? new Date(experiment.endDate) : null
  const isActive = experiment.status === 'active'
  const isCompleted = experiment.status === 'completed'
  const assignmentCount = experiment._count?.assignments || 0
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return { 
          icon: Clock, 
          color: 'bg-gray-900/30 text-gray-400 border-gray-500/50',
          label: 'Draft'
        }
      case 'active':
        return { 
          icon: CheckCircle2, 
          color: 'bg-green-900/30 text-green-400 border-green-500/50',
          label: 'Active'
        }
      case 'paused':
        return { 
          icon: Pause, 
          color: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50',
          label: 'Paused'
        }
      case 'completed':
        return { 
          icon: CheckCircle2, 
          color: 'bg-blue-900/30 text-blue-400 border-blue-500/50',
          label: 'Completed'
        }
      case 'archived':
        return { 
          icon: Archive, 
          color: 'bg-gray-900/30 text-gray-400 border-gray-500/50',
          label: 'Archived'
        }
      default:
        return { 
          icon: Clock, 
          color: 'bg-gray-900/30 text-gray-400 border-gray-500/50',
          label: status
        }
    }
  }
  
  const statusBadge = getStatusBadge(experiment.status)
  const StatusIcon = statusBadge.icon
  
  // GrowthBook link - link to main dashboard with experiment name
  const growthBookUrl = `https://app.growthbook.io`
  
  return (
    <Card className="mission-card rounded-lg border border-indigo-500/20 hover:bg-indigo-500/5 transition-all">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className="font-semibold text-gray-200 text-lg">{experiment.name}</h3>
                <Badge variant="outline" className={`text-xs ${statusBadge.color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusBadge.label}
                </Badge>
                {isCompleted && experiment.winner && (
                  <Badge variant="outline" className="text-xs bg-purple-900/30 text-purple-400 border-purple-500/50">
                    Winner: {experiment.winner}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-300 line-clamp-2">{experiment.hypothesis}</p>
            </div>
          </div>
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                {startDate.toLocaleDateString()}
                {endDate && ` - ${endDate.toLocaleDateString()}`}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="h-4 w-4" />
              <span>{assignmentCount.toLocaleString()} assignments</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <FlaskConical className="h-4 w-4" />
              <span className="truncate">{variants.join(', ')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <Target className="h-4 w-4" />
              <span className="truncate">{experiment.primaryMetric}</span>
            </div>
          </div>
          
          {/* Additional Info */}
          {(experiment.sampleSize || experiment.significance) && (
            <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-700">
              {experiment.sampleSize && (
                <span>Sample Size: <span className="text-indigo-400 font-mono">{experiment.sampleSize.toLocaleString()}</span></span>
              )}
              {experiment.significance && (
                <span>
                  Significance: <span className="text-indigo-400 font-mono">
                    {(experiment.significance * 100).toFixed(2)}%
                  </span>
                </span>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
            <a
              href={growthBookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              View in GrowthBook
            </a>
            <span className="text-gray-600">•</span>
            <Link 
              href={`/dashboard/experiments/${experiment.id}`}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              View Details
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


