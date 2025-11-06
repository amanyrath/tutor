'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { ArrowRight, LucideIcon } from 'lucide-react'
import { DashboardLink, ICON_MAP } from '@/lib/dashboard-config'
import { cn } from '@/lib/utils'

interface DashboardTileProps {
  dashboard: DashboardLink
  className?: string
}

const colorStyles: Record<string, { card: string; icon: string; hover: string }> = {
  blue: {
    card: 'border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20',
    icon: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:border-blue-400 dark:hover:border-blue-600'
  },
  red: {
    card: 'border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20',
    icon: 'text-red-600 dark:text-red-400',
    hover: 'hover:border-red-400 dark:hover:border-red-600'
  },
  yellow: {
    card: 'border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20',
    icon: 'text-yellow-600 dark:text-yellow-400',
    hover: 'hover:border-yellow-400 dark:hover:border-yellow-600'
  },
  purple: {
    card: 'border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20',
    icon: 'text-purple-600 dark:text-purple-400',
    hover: 'hover:border-purple-400 dark:hover:border-purple-600'
  },
  green: {
    card: 'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20',
    icon: 'text-green-600 dark:text-green-400',
    hover: 'hover:border-green-400 dark:hover:border-green-600'
  },
  amber: {
    card: 'border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20',
    icon: 'text-amber-600 dark:text-amber-400',
    hover: 'hover:border-amber-400 dark:hover:border-amber-600'
  },
  indigo: {
    card: 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20',
    icon: 'text-indigo-600 dark:text-indigo-400',
    hover: 'hover:border-indigo-400 dark:hover:border-indigo-600'
  },
  teal: {
    card: 'border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/20',
    icon: 'text-teal-600 dark:text-teal-400',
    hover: 'hover:border-teal-400 dark:hover:border-teal-600'
  },
  slate: {
    card: 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20',
    icon: 'text-slate-600 dark:text-slate-400',
    hover: 'hover:border-slate-400 dark:hover:border-slate-600'
  },
  emerald: {
    card: 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    hover: 'hover:border-emerald-400 dark:hover:border-emerald-600'
  }
}

export function DashboardTile({ dashboard, className }: DashboardTileProps) {
  const IconComponent = ICON_MAP[dashboard.icon as keyof typeof ICON_MAP] as LucideIcon
  const colors = colorStyles[dashboard.color] || colorStyles.blue

  return (
    <Link href={dashboard.path} className={cn('block group', className)}>
      <Card
        className={cn(
          'relative overflow-hidden border-2 transition-all duration-200',
          'hover:shadow-lg hover:scale-[1.02]',
          colors.card,
          colors.hover
        )}
      >
        <div className="p-6">
          {/* Icon */}
          <div className={cn('mb-4 inline-flex p-3 rounded-lg bg-background/50', colors.icon)}>
            {IconComponent && <IconComponent className="h-6 w-6" />}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {dashboard.title}
              </h3>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-sm text-muted-foreground">
              {dashboard.description}
            </p>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/0 to-background/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </Card>
    </Link>
  )
}

