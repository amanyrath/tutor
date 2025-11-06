'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GraduationCap, Users, TrendingUp, Target, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { LandingNavbar } from '@/components/landing/landing-navbar'
import { InterventionPipeline } from '@/components/dashboard/intervention-pipeline'

interface MetricsData {
  totalTutors: number
  studentExperienceScore: number
  tutorRetentionRate: number
  criticalAlerts: number
  interventionSuccessRate: number
}

interface InterventionMetrics {
  thisMonth: {
    total: number
    sent: number
    responded: number
  }
  metrics: {
    avgEngagementImprovement: number
    responseRate: number
    tutorsReengaged: number
    successRate: number
  }
}

export default function LandingPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [interventionMetrics, setInterventionMetrics] = useState<InterventionMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [metricsRes, interventionRes] = await Promise.all([
        fetch('/api/landing/metrics'),
        fetch('/api/landing/intervention-metrics')
      ])
      
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json()
        setMetrics(metricsData)
      }

      if (interventionRes.ok) {
        const interventionData = await interventionRes.json()
        setInterventionMetrics(interventionData)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Navigation */}
      <LandingNavbar />

      {/* Hero Section */}
      <div className="border-b border-cyan-500/30 bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#0f1419]">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-cyan-500/20 text-cyan-400 border-cyan-500/50 px-4 py-2 text-sm font-mono">
              <Sparkles className="h-3 w-3 mr-2 inline" />
              AI-POWERED EDUCATION PLATFORM
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-cyan-400 mb-6 tracking-tight font-mono uppercase">
              Delivering Exceptional
              <br />
              <span className="text-white">Educational Outcomes</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Maintaining tutor quality and consistency for better student success through
              automated analytics and intelligent interventions
            </p>

            {/* Key Stat */}
            <div className="inline-block bg-[#1a1f2e] border-2 border-cyan-500/50 rounded-lg p-6 shadow-lg shadow-cyan-500/20">
              <div className="flex items-center gap-4">
                <GraduationCap className="h-12 w-12 text-cyan-400" />
                <div className="text-left">
                  <div className="text-4xl font-bold text-cyan-400 font-mono">35%</div>
                  <div className="text-gray-400 text-sm">
                    Better learning outcomes with consistent tutors
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button 
                  size="lg"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono tracking-wide shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
                >
                  <Target className="h-4 w-4 mr-2" />
                  EXPLORE DASHBOARDS
                </Button>
              </Link>
              <Link href="/dashboard/interventions">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-mono"
                >
                  VIEW INTERVENTIONS
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Primary Metrics - Student Impact Focus */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Student Experience Metrics</h2>
            <p className="text-gray-400">
              Real-time tracking of factors that drive educational outcomes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-[#1a1f2e] border-cyan-500/30">
                  <CardHeader>
                    <Skeleton className="h-4 w-24 bg-gray-700" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 bg-gray-700" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <MetricCard
                  title="STUDENT EXPERIENCE"
                  value={metrics?.studentExperienceScore?.toFixed(1) || '0.0'}
                  icon={GraduationCap}
                  color="cyan"
                  suffix="/100"
                  description="Composite score: engagement, reliability, consistency"
                  link="/dashboard"
                />
                <MetricCard
                  title="TUTOR RETENTION"
                  value={metrics?.tutorRetentionRate?.toFixed(1) || '0.0'}
                  icon={Users}
                  color="green"
                  suffix="%"
                  description="Ensuring learning continuity for students"
                  link="/dashboard/tutors"
                />
                <MetricCard
                  title="QUALITY ALERTS"
                  value={metrics?.criticalAlerts || 0}
                  icon={AlertCircle}
                  color="red"
                  description="Protecting student experience in real-time"
                  link="/dashboard/alerts"
                  status={metrics && metrics.criticalAlerts > 5 ? 'critical' : 'normal'}
                />
                <MetricCard
                  title="INTERVENTION SUCCESS"
                  value={metrics?.interventionSuccessRate?.toFixed(1) || '0.0'}
                  icon={TrendingUp}
                  color="purple"
                  suffix="%"
                  description="Supporting tutor growth for better outcomes"
                  link="/dashboard/interventions"
                />
              </>
            )}
          </div>
        </div>

        {/* Intervention Pipeline */}
        <div>
          <InterventionPipeline />
        </div>

        {/* Intervention Success Metrics */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Intervention Impact</h2>
            <p className="text-gray-400">
              Measurable improvements in tutor performance driving better student outcomes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-[#1a1f2e] border-cyan-500/30">
                  <CardHeader>
                    <Skeleton className="h-4 w-24 bg-gray-700" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 bg-gray-700" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <ImpactCard
                  title="This Month"
                  value={interventionMetrics?.thisMonth.sent || 0}
                  description="Interventions sent"
                  color="cyan"
                />
                <ImpactCard
                  title="Avg Improvement"
                  value={`+${interventionMetrics?.metrics.avgEngagementImprovement?.toFixed(1) || '0.0'}`}
                  description="Engagement score increase"
                  color="green"
                />
                <ImpactCard
                  title="Response Rate"
                  value={`${interventionMetrics?.metrics.responseRate?.toFixed(1) || '0.0'}%`}
                  description="Tutors actively engaging"
                  color="purple"
                />
                <ImpactCard
                  title="Tutors Re-engaged"
                  value={interventionMetrics?.metrics.tutorsReengaged || 0}
                  description="Back to active status"
                  color="amber"
                />
              </>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <Card className="bg-[#1a1f2e] border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400 font-mono uppercase">Quick Access</CardTitle>
            <CardDescription className="text-gray-400">
              Navigate to key dashboards and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickLink href="/dashboard" label="All Dashboards" />
              <QuickLink href="/dashboard/tutors" label="All Tutors" />
              <QuickLink href="/dashboard/alerts" label="Active Alerts" />
              <QuickLink href="/dashboard/performers" label="Top Performers" />
              <QuickLink href="/dashboard/interventions" label="Interventions" />
              <QuickLink href="/dashboard/first-sessions" label="First Sessions" />
              <QuickLink href="/dashboard/reliability" label="Reliability" />
              <QuickLink href="/dashboard/insights" label="AI Insights" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, color, suffix = '', description, link, status }: any) {
  const colorClasses = {
    cyan: 'text-cyan-400 border-cyan-500/50 hover:border-cyan-400',
    red: 'text-red-400 border-red-500/50 hover:border-red-400',
    green: 'text-green-400 border-green-500/50 hover:border-green-400',
    purple: 'text-purple-400 border-purple-500/50 hover:border-purple-400',
  }

  return (
    <Link href={link}>
      <Card className={`bg-[#1a1f2e] border-2 ${colorClasses[color as keyof typeof colorClasses]} transition-all cursor-pointer group hover:shadow-lg`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-gray-400">{title}</p>
            <Icon className={`h-4 w-4 ${colorClasses[color as keyof typeof colorClasses].split(' ')[0]} ${status === 'critical' ? 'animate-pulse' : ''}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold font-mono ${colorClasses[color as keyof typeof colorClasses].split(' ')[0]} mb-2`}>
            {value}{suffix}
          </div>
          <p className="text-xs text-gray-500">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

function ImpactCard({ title, value, description, color }: any) {
  const colorClasses = {
    cyan: 'text-cyan-400 border-cyan-500/50',
    green: 'text-green-400 border-green-500/50',
    purple: 'text-purple-400 border-purple-500/50',
    amber: 'text-amber-400 border-amber-500/50',
  }

  return (
    <Card className={`bg-[#1a1f2e] border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <CardHeader className="pb-2">
        <p className="text-xs font-mono text-gray-400">{title}</p>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold font-mono ${colorClasses[color as keyof typeof colorClasses].split(' ')[0]} mb-1`}>
          {value}
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  )
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <div className="px-4 py-3 bg-[#0f1419] border border-cyan-500/30 rounded-lg hover:border-cyan-400 hover:bg-cyan-500/10 transition-all cursor-pointer text-center">
        <p className="text-sm font-mono text-cyan-400">{label}</p>
      </div>
    </Link>
  )
}
