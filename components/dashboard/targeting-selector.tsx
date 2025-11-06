'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Target, RefreshCw } from 'lucide-react'
import type { TargetingCriteria } from '@/lib/interventions/targeting'

interface TargetingSelectorProps {
  value: TargetingCriteria
  onChange: (criteria: TargetingCriteria) => void
  onPreview?: (criteria: TargetingCriteria) => void
  audienceSize?: number
  isLoadingAudience?: boolean
}

interface PredefinedSegment {
  id: string
  name: string
  description: string
  criteria: TargetingCriteria
}

const PREDEFINED_SEGMENTS: PredefinedSegment[] = [
  {
    id: 'high_churn_risk',
    name: 'High Churn Risk',
    description: 'Tutors at high risk of churning',
    criteria: { churnRiskLevel: ['High'], activeStatus: true }
  },
  {
    id: 'disengaged_tutors',
    name: 'Disengaged Tutors',
    description: 'No login in 7+ days',
    criteria: { daysSinceLoginMin: 7, activeStatus: true }
  },
  {
    id: 'low_engagement',
    name: 'Low Engagement',
    description: 'Engagement score below 6.0',
    criteria: { avgEngagementMax: 6.0, activeStatus: true }
  },
  {
    id: 'poor_first_sessions',
    name: 'Poor First Sessions',
    description: 'Struggling with first impressions',
    criteria: { poorFirstSession: true, activeStatus: true }
  },
  {
    id: 'technical_issues',
    name: 'Technical Issues',
    description: 'High technical issue rate (>15%)',
    criteria: { technicalIssueRateMin: 0.15, activeStatus: true }
  },
  {
    id: 'new_tutors',
    name: 'New Tutors',
    description: 'Less than 3 months experience',
    criteria: { monthsExperienceMax: 3, activeStatus: true }
  },
  {
    id: 'star_performers',
    name: 'Star Performers',
    description: 'Top performing tutors',
    criteria: { avgEngagementMin: 8.0, avgRatingMin: 4.5, churnRiskLevel: ['Low'], activeStatus: true }
  },
  {
    id: 'inactive_14d',
    name: 'Inactive 14+ Days',
    description: 'No login in 14+ days',
    criteria: { daysSinceLoginMin: 14, activeStatus: true }
  }
]

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Languages', 'Computer Science']
const CERTIFICATION_LEVELS = ['Bronze', 'Silver', 'Gold', 'Platinum']

