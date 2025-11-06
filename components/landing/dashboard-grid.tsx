'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DashboardTile } from './dashboard-tile'
import { AVAILABLE_DASHBOARDS, DashboardLink } from '@/lib/dashboard-config'
import { getDashboardConfig, reorderDashboards } from '@/lib/config-storage'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-react'

interface DashboardGridProps {
  onCustomizeClick: () => void
}

interface SortableTileProps {
  dashboard: DashboardLink
  isDragging?: boolean
}

function SortableTile({ dashboard, isDragging }: SortableTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: dashboard.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DashboardTile dashboard={dashboard} />
    </div>
  )
}

export function DashboardGrid({ onCustomizeClick }: DashboardGridProps) {
  const [visibleDashboards, setVisibleDashboards] = useState<DashboardLink[]>([])
  const [isClient, setIsClient] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    setIsClient(true)
    loadDashboards()
  }, [])

  const loadDashboards = () => {
    const config = getDashboardConfig()
    const dashboards = config.dashboardOrder
      .map(id => AVAILABLE_DASHBOARDS.find(d => d.id === id))
      .filter((d): d is DashboardLink => 
        d !== undefined && config.visibleDashboards.includes(d.id)
      )
    setVisibleDashboards(dashboards)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setVisibleDashboards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newOrder = arrayMove(items, oldIndex, newIndex)
        
        // Save the new order
        reorderDashboards(newOrder.map(d => d.id))
        
        return newOrder
      })
    }
  }

  // Refresh dashboards when customization changes
  useEffect(() => {
    const handleStorageChange = () => {
      loadDashboards()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('dashboardConfigChange', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('dashboardConfigChange', handleStorageChange)
    }
  }, [])

  if (!isClient) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {AVAILABLE_DASHBOARDS.slice(0, 4).map((dashboard) => (
          <DashboardTile key={dashboard.id} dashboard={dashboard} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboards</h2>
          <p className="text-sm text-muted-foreground">
            Quick access to all your dashboards
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onCustomizeClick}
          className="gap-2"
        >
          <Settings2 className="h-4 w-4" />
          Customize
        </Button>
      </div>

      {visibleDashboards.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            No dashboards configured. Click Customize to add some.
          </p>
          <Button onClick={onCustomizeClick} variant="outline">
            <Settings2 className="h-4 w-4 mr-2" />
            Add Dashboards
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleDashboards.map(d => d.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleDashboards.map((dashboard) => (
                <SortableTile key={dashboard.id} dashboard={dashboard} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

