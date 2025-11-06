'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Brain, Send, BarChart3, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface PipelineMetrics {
  pipeline: {
    detected: number
    analyzed: number
    sent: number
    tracked: number
  }
}

export function InterventionPipeline() {
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/landing/intervention-metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching pipeline metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const stages = [
    {
      id: 'detect',
      title: 'DETECT',
      description: 'Quality signals identified',
      icon: Search,
      color: 'cyan',
      count: metrics?.pipeline.detected ?? 0,
    },
    {
      id: 'analyze',
      title: 'ANALYZE',
      description: 'AI-powered assessment',
      icon: Brain,
      color: 'purple',
      count: metrics?.pipeline.analyzed ?? 0,
    },
    {
      id: 'intervene',
      title: 'INTERVENE',
      description: 'Targeted outreach sent',
      icon: Send,
      color: 'green',
      count: metrics?.pipeline.sent ?? 0,
    },
    {
      id: 'track',
      title: 'TRACK',
      description: 'Outcomes measured',
      icon: BarChart3,
      color: 'amber',
      count: metrics?.pipeline.tracked ?? 0,
    },
  ]

  const getColorClasses = (color: string) => {
    const classes = {
      cyan: {
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-500/50',
        text: 'text-cyan-400',
        glow: 'shadow-cyan-500/30',
      },
      purple: {
        bg: 'bg-purple-500/20',
        border: 'border-purple-500/50',
        text: 'text-purple-400',
        glow: 'shadow-purple-500/30',
      },
      green: {
        bg: 'bg-green-500/20',
        border: 'border-green-500/50',
        text: 'text-green-400',
        glow: 'shadow-green-500/30',
      },
      amber: {
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/50',
        text: 'text-amber-400',
        glow: 'shadow-amber-500/30',
      },
    }
    return classes[color as keyof typeof classes] || classes.cyan
  }

  return (
    <Card className="bg-[#1a1f2e] border-cyan-500/30 overflow-hidden">
      <CardContent className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-cyan-400 font-mono uppercase tracking-wide">
            Automated Intervention Pipeline
          </h2>
          <p className="text-gray-400 mt-2">
            AI-powered system to detect quality issues and support tutor growth for better student outcomes
          </p>
        </div>

        {/* Pipeline Stages */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            const colors = getColorClasses(stage.color)

            return (
              <div key={stage.id} className="relative">
                {/* Stage Card */}
                <Link href="/dashboard/interventions">
                  <div
                    className={`
                      ${colors.bg} ${colors.border} ${colors.glow}
                      border-2 rounded-lg p-6 
                      hover:scale-105 transition-all duration-300 cursor-pointer
                      group relative overflow-hidden
                      shadow-lg
                    `}
                  >
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Icon */}
                    <div className="relative z-10 mb-4">
                      <Icon className={`h-8 w-8 ${colors.text} animate-pulse`} />
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className={`text-xl font-bold font-mono ${colors.text} mb-1`}>
                        {stage.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">{stage.description}</p>
                      
                      {/* Count */}
                      {loading ? (
                        <div className="h-8 w-16 bg-gray-700 animate-pulse rounded" />
                      ) : (
                        <div className={`text-3xl font-bold font-mono ${colors.text}`}>
                          {stage.count}
                        </div>
                      )}
                    </div>

                    {/* Pulse effect on corners */}
                    <div className={`absolute top-0 right-0 w-2 h-2 ${colors.bg} rounded-full animate-ping`} />
                  </div>
                </Link>

                {/* Arrow between stages */}
                {index < stages.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-20">
                    <ArrowRight className="h-6 w-6 text-cyan-400/50" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard/interventions"
            className="inline-flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono rounded-lg transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
          >
            View All Interventions
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}


