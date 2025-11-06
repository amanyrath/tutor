import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'

interface ChurnRiskBadgeProps {
  probability: number
  riskLevel: 'High' | 'Medium' | 'Low'
  showProbability?: boolean
}

export function ChurnRiskBadge({
  probability,
  riskLevel,
  showProbability = true,
}: ChurnRiskBadgeProps) {
  const riskClasses = {
    High: 'bg-red-900/30 text-red-400 border-red-500/50 glow-critical',
    Medium: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50',
    Low: 'bg-green-900/30 text-green-400 border-green-500/50',
  }

  const riskIcons = {
    High: <AlertTriangle className="h-3 w-3" />,
    Medium: <AlertCircle className="h-3 w-3" />,
    Low: <CheckCircle className="h-3 w-3" />,
  }

  const pulseAnimation = riskLevel === 'High' ? 'pulse-glow' : ''

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-semibold text-xs font-mono inline-flex items-center gap-1',
        riskClasses[riskLevel],
        pulseAnimation
      )}
    >
      {riskIcons[riskLevel]}
      {showProbability && `${Math.round(probability * 100)}% `}
      {riskLevel.toUpperCase()}
    </Badge>
  )
}


