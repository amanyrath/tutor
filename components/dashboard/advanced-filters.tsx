'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Save, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  initialFilters?: FilterState
}

export interface FilterState {
  riskLevels: string[]
  subjects: string[]
  sessionRange: [number, number]
  ratingRange: [number, number]
}

const RISK_LEVELS = ['High', 'Medium', 'Low']
const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Programming', 'Languages']

export function AdvancedFilters({ onFiltersChange, initialFilters }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    riskLevels: [],
    subjects: [],
    sessionRange: [0, 100],
    ratingRange: [0, 10]
  })

  const [savedPresets, setSavedPresets] = useState<{ name: string; filters: FilterState }[]>([
    { name: 'High Risk Only', filters: { riskLevels: ['High'], subjects: [], sessionRange: [0, 100], ratingRange: [0, 10] } },
    { name: 'Low Performers', filters: { riskLevels: [], subjects: [], sessionRange: [0, 100], ratingRange: [0, 6] } }
  ])

  const toggleRiskLevel = (level: string) => {
    const newLevels = filters.riskLevels.includes(level)
      ? filters.riskLevels.filter(l => l !== level)
      : [...filters.riskLevels, level]
    
    const newFilters = { ...filters, riskLevels: newLevels }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const toggleSubject = (subject: string) => {
    const newSubjects = filters.subjects.includes(subject)
      ? filters.subjects.filter(s => s !== subject)
      : [...filters.subjects, subject]
    
    const newFilters = { ...filters, subjects: newSubjects }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters = {
      riskLevels: [],
      subjects: [],
      sessionRange: [0, 100] as [number, number],
      ratingRange: [0, 10] as [number, number]
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const applyPreset = (preset: { name: string; filters: FilterState }) => {
    setFilters(preset.filters)
    onFiltersChange(preset.filters)
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-900/30 text-red-400 border-red-500/50 hover:bg-red-900/50'
      case 'Medium': return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50 hover:bg-yellow-900/50'
      case 'Low': return 'bg-green-900/30 text-green-400 border-green-500/50 hover:bg-green-900/50'
      default: return 'bg-gray-800/50 text-gray-400 border-gray-600/50 hover:bg-gray-800'
    }
  }

  const activeFiltersCount = filters.riskLevels.length + filters.subjects.length

  return (
    <div className="space-y-4">
      {/* Quick Presets */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Quick Filters:</span>
        {savedPresets.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            onClick={() => applyPreset(preset)}
            className="bg-[#1a1f2e] border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs"
          >
            {preset.name}
          </Button>
        ))}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="bg-[#1a1f2e] border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Risk Levels */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Risk Levels</label>
        <div className="flex gap-2 flex-wrap">
          {RISK_LEVELS.map((level) => (
            <Badge
              key={level}
              variant="outline"
              className={cn(
                'cursor-pointer text-xs font-mono transition-all',
                getRiskLevelColor(level),
                filters.riskLevels.includes(level) && 'ring-2 ring-cyan-400'
              )}
              onClick={() => toggleRiskLevel(level)}
            >
              {level}
              {filters.riskLevels.includes(level) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Subjects */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Subjects</label>
        <div className="flex gap-2 flex-wrap">
          {SUBJECTS.map((subject) => (
            <Badge
              key={subject}
              variant="outline"
              className={cn(
                'cursor-pointer text-xs transition-all',
                'bg-[#1a1f2e] text-gray-300 border-gray-600/50 hover:bg-gray-700/50',
                filters.subjects.includes(subject) && 'bg-cyan-900/30 text-cyan-400 border-cyan-500/50 ring-2 ring-cyan-400'
              )}
              onClick={() => toggleSubject(subject)}
            >
              {subject}
              {filters.subjects.includes(subject) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="border border-cyan-500/30 rounded-lg p-3 mission-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-cyan-400 font-mono">Active Filters:</span>
              {filters.riskLevels.map((level) => (
                <Badge key={level} variant="outline" className={cn('text-xs', getRiskLevelColor(level))}>
                  {level} Risk
                </Badge>
              ))}
              {filters.subjects.map((subject) => (
                <Badge key={subject} variant="outline" className="text-xs bg-cyan-900/30 text-cyan-400 border-cyan-500/50">
                  {subject}
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

