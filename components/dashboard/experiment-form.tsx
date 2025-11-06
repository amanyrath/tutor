'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SampleSizeCalculator } from '@/components/dashboard/sample-size-calculator'
import { FlaskConical, Loader2 } from 'lucide-react'

interface ExperimentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExperimentForm({ open, onOpenChange }: ExperimentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [hypothesis, setHypothesis] = useState('')
  const [description, setDescription] = useState('')
  const [variants, setVariants] = useState('["control", "treatment"]')
  const [primaryMetric, setPrimaryMetric] = useState('')
  const [secondaryMetrics, setSecondaryMetrics] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [targetSegment, setTargetSegment] = useState('')
  const [sampleSize, setSampleSize] = useState<number | null>(null)
  
  const primaryMetrics = [
    'engagement_lift',
    'session_count_increase',
    'quality_score_improvement',
    'retention_rate_increase',
    'response_rate_increase',
    'conversion_rate_increase',
  ]
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    try {
      // Parse variants JSON
      let parsedVariants: string[]
      try {
        parsedVariants = JSON.parse(variants)
        if (!Array.isArray(parsedVariants) || parsedVariants.length < 2) {
          throw new Error('Variants must be an array with at least 2 items')
        }
      } catch (err) {
        setError('Invalid variants format. Use JSON array like: ["control", "treatment"]')
        setIsSubmitting(false)
        return
      }
      
      // Parse optional JSON fields
      let parsedSecondaryMetrics = null
      if (secondaryMetrics.trim()) {
        try {
          parsedSecondaryMetrics = JSON.parse(secondaryMetrics)
        } catch (err) {
          setError('Invalid secondary metrics format. Use JSON object or leave empty.')
          setIsSubmitting(false)
          return
        }
      }
      
      let parsedTargetSegment = null
      if (targetSegment.trim()) {
        try {
          parsedTargetSegment = JSON.parse(targetSegment)
        } catch (err) {
          setError('Invalid target segment format. Use JSON object or leave empty.')
          setIsSubmitting(false)
          return
        }
      }
      
      const response = await fetch('/api/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          hypothesis,
          description: description || null,
          variants: parsedVariants,
          primaryMetric,
          secondaryMetrics: parsedSecondaryMetrics,
          startDate,
          endDate: endDate || null,
          targetSegment: parsedTargetSegment,
          sampleSize,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create experiment')
      }
      
      // Reset form
      setName('')
      setHypothesis('')
      setDescription('')
      setVariants('["control", "treatment"]')
      setPrimaryMetric('')
      setSecondaryMetrics('')
      setStartDate('')
      setEndDate('')
      setTargetSegment('')
      setSampleSize(null)
      
      // Close dialog and refresh
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create experiment')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0a0e1a] border-indigo-500/20">
        <DialogHeader>
          <DialogTitle className="text-indigo-400 font-mono uppercase tracking-wide flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Create New Experiment
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Set up a new A/B test experiment. Configure it in GrowthBook after creation.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Basic Information</h3>
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-300">
                Experiment Name <span className="text-red-400">*</span>
              </label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Email Subject Line Test"
                className="bg-[#1a1f2e] border-indigo-500/20 text-gray-200"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="hypothesis" className="text-sm font-medium text-gray-300">
                Hypothesis <span className="text-red-400">*</span>
              </label>
              <textarea
                id="hypothesis"
                required
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                placeholder="e.g., Changing email subject line will increase open rates by 15%"
                rows={3}
                className="w-full rounded-md border bg-[#1a1f2e] border-indigo-500/20 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-300">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional context about this experiment"
                rows={2}
                className="w-full rounded-md border bg-[#1a1f2e] border-indigo-500/20 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
          
          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Configuration</h3>
            
            <div className="space-y-2">
              <label htmlFor="variants" className="text-sm font-medium text-gray-300">
                Variants (JSON Array) <span className="text-red-400">*</span>
              </label>
              <Input
                id="variants"
                required
                value={variants}
                onChange={(e) => setVariants(e.target.value)}
                placeholder='["control", "treatment_a", "treatment_b"]'
                className="bg-[#1a1f2e] border-indigo-500/20 text-gray-200 font-mono text-sm"
              />
              <p className="text-xs text-gray-500">JSON array with at least 2 variant names</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="primaryMetric" className="text-sm font-medium text-gray-300">
                Primary Metric <span className="text-red-400">*</span>
              </label>
              <Select value={primaryMetric} onValueChange={setPrimaryMetric} required>
                <SelectTrigger className="bg-[#1a1f2e] border-indigo-500/20 text-gray-200">
                  <SelectValue placeholder="Select primary metric" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f2e] border-indigo-500/20">
                  {primaryMetrics.map((metric) => (
                    <SelectItem key={metric} value={metric} className="text-gray-200">
                      {metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="secondaryMetrics" className="text-sm font-medium text-gray-300">
                Secondary Metrics (Optional JSON)
              </label>
              <Input
                id="secondaryMetrics"
                value={secondaryMetrics}
                onChange={(e) => setSecondaryMetrics(e.target.value)}
                placeholder='{"metric1": "value1", "metric2": "value2"}'
                className="bg-[#1a1f2e] border-indigo-500/20 text-gray-200 font-mono text-sm"
              />
            </div>
          </div>
          
          {/* Timing */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Timing</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium text-gray-300">
                  Start Date <span className="text-red-400">*</span>
                </label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#1a1f2e] border-indigo-500/20 text-gray-200"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium text-gray-300">
                  End Date (Optional)
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="bg-[#1a1f2e] border-indigo-500/20 text-gray-200"
                />
              </div>
            </div>
          </div>
          
          {/* Targeting */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Targeting (Optional)</h3>
            
            <div className="space-y-2">
              <label htmlFor="targetSegment" className="text-sm font-medium text-gray-300">
                Target Segment (JSON)
              </label>
              <Input
                id="targetSegment"
                value={targetSegment}
                onChange={(e) => setTargetSegment(e.target.value)}
                placeholder='{"subject": "math", "experience_months": {"gte": 6}}'
                className="bg-[#1a1f2e] border-indigo-500/20 text-gray-200 font-mono text-sm"
              />
              <p className="text-xs text-gray-500">JSON object with targeting criteria</p>
            </div>
          </div>
          
          {/* Sample Size Calculator */}
          <div className="border-t border-gray-700 pt-4">
            <SampleSizeCalculator />
            <div className="mt-4 space-y-2">
              <label htmlFor="sampleSize" className="text-sm font-medium text-gray-300">
                Sample Size (Optional - from calculator above)
              </label>
              <Input
                id="sampleSize"
                type="number"
                min="0"
                value={sampleSize || ''}
                onChange={(e) => setSampleSize(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Enter calculated sample size"
                className="bg-[#1a1f2e] border-indigo-500/20 text-gray-200"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="bg-[#1a1f2e] border-gray-600 text-gray-300 hover:bg-[#252a3a]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Create Experiment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


