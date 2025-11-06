import { 
  LayoutDashboard, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  UserCheck, 
  Star, 
  Clock, 
  UserPlus,
  Users,
  TrendingUp
} from 'lucide-react'

export type MetricStatus = 'success' | 'warning' | 'danger' | 'neutral'

export interface MetricDefinition {
  id: string
  title: string
  description: string
  apiEndpoint?: string
  targetDashboard: string
  valueFormatter?: (value: number) => string
  statusThresholds?: {
    success: number
    warning: number
    danger: number
  }
  trendEnabled?: boolean
}

export interface DashboardLink {
  id: string
  title: string
  description: string
  path: string
  icon: string // Icon name from lucide-react
  color: string // Tailwind color class
  category?: string
}

// Metric definitions that appear as cards on the landing page
export const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    id: 'total-tutors',
    title: 'Total Active Tutors',
    description: 'Number of currently active tutors',
    targetDashboard: '/dashboard',
    valueFormatter: (value) => value.toString(),
    statusThresholds: {
      success: 100,
      warning: 80,
      danger: 60
    }
  },
  {
    id: 'high-risk',
    title: 'High Churn Risk',
    description: 'Tutors at high risk of churning',
    targetDashboard: '/dashboard',
    valueFormatter: (value) => value.toString(),
    statusThresholds: {
      success: 10,
      warning: 15,
      danger: 20
    }
  },
  {
    id: 'avg-engagement',
    title: 'Avg Engagement Score',
    description: 'Platform-wide engagement metric',
    targetDashboard: '/dashboard/engagement',
    valueFormatter: (value) => value.toFixed(1),
    statusThresholds: {
      success: 7.0,
      warning: 6.0,
      danger: 5.0
    },
    trendEnabled: true
  },
  {
    id: 'first-session',
    title: 'First Session Issues',
    description: 'Tutors with poor first session performance',
    targetDashboard: '/dashboard/first-sessions',
    valueFormatter: (value) => value.toString(),
    statusThresholds: {
      success: 10,
      warning: 20,
      danger: 30
    }
  },
  {
    id: 'reliability',
    title: 'Avg Reliability Score',
    description: 'Platform reliability percentage',
    targetDashboard: '/dashboard/reliability',
    valueFormatter: (value) => `${value.toFixed(1)}%`,
    statusThresholds: {
      success: 90,
      warning: 80,
      danger: 70
    }
  },
  {
    id: 'critical-alerts',
    title: 'Critical Alerts',
    description: 'Unresolved critical alerts',
    targetDashboard: '/dashboard/alerts',
    valueFormatter: (value) => value.toString(),
    statusThresholds: {
      success: 5,
      warning: 10,
      danger: 20
    }
  },
  {
    id: 'pending-interventions',
    title: 'Pending Interventions',
    description: 'Recommended interventions not yet addressed',
    targetDashboard: '/dashboard/interventions',
    valueFormatter: (value) => value.toString(),
    statusThresholds: {
      success: 10,
      warning: 25,
      danger: 50
    }
  },
  {
    id: 'activation-rate',
    title: 'Activation Rate',
    description: 'New tutor activation percentage',
    targetDashboard: '/dashboard/activation',
    valueFormatter: (value) => `${value.toFixed(1)}%`,
    statusThresholds: {
      success: 80,
      warning: 60,
      danger: 40
    }
  }
]

// Available dashboards for the configurable links section
export const AVAILABLE_DASHBOARDS: DashboardLink[] = [
  {
    id: 'dashboard',
    title: 'Tutor Management',
    description: 'View all tutors and churn risk analysis',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    color: 'blue',
    category: 'management'
  },
  {
    id: 'alerts',
    title: 'Alerts',
    description: 'View and manage system alerts',
    path: '/dashboard/alerts',
    icon: 'AlertTriangle',
    color: 'red',
    category: 'monitoring'
  },
  {
    id: 'insights',
    title: 'Insights',
    description: 'AI-generated insights and patterns',
    path: '/dashboard/insights',
    icon: 'Lightbulb',
    color: 'yellow',
    category: 'analytics'
  },
  {
    id: 'interventions',
    title: 'Interventions',
    description: 'Manage coaching interventions',
    path: '/dashboard/interventions',
    icon: 'Target',
    color: 'purple',
    category: 'management'
  },
  {
    id: 'activation',
    title: 'Activation',
    description: 'New tutor activation metrics',
    path: '/dashboard/activation',
    icon: 'UserPlus',
    color: 'green',
    category: 'analytics'
  },
  {
    id: 'performers',
    title: 'Top Performers',
    description: 'Star performers and best practices',
    path: '/dashboard/performers',
    icon: 'Star',
    color: 'amber',
    category: 'analytics'
  },
  {
    id: 'reliability',
    title: 'Reliability',
    description: 'Session reliability and scheduling metrics',
    path: '/dashboard/reliability',
    icon: 'Clock',
    color: 'indigo',
    category: 'monitoring'
  },
  {
    id: 'first-sessions',
    title: 'First Sessions',
    description: 'First session performance analysis',
    path: '/dashboard/first-sessions',
    icon: 'UserCheck',
    color: 'teal',
    category: 'analytics'
  },
  {
    id: 'tutors',
    title: 'Tutor Directory',
    description: 'Browse all tutor profiles',
    path: '/dashboard/tutors',
    icon: 'Users',
    color: 'slate',
    category: 'management'
  },
  {
    id: 'engagement',
    title: 'Engagement Analytics',
    description: 'Deep dive into engagement metrics',
    path: '/dashboard/engagement',
    icon: 'TrendingUp',
    color: 'emerald',
    category: 'analytics'
  }
]

// Default visible dashboards (can be customized by users)
export const DEFAULT_VISIBLE_DASHBOARDS = [
  'alerts',
  'insights',
  'interventions',
  'tutors'
]

// Icon mapping helper
export const ICON_MAP = {
  LayoutDashboard,
  AlertTriangle,
  Lightbulb,
  Target,
  UserCheck,
  Star,
  Clock,
  UserPlus,
  Users,
  TrendingUp
}

// Get metric status based on value and thresholds
export function getMetricStatus(
  value: number,
  thresholds?: MetricDefinition['statusThresholds'],
  isHigherBetter = true
): MetricStatus {
  if (!thresholds) return 'neutral'

  if (isHigherBetter) {
    if (value >= thresholds.success) return 'success'
    if (value >= thresholds.warning) return 'warning'
    return 'danger'
  } else {
    if (value <= thresholds.success) return 'success'
    if (value <= thresholds.warning) return 'warning'
    return 'danger'
  }
}

// Determine if higher values are better for a metric
export function isHigherBetter(metricId: string): boolean {
  const lowerIsBetter = ['high-risk', 'first-session', 'critical-alerts', 'pending-interventions']
  return !lowerIsBetter.includes(metricId)
}


