'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  AlertTriangle,
  Users,
  CheckCircle2,
  Archive,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import Link from 'next/link'

interface PatternInsight {
  id: string
  patternType: string
  title: string
  description: string
  affectedTutorIds: string[]
  affectedTutorCount: number
  correlations: Record<string, number> | null
  statisticalSignificance: number | null
  confidenceScore: number
  aiGeneratedRecommendation: string
  aiModel: string | null
  analyzedPeriodStart: Date
  analyzedPeriodEnd: Date
  status: string
  actionTaken: string | null
  actionTakenAt: Date | null
  discoveredAt: Date
}

interface InsightCardProps {
  insight: PatternInsight
  onArchive?: (id: string) => void
  onMarkImplemented?: (id: string) => void
}

export function InsightCard({ insight, onArchive, onMarkImplemented }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'engagement_increase':
        return <TrendingUp className="h-5 w-5 text-green-400" />
      case 'engagement_decrease':
      case 'churn_risk':
        return <TrendingDown className="h-5 w-5 text-red-400" />
      case 'quality_improvement':
        return <Star className="h-5 w-5 text-yellow-400" />
      default:
        return <Lightbulb className="h-5 w-5 text-cyan-400" />
    }
  }

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'engagement_increase':
      case 'quality_improvement':
        return 'bg-green-900/30 text-green-400 border-green-500/50'
      case 'engagement_decrease':
      case 'churn_risk':
        return 'bg-red-900/30 text-red-400 border-red-500/50'
      default:
        return 'bg-blue-900/30 text-blue-400 border-blue-500/50'
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return { label: 'High Confidence', color: 'bg-green-900/30 text-green-400 border-green-500/50' }
    } else if (confidence >= 0.6) {
      return { label: 'Medium Confidence', color: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50' }
    } else {
      return { label: 'Low Confidence', color: 'bg-orange-900/30 text-orange-400 border-orange-500/50' }
    }
  }

  const confidenceBadge = getConfidenceBadge(insight.confidenceScore)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const handleArchive = async () => {
    if (!onArchive) return
    setIsProcessing(true)
    try {
      await onArchive(insight.id)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMarkImplemented = async () => {
    if (!onMarkImplemented) return
    setIsProcessing(true)
    try {
      await onMarkImplemented(insight.id)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className={cn(
      'mission-card transition-all hover:shadow-lg hover:shadow-cyan-500/10',
      insight.status === 'archived' && 'opacity-60',
      insight.status === 'implemented' && 'border-green-500/30'
    )}>
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1">{getPatternIcon(insight.patternType)}</div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-200 text-lg">{insight.title}</h3>
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs font-mono', getPatternColor(insight.patternType))}
                  >
                    {insight.patternType.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', confidenceBadge.color)}
                  >
                    {confidenceBadge.label}
                  </Badge>
                  {insight.status === 'implemented' && (
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-green-900/20 text-green-400 border-green-500/50"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Implemented
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-4 text-xs text-gray-500 font-mono flex-wrap">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span className="text-cyan-400">{insight.affectedTutorCount}</span>
              <span>affected tutor{insight.affectedTutorCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Confidence:</span>
              <span className="text-cyan-400">{(insight.confidenceScore * 100).toFixed(0)}%</span>
            </div>
            {insight.statisticalSignificance !== null && (
              <div className="flex items-center gap-1">
                <span>Significance:</span>
                <span className="text-cyan-400">{(insight.statisticalSignificance * 100).toFixed(0)}%</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>Analyzed:</span>
              <span>{formatDate(insight.analyzedPeriodStart)} - {formatDate(insight.analyzedPeriodEnd)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Discovered:</span>
              <span>{formatDate(insight.discoveredAt)}</span>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="border-l-2 border-cyan-500/30 pl-4 bg-cyan-500/5 p-3 rounded-r">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wide">AI Recommendation</span>
              {insight.aiModel && (
                <Badge variant="outline" className="text-xs bg-purple-900/20 text-purple-400 border-purple-500/50">
                  {insight.aiModel}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {insight.aiGeneratedRecommendation}
            </p>
          </div>

          {/* Expandable Details */}
          {insight.correlations && Object.keys(insight.correlations).length > 0 && (
            <div className="border-t border-cyan-500/20 pt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {expanded ? 'Hide' : 'Show'} Correlations
              </button>
              
              {expanded && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(insight.correlations).map(([metric, value]) => (
                    <div 
                      key={metric}
                      className="bg-gray-900/50 border border-cyan-500/20 rounded p-2"
                    >
                      <div className="text-xs text-gray-400 mb-1">
                        {metric.replace(/_/g, ' ')}
                      </div>
                      <div className={cn(
                        'text-sm font-mono',
                        value > 0 ? 'text-green-400' : 'text-red-400'
                      )}>
                        {value > 0 ? '+' : ''}{(value as number).toFixed(3)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Affected Tutors */}
          {expanded && insight.affectedTutorIds && insight.affectedTutorIds.length > 0 && (
            <div className="border-t border-cyan-500/20 pt-3">
              <div className="text-sm text-gray-400 mb-2">
                Affected Tutors ({insight.affectedTutorIds.length}):
              </div>
              <div className="flex flex-wrap gap-2">
                {insight.affectedTutorIds.slice(0, expanded ? undefined : 5).map((tutorId) => (
                  <Link key={tutorId} href={`/dashboard/tutors/${tutorId}`}>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-cyan-500/20 transition-colors text-cyan-400 border-cyan-500/30"
                    >
                      {tutorId}
                    </Badge>
                  </Link>
                ))}
                {!expanded && insight.affectedTutorIds.length > 5 && (
                  <Badge variant="outline" className="text-gray-400 border-gray-600">
                    +{insight.affectedTutorIds.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Taken */}
          {insight.actionTaken && (
            <div className="border-t border-cyan-500/20 pt-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">Action Taken:</div>
                  <div className="text-sm text-gray-300">{insight.actionTaken}</div>
                  {insight.actionTakenAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(insight.actionTakenAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {insight.status === 'active' && (
            <div className="flex items-center gap-2 pt-2 border-t border-cyan-500/20">
              <Button
                variant="default"
                size="sm"
                onClick={handleMarkImplemented}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-500 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Mark as Implemented
              </Button>
              
              <Link href={`/dashboard/interventions/new?insight=${insight.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                >
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Create Intervention
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={handleArchive}
                disabled={isProcessing}
                className="bg-gray-800/50 border-gray-600/30 text-gray-400 hover:bg-gray-800"
              >
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


