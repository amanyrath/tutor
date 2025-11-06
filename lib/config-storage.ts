'use client'

import { DEFAULT_VISIBLE_DASHBOARDS } from './dashboard-config'

const STORAGE_KEY = 'tutor-dashboard-config'

export interface DashboardConfig {
  visibleDashboards: string[]
  dashboardOrder: string[]
}

// Get the current configuration from localStorage
export function getDashboardConfig(): DashboardConfig {
  if (typeof window === 'undefined') {
    return {
      visibleDashboards: DEFAULT_VISIBLE_DASHBOARDS,
      dashboardOrder: DEFAULT_VISIBLE_DASHBOARDS
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading dashboard config:', error)
  }

  return {
    visibleDashboards: DEFAULT_VISIBLE_DASHBOARDS,
    dashboardOrder: DEFAULT_VISIBLE_DASHBOARDS
  }
}

// Save configuration to localStorage
export function saveDashboardConfig(config: DashboardConfig): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (error) {
    console.error('Error saving dashboard config:', error)
  }
}

// Add a dashboard to visible list
export function addDashboard(dashboardId: string): void {
  const config = getDashboardConfig()
  
  if (!config.visibleDashboards.includes(dashboardId)) {
    config.visibleDashboards.push(dashboardId)
    config.dashboardOrder.push(dashboardId)
    saveDashboardConfig(config)
  }
}

// Remove a dashboard from visible list
export function removeDashboard(dashboardId: string): void {
  const config = getDashboardConfig()
  
  config.visibleDashboards = config.visibleDashboards.filter(id => id !== dashboardId)
  config.dashboardOrder = config.dashboardOrder.filter(id => id !== dashboardId)
  
  saveDashboardConfig(config)
}

// Reorder dashboards
export function reorderDashboards(newOrder: string[]): void {
  const config = getDashboardConfig()
  
  config.dashboardOrder = newOrder
  
  saveDashboardConfig(config)
}

// Reset to default configuration
export function resetDashboardConfig(): void {
  const config: DashboardConfig = {
    visibleDashboards: DEFAULT_VISIBLE_DASHBOARDS,
    dashboardOrder: DEFAULT_VISIBLE_DASHBOARDS
  }
  
  saveDashboardConfig(config)
}

// Toggle dashboard visibility
export function toggleDashboard(dashboardId: string): boolean {
  const config = getDashboardConfig()
  const isVisible = config.visibleDashboards.includes(dashboardId)
  
  if (isVisible) {
    removeDashboard(dashboardId)
    return false
  } else {
    addDashboard(dashboardId)
    return true
  }
}


