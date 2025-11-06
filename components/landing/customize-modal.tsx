'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { AVAILABLE_DASHBOARDS, ICON_MAP } from '@/lib/dashboard-config'
import {
  getDashboardConfig,
  saveDashboardConfig,
  resetDashboardConfig,
  DashboardConfig,
} from '@/lib/config-storage'
import { RotateCcw, LucideIcon } from 'lucide-react'

interface CustomizeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomizeModal({ open, onOpenChange }: CustomizeModalProps) {
  const [config, setConfig] = useState<DashboardConfig | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (open) {
      setConfig(getDashboardConfig())
      setHasChanges(false)
    }
  }, [open])

  const handleToggleDashboard = (dashboardId: string) => {
    if (!config) return

    const isVisible = config.visibleDashboards.includes(dashboardId)
    let newVisibleDashboards: string[]
    let newDashboardOrder: string[]

    if (isVisible) {
      // Remove from visible list
      newVisibleDashboards = config.visibleDashboards.filter(id => id !== dashboardId)
      newDashboardOrder = config.dashboardOrder.filter(id => id !== dashboardId)
    } else {
      // Add to visible list
      newVisibleDashboards = [...config.visibleDashboards, dashboardId]
      newDashboardOrder = [...config.dashboardOrder, dashboardId]
    }

    setConfig({
      visibleDashboards: newVisibleDashboards,
      dashboardOrder: newDashboardOrder,
    })
    setHasChanges(true)
  }

  const handleSave = () => {
    if (config) {
      saveDashboardConfig(config)
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('dashboardConfigChange'))
      setHasChanges(false)
      onOpenChange(false)
    }
  }

  const handleReset = () => {
    resetDashboardConfig()
    setConfig(getDashboardConfig())
    setHasChanges(true)
  }

  const handleCancel = () => {
    setHasChanges(false)
    onOpenChange(false)
  }

  if (!config) return null

  // Group dashboards by category
  const dashboardsByCategory = AVAILABLE_DASHBOARDS.reduce((acc, dashboard) => {
    const category = dashboard.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(dashboard)
    return acc
  }, {} as Record<string, typeof AVAILABLE_DASHBOARDS>)

  const categories = {
    management: 'Management',
    analytics: 'Analytics',
    monitoring: 'Monitoring',
    other: 'Other',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Customize Dashboards</DialogTitle>
          <DialogDescription>
            Select which dashboards to show on your landing page. You can also drag and drop them to reorder.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {Object.entries(categories).map(([key, label]) => {
              const dashboards = dashboardsByCategory[key]
              if (!dashboards || dashboards.length === 0) return null

              return (
                <div key={key}>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    {label}
                    <Badge variant="secondary" className="text-xs">
                      {dashboards.filter(d => config.visibleDashboards.includes(d.id)).length} / {dashboards.length}
                    </Badge>
                  </h3>
                  <div className="space-y-2">
                    {dashboards.map((dashboard) => {
                      const IconComponent = ICON_MAP[dashboard.icon as keyof typeof ICON_MAP] as LucideIcon
                      const isVisible = config.visibleDashboards.includes(dashboard.id)

                      return (
                        <div
                          key={dashboard.id}
                          className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox
                            id={dashboard.id}
                            checked={isVisible}
                            onCheckedChange={() => handleToggleDashboard(dashboard.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 flex items-start gap-3">
                            {IconComponent && (
                              <div className={`p-2 rounded-md bg-${dashboard.color}-100 dark:bg-${dashboard.color}-950/20`}>
                                <IconComponent className={`h-4 w-4 text-${dashboard.color}-600 dark:text-${dashboard.color}-400`} />
                              </div>
                            )}
                            <div className="flex-1">
                              <label
                                htmlFor={dashboard.id}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {dashboard.title}
                              </label>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {dashboard.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {key !== 'other' && <Separator className="mt-6" />}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


