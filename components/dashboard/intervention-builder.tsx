'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Eye, Calendar, Sparkles, Copy } from 'lucide-react'
import type { InterventionTemplate } from '@/lib/interventions/templates'

interface InterventionBuilderProps {
  templates: InterventionTemplate[]
  selectedTemplate?: InterventionTemplate
  onTemplateChange: (template: InterventionTemplate) => void
  customSubject?: string
  onSubjectChange?: (subject: string) => void
  customContent?: string
  onContentChange?: (content: string) => void
  variables?: Record<string, any>
  onVariablesChange?: (variables: Record<string, any>) => void
  experimentId?: string
  onExperimentChange?: (experimentId: string, variant: string) => void
  scheduledFor?: Date
  onScheduleChange?: (date: Date | undefined) => void
}

export function InterventionBuilder({
  templates,
  selectedTemplate,
  onTemplateChange,
  customSubject,
  onSubjectChange,
  customContent,
  onContentChange,
  variables = {},
  onVariablesChange,
  experimentId,
  onExperimentChange,
  scheduledFor,
  onScheduleChange,
}: InterventionBuilderProps) {
  const [previewMode, setPreviewMode] = useState<'subject' | 'content'>('subject')

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      onTemplateChange(template)
    }
  }

  const handleCopyTemplate = () => {
    if (selectedTemplate) {
      if (onSubjectChange) {
        onSubjectChange(selectedTemplate.subject)
      }
      if (onContentChange) {
        onContentChange(selectedTemplate.contentTemplate)
      }
    }
  }

  const renderTemplateWithVariables = (text: string) => {
    let rendered = text
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      rendered = rendered.replace(regex, String(value))
    }
    return rendered
  }

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <Card className="mission-card">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Template
          </CardTitle>
          <CardDescription className="text-gray-400">
            Choose a pre-built template or create your own
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Categories */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-[#1a1f2e]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="first_session">First Session</TabsTrigger>
              <TabsTrigger value="reengagement">Re-engagement</TabsTrigger>
            </TabsList>

            {['all', 'engagement', 'quality', 'technical', 'first_session', 'reengagement'].map(category => (
              <TabsContent key={category} value={category} className="space-y-2 mt-4">
                {templates
                  .filter(t => category === 'all' || t.category === category)
                  .map(template => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-all
                        ${selectedTemplate?.id === template.id 
                          ? 'border-cyan-500 bg-cyan-500/10' 
                          : 'border-cyan-500/20 bg-gray-800/30 hover:bg-cyan-500/5'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-200">{template.name}</h4>
                            <Badge className="text-xs bg-purple-900/30 text-purple-400 border-purple-500/50">
                              {template.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="text-cyan-400 font-mono">{template.subject}</span>
                          </div>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </TabsContent>
            ))}
          </Tabs>

          {/* Selected Template Details */}
          {selectedTemplate && (
            <div className="border-t border-cyan-500/20 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-300">Template Details</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyTemplate}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy to Custom
                </Button>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-3 space-y-2">
                <div>
                  <label className="text-xs text-gray-500">Subject Line</label>
                  <p className="text-sm text-gray-300 font-mono">{selectedTemplate.subject}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Required Variables</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTemplate.variables.map(variable => (
                      <Badge key={variable} variant="outline" className="text-xs bg-cyan-900/20 text-cyan-400 border-cyan-500/30">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Success Metrics</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTemplate.successMetrics.map(metric => (
                      <Badge key={metric} variant="outline" className="text-xs bg-green-900/20 text-green-400 border-green-500/30">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Content (Optional) */}
      <Card className="mission-card">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Customize Content (Optional)
          </CardTitle>
          <CardDescription className="text-gray-400">
            Override template with custom subject and content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Custom Subject Line
            </label>
            <Input
              value={customSubject || ''}
              onChange={(e) => onSubjectChange?.(e.target.value)}
              placeholder="Leave empty to use template"
              className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200 font-mono"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Custom Content
            </label>
            <textarea
              value={customContent || ''}
              onChange={(e) => onContentChange?.(e.target.value)}
              placeholder="Leave empty to use template"
              rows={8}
              className="w-full bg-[#1a1f2e] border border-cyan-500/30 text-gray-200 rounded-md p-3 font-mono text-sm focus:ring-2 focus:ring-cyan-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use variables like {`{{tutorName}}`}, {`{{loginUrl}}`}, etc.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Variables */}
      {selectedTemplate && selectedTemplate.variables.length > 0 && (
        <Card className="mission-card">
          <CardHeader>
            <CardTitle className="text-cyan-400 font-mono text-lg">
              Template Variables
            </CardTitle>
            <CardDescription className="text-gray-400">
              Set custom values for template variables (optional - will use tutor data by default)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedTemplate.variables.map(variable => (
                <div key={variable}>
                  <label className="text-xs text-gray-400 mb-1 block font-mono">
                    {`{{${variable}}}`}
                  </label>
                  <Input
                    value={variables[variable] || ''}
                    onChange={(e) => onVariablesChange?.({ ...variables, [variable]: e.target.value })}
                    placeholder={`Auto-populated from tutor data`}
                    className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* A/B Testing (Optional) */}
      <Card className="mission-card">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            A/B Testing (Optional)
          </CardTitle>
          <CardDescription className="text-gray-400">
            Run experiments to optimize intervention effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Experiment ID
              </label>
              <Input
                value={experimentId || ''}
                onChange={(e) => onExperimentChange?.(e.target.value, 'treatment_a')}
                placeholder="e.g., first-session-prep-v2"
                className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Variant
              </label>
              <Select
                value={experimentId ? 'treatment_a' : ''}
                onValueChange={(variant) => experimentId && onExperimentChange?.(experimentId, variant)}
                disabled={!experimentId}
              >
                <SelectTrigger className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200">
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1419] border-cyan-500/30">
                  <SelectItem value="control">Control</SelectItem>
                  <SelectItem value="treatment_a">Treatment A</SelectItem>
                  <SelectItem value="treatment_b">Treatment B</SelectItem>
                  <SelectItem value="treatment_c">Treatment C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {experimentId && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-sm text-blue-200">
                This intervention will be tracked as part of experiment: <span className="font-mono">{experimentId}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduling (Optional) */}
      <Card className="mission-card">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduling (Optional)
          </CardTitle>
          <CardDescription className="text-gray-400">
            Schedule intervention for later or send immediately
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="schedule"
                checked={!scheduledFor}
                onChange={() => onScheduleChange?.(undefined)}
                className="text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-300">Send immediately</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="schedule"
                checked={!!scheduledFor}
                onChange={() => onScheduleChange?.(new Date())}
                className="text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-300">Schedule for later</span>
            </label>
          </div>

          {scheduledFor !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Send Date & Time
              </label>
              <Input
                type="datetime-local"
                value={scheduledFor ? scheduledFor.toISOString().slice(0, 16) : ''}
                onChange={(e) => onScheduleChange?.(e.target.value ? new Date(e.target.value) : undefined)}
                className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {selectedTemplate && (
        <Card className="mission-card-glow">
          <CardHeader>
            <CardTitle className="text-cyan-400 font-mono text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Email Preview
            </CardTitle>
            <CardDescription className="text-gray-400">
              Preview how the email will look with sample data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as 'subject' | 'content')}>
              <TabsList className="grid w-full grid-cols-2 bg-[#1a1f2e]">
                <TabsTrigger value="subject">Subject Line</TabsTrigger>
                <TabsTrigger value="content">Email Content</TabsTrigger>
              </TabsList>

              <TabsContent value="subject" className="mt-4">
                <div className="bg-gray-900 rounded-lg p-4 border border-cyan-500/20">
                  <p className="text-sm text-gray-400 mb-2">Subject:</p>
                  <p className="text-gray-200 font-mono">
                    {customSubject || renderTemplateWithVariables(selectedTemplate.subject)}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="content" className="mt-4">
                <div className="bg-gray-900 rounded-lg p-4 border border-cyan-500/20">
                  <div className="prose prose-sm prose-invert max-w-none">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans">
                      {customContent || renderTemplateWithVariables(selectedTemplate.contentTemplate)}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-sm text-yellow-200">
                Note: Variables like {`{{tutorName}}`} will be replaced with actual tutor data when sent.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


