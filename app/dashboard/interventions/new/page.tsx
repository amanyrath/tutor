'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TargetingSelector } from '@/components/dashboard/targeting-selector'
import { InterventionBuilder } from '@/components/dashboard/intervention-builder'
import { ArrowLeft, Send, Loader2, CheckCircle, AlertCircle, Users, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import type { TargetingCriteria } from '@/lib/interventions/targeting'
import type { InterventionTemplate } from '@/lib/interventions/templates'

interface RecommendedCampaign {
  name: string
  description: string
  templateId: string
  estimatedAudience: number
  priority: 'high' | 'medium' | 'low'
  reasoning: string
}

export default function NewCampaignPage() {
  const router = useRouter()
  
  // Campaign details
  const [campaignName, setCampaignName] = useState('')
  const [campaignDescription, setCampaignDescription] = useState('')
  
  // Targeting
  const [targetingCriteria, setTargetingCriteria] = useState<TargetingCriteria>({})
  const [audienceSize, setAudienceSize] = useState<number>()
  const [isLoadingAudience, setIsLoadingAudience] = useState(false)
  const [targetPreview, setTargetPreview] = useState<Array<{ tutorId: string }>>([])
  
  // Template & Content
  const [templates, setTemplates] = useState<InterventionTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<InterventionTemplate>()
  const [customSubject, setCustomSubject] = useState('')
  const [customContent, setCustomContent] = useState('')
  const [variables, setVariables] = useState<Record<string, any>>({})
  
  // Experiment
  const [experimentId, setExperimentId] = useState('')
  const [experimentVariant, setExperimentVariant] = useState('treatment_a')
  
  // Scheduling
  const [scheduledFor, setScheduledFor] = useState<Date>()
  
  // UI State
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState(false)
  
  // Recommendations
  const [recommendations, setRecommendations] = useState<RecommendedCampaign[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
    loadRecommendations()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/interventions?action=templates')
      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error('Failed to load templates:', error)
      setError('Failed to load templates')
    }
  }

  const loadRecommendations = async () => {
    setIsLoadingRecommendations(true)
    try {
      const response = await fetch('/api/interventions?action=recommendations')
      const data = await response.json()
      setRecommendations(data.recommendations)
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const handlePreviewTargeting = async (criteria: TargetingCriteria) => {
    setIsLoadingAudience(true)
    setError(undefined)
    
    try {
      const response = await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview_targeting',
          criteria
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setAudienceSize(data.result.totalMatches)
        setTargetPreview(data.result.tutors)
      } else {
        setError(data.error || 'Failed to preview targeting')
      }
    } catch (error) {
      setError('Failed to preview targeting')
      console.error('Preview error:', error)
    } finally {
      setIsLoadingAudience(false)
    }
  }

  const handleCreateCampaign = async () => {
    if (!selectedTemplate) {
      setError('Please select a template')
      return
    }

    if (!audienceSize || audienceSize === 0) {
      setError('Please preview targeting to see audience size')
      return
    }

    setIsCreating(true)
    setError(undefined)

    try {
      const response = await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_campaign',
          name: campaignName || selectedTemplate.name,
          description: campaignDescription,
          templateId: selectedTemplate.id,
          targetingCriteria,
          experimentId: experimentId || undefined,
          experimentVariant: experimentId ? experimentVariant : undefined,
          scheduledFor: scheduledFor?.toISOString(),
          variables
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard/interventions')
        }, 2000)
      } else {
        setError(data.error || 'Failed to create campaign')
      }
    } catch (error) {
      setError('Failed to create campaign')
      console.error('Create error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUseRecommendation = (recommendation: RecommendedCampaign) => {
    setCampaignName(recommendation.name)
    setCampaignDescription(recommendation.description)
    
    const template = templates.find(t => t.id === recommendation.templateId)
    if (template) {
      setSelectedTemplate(template)
    }

    // Scroll to targeting section
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-900/30 text-red-400 border-red-500/50'
      case 'medium':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50'
      case 'low':
        return 'bg-blue-900/30 text-blue-400 border-blue-500/50'
      default:
        return 'bg-gray-800/50 text-gray-400 border-gray-600/50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cyan-500/20 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/interventions">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-cyan-400">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-cyan-400 font-mono uppercase">
              Create New Campaign
            </h1>
            <p className="text-gray-400 mt-1">
              Build a targeted intervention campaign for tutors
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="bg-green-900/20 border-green-500/50">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200">
            Campaign created successfully! Redirecting to campaigns list...
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="bg-red-900/20 border-red-500/50">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card className="mission-card-glow">
          <CardHeader>
            <CardTitle className="text-cyan-400 font-mono text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Recommended Campaigns
            </CardTitle>
            <CardDescription className="text-gray-400">
              AI-powered campaign suggestions based on current tutor data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="mission-card rounded-lg p-4 border border-cyan-500/20 hover:bg-cyan-500/5 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-200">{rec.name}</h4>
                        <Badge variant="outline" className={`text-xs ${getPriorityBadge(rec.priority)}`}>
                          {rec.priority} priority
                        </Badge>
                        <Badge className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                          <Users className="h-3 w-3 mr-1" />
                          {rec.estimatedAudience} tutors
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{rec.description}</p>
                      <p className="text-xs text-gray-500">{rec.reasoning}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUseRecommendation(rec)}
                      className="ml-4 bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                    >
                      Use This
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign Details */}
      <Card className="mission-card">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono text-lg">Campaign Details</CardTitle>
          <CardDescription className="text-gray-400">
            Give your campaign a name and description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Campaign Name (Optional)
            </label>
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., Q4 Re-engagement Campaign"
              className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Description (Optional)
            </label>
            <textarea
              value={campaignDescription}
              onChange={(e) => setCampaignDescription(e.target.value)}
              placeholder="Describe the goal of this campaign..."
              rows={3}
              className="w-full bg-[#1a1f2e] border border-cyan-500/30 text-gray-200 rounded-md p-3 focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Targeting */}
      <TargetingSelector
        value={targetingCriteria}
        onChange={setTargetingCriteria}
        onPreview={handlePreviewTargeting}
        audienceSize={audienceSize}
        isLoadingAudience={isLoadingAudience}
      />

      {/* Target Preview */}
      {targetPreview.length > 0 && (
        <Card className="mission-card">
          <CardHeader>
            <CardTitle className="text-cyan-400 font-mono text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Target Preview (Sample)
            </CardTitle>
            <CardDescription className="text-gray-400">
              First {Math.min(10, targetPreview.length)} tutors that match your criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {targetPreview.slice(0, 10).map((target) => (
                <Badge 
                  key={target.tutorId} 
                  className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-mono"
                >
                  {target.tutorId}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intervention Builder */}
      <InterventionBuilder
        templates={templates}
        selectedTemplate={selectedTemplate}
        onTemplateChange={setSelectedTemplate}
        customSubject={customSubject}
        onSubjectChange={setCustomSubject}
        customContent={customContent}
        onContentChange={setCustomContent}
        variables={variables}
        onVariablesChange={setVariables}
        experimentId={experimentId}
        onExperimentChange={(id, variant) => {
          setExperimentId(id)
          setExperimentVariant(variant)
        }}
        scheduledFor={scheduledFor}
        onScheduleChange={setScheduledFor}
      />

      {/* Create Button */}
      <div className="flex items-center justify-between border-t border-cyan-500/20 pt-6">
        <div className="text-sm text-gray-400">
          {audienceSize !== undefined && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              <span>
                This campaign will send <span className="text-cyan-400 font-mono font-semibold">{audienceSize}</span> intervention{audienceSize !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/interventions">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleCreateCampaign}
            disabled={isCreating || !selectedTemplate || !audienceSize}
            className="bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create Campaign
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