export function TargetingSelector({ 
  value, 
  onChange, 
  onPreview,
  audienceSize,
  isLoadingAudience 
}: TargetingSelectorProps) {
  const [selectedSegment, setSelectedSegment] = useState<string>('custom')
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)

  const handleSegmentChange = (segmentId: string) => {
    setSelectedSegment(segmentId)
    
    if (segmentId === 'custom') {
      onChange({})
      return
    }

    const segment = PREDEFINED_SEGMENTS.find(s => s.id === segmentId)
    if (segment) {
      onChange(segment.criteria)
    }
  }

  const updateCriteria = (updates: Partial<TargetingCriteria>) => {
    onChange({ ...value, ...updates })
    setSelectedSegment('custom')
  }

  const handlePreview = () => {
    if (onPreview) {
      onPreview(value)
    }
  }

  return (
    <div className="space-y-4">
      {/* Predefined Segments */}
      <Card className="mission-card">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Target Audience
          </CardTitle>
          <CardDescription className="text-gray-400">
            Select a predefined segment or create custom targeting rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Segment Selection */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Predefined Segments
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant={selectedSegment === 'custom' ? 'default' : 'outline'}
                onClick={() => handleSegmentChange('custom')}
                className={selectedSegment === 'custom' 
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white' 
                  : 'bg-gray-800/50 border-cyan-500/30 text-gray-300 hover:bg-cyan-500/10'
                }
              >
                Custom
              </Button>
              {PREDEFINED_SEGMENTS.map(segment => (
                <Button
                  key={segment.id}
                  variant={selectedSegment === segment.id ? 'default' : 'outline'}
                  onClick={() => handleSegmentChange(segment.id)}
                  className={selectedSegment === segment.id 
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white' 
                    : 'bg-gray-800/50 border-cyan-500/30 text-gray-300 hover:bg-cyan-500/10'
                  }
                  title={segment.description}
                >
                  {segment.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Selected segment description */}
          {selectedSegment !== 'custom' && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
              <p className="text-sm text-cyan-200">
                {PREDEFINED_SEGMENTS.find(s => s.id === selectedSegment)?.description}
              </p>
            </div>
          )}

          {/* Custom Criteria */}
          {selectedSegment === 'custom' && (
            <div className="space-y-4 border-t border-cyan-500/20 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Custom Criteria</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  {isAdvancedMode ? 'Basic Mode' : 'Advanced Mode'}
                </Button>
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Primary Subject</label>
                  <Select
                    value={value.primarySubject?.[0] || 'all'}
                    onValueChange={(val) => updateCriteria({ 
                      primarySubject: val && val !== 'all' ? [val] : undefined 
                    })}
                  >
                    <SelectTrigger className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200">
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1419] border-cyan-500/30">
                      <SelectItem value="all">All subjects</SelectItem>
                      {SUBJECTS.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Churn Risk</label>
                  <Select
                    value={value.churnRiskLevel?.[0] || 'all'}
                    onValueChange={(val) => updateCriteria({ 
                      churnRiskLevel: val && val !== 'all' ? [val as 'Low' | 'Medium' | 'High'] : undefined 
                    })}
                  >
                    <SelectTrigger className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200">
                      <SelectValue placeholder="All risk levels" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1419] border-cyan-500/30">
                      <SelectItem value="all">All risk levels</SelectItem>
                      <SelectItem value="High">High Risk</SelectItem>
                      <SelectItem value="Medium">Medium Risk</SelectItem>
                      <SelectItem value="Low">Low Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Engagement Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Min Engagement Score</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={value.avgEngagementMin || ''}
                    onChange={(e) => updateCriteria({ 
                      avgEngagementMin: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200"
                    placeholder="e.g., 6.0"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Max Engagement Score</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={value.avgEngagementMax || ''}
                    onChange={(e) => updateCriteria({ 
                      avgEngagementMax: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200"
                    placeholder="e.g., 8.0"
                  />
                </div>
              </div>

              {/* Behavioral Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Days Since Last Login (Min)</label>
                  <Input
                    type="number"
                    min="0"
                    value={value.daysSinceLoginMin || ''}
                    onChange={(e) => updateCriteria({ 
                      daysSinceLoginMin: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200"
                    placeholder="e.g., 7"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Experience (Months)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={value.monthsExperienceMin || ''}
                      onChange={(e) => updateCriteria({ 
                        monthsExperienceMin: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200"
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={value.monthsExperienceMax || ''}
                      onChange={(e) => updateCriteria({ 
                        monthsExperienceMax: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              {isAdvancedMode && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Min Rating (30d)</label>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={value.avgRatingMin || ''}
                        onChange={(e) => updateCriteria({ 
                          avgRatingMin: e.target.value ? parseFloat(e.target.value) : undefined 
                        })}
                        className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200"
                        placeholder="e.g., 4.0"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Technical Issue Rate (Min %)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={value.technicalIssueRateMin ? value.technicalIssueRateMin * 100 : ''}
                        onChange={(e) => updateCriteria({ 
                          technicalIssueRateMin: e.target.value ? parseFloat(e.target.value) / 100 : undefined 
                        })}
                        className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200"
                        placeholder="e.g., 15"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Certification Level</label>
                      <Select
                        value={value.certificationLevel?.[0] || 'all'}
                        onValueChange={(val) => updateCriteria({ 
                          certificationLevel: val && val !== 'all' ? [val] : undefined 
                        })}
                      >
                        <SelectTrigger className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200">
                          <SelectValue placeholder="All levels" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1419] border-cyan-500/30">
                          <SelectItem value="all">All levels</SelectItem>
                          {CERTIFICATION_LEVELS.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={value.poorFirstSession === true}
                          onChange={(e) => updateCriteria({ 
                            poorFirstSession: e.target.checked ? true : undefined 
                          })}
                          className="rounded border-cyan-500/30 bg-[#1a1f2e] text-cyan-600 focus:ring-cyan-500"
                        />
                        Poor First Session Flag
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Result Limit</label>
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      value={value.limit || ''}
                      onChange={(e) => updateCriteria({ 
                        limit: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200"
                      placeholder="Max tutors to target (default: 1000)"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Audience Preview */}
          <div className="border-t border-cyan-500/20 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium text-gray-300">Estimated Audience</p>
                  {audienceSize !== undefined && (
                    <p className="text-xs text-gray-500">
                      {audienceSize} tutor{audienceSize !== 1 ? 's' : ''} will receive this intervention
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {audienceSize !== undefined && (
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-mono">
                    {audienceSize} tutors
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  disabled={isLoadingAudience}
                  className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                >
                  {isLoadingAudience ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Preview
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


