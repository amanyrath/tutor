'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, TrendingUp, TrendingDown, Activity, Users, Target, Radio, Zap } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, TooltipProps } from 'recharts'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'

interface MetricsData {
  totalTutors: number
  highRiskCount: number
  avgEngagement: number
  poorFirstSessionCount: number
  avgReliability: number
  criticalAlerts: number
  pendingInterventions: number
  activationRate: number
}

interface TrendData {
  date: string
  engagement: number
  rating: number
  satisfaction: number
  sessions: number
}

export default function MissionControlPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [metricsRes, trendsRes] = await Promise.all([
        fetch('/api/landing/metrics'),
        fetch('/api/landing/trends')
      ])
      
      if (!metricsRes.ok) {
        throw new Error('Failed to fetch metrics')
      }
      
      const metricsData = await metricsRes.json()
      setMetrics(metricsData)
      
      if (trendsRes.ok) {
        const trendsData = await trendsRes.json()
        setTrends(trendsData.trends || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }, higherBetter = true) => {
    if (higherBetter) {
      if (value >= thresholds.good) return 'text-green-500'
      if (value >= thresholds.warning) return 'text-yellow-500'
      return 'text-red-500'
    } else {
      if (value <= thresholds.good) return 'text-green-500'
      if (value <= thresholds.warning) return 'text-yellow-500'
      return 'text-red-500'
    }
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      // Format date like "October 15, 2025"
      const formattedDate = format(parseISO(label), 'MMMM d, yyyy')
      
      return (
        <div className="bg-[#1a1f2e] border border-cyan-400 rounded-lg p-3 shadow-lg">
          <p className="text-cyan-400 font-mono text-sm mb-2">{formattedDate}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-mono">{entry.name}: </span>
              <span className="font-bold">{Number(entry.value).toFixed(2)}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-gradient-to-r from-[#0f1419] to-[#1a2332]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Radio className="h-8 w-8 text-cyan-400 animate-pulse" />
                <h1 className="text-3xl font-bold text-cyan-400 tracking-tight font-mono">
                  MISSION CONTROL
                </h1>
              </div>
              <p className="text-gray-400 mt-2 font-mono text-sm">
                Real-time tutor quality monitoring and intervention system
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-green-500/50 text-green-400 font-mono">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                SYSTEM ONLINE
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="bg-red-950/20 border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>System Alert</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Critical Metrics Grid */}
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
                title="ACTIVE TUTORS"
                value={metrics?.totalTutors || 0}
                icon={Users}
                trend={+5}
                color="cyan"
                link="/dashboard/tutors"
              />
              <MetricCard
                title="CHURN RISK"
                value={metrics?.highRiskCount || 0}
                icon={AlertCircle}
                trend={-2}
                color="red"
                status="critical"
                link="/dashboard/alerts"
              />
              <MetricCard
                title="ENGAGEMENT"
                value={Number((metrics?.avgEngagement || 0).toFixed(1))}
                icon={TrendingUp}
                trend={+0.3}
                color="green"
                suffix="/10"
                link="/dashboard/activation"
              />
              <MetricCard
                title="RELIABILITY"
                value={Number((metrics?.avgReliability || 0).toFixed(1))}
                icon={Target}
                trend={+2.1}
                color="blue"
                suffix="%"
                link="/dashboard/reliability"
              />
            </>
          )}
        </div>

        {/* Main Charts Section */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="bg-[#1a1f2e] border border-cyan-500/30">
            <TabsTrigger value="trends" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <TrendingUp className="h-4 w-4 mr-2" />
              ENGAGEMENT TRENDS
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Zap className="h-4 w-4 mr-2" />
              SYSTEM STATUS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card className="bg-[#1a1f2e] border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 font-mono">30-DAY PERFORMANCE TRENDS</CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time monitoring of key quality indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[300px] bg-gray-700" />
                ) : trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trends}>
                      <defs>
                        <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="engagement"
                        stroke="#22d3ee"
                        fillOpacity={1}
                        fill="url(#colorEngagement)"
                        name="Engagement"
                      />
                      <Area
                        type="monotone"
                        dataKey="rating"
                        stroke="#a78bfa"
                        fillOpacity={1}
                        fill="url(#colorRating)"
                        name="Rating"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No trend data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatusCard
                title="CRITICAL ALERTS"
                value={metrics?.criticalAlerts || 0}
                status={metrics && metrics.criticalAlerts > 5 ? 'critical' : 'normal'}
                description="Requires immediate attention"
                link="/dashboard/alerts"
              />
              <StatusCard
                title="FIRST SESSION ISSUES"
                value={metrics?.poorFirstSessionCount || 0}
                status={metrics && metrics.poorFirstSessionCount > 20 ? 'warning' : 'normal'}
                description="24% churn risk correlation"
                link="/dashboard/first-sessions"
              />
              <StatusCard
                title="PENDING INTERVENTIONS"
                value={metrics?.pendingInterventions || 0}
                status="normal"
                description="Automated campaigns queued"
                link="/dashboard/interventions"
              />
              <StatusCard
                title="ACTIVATION RATE"
                value={`${(metrics?.activationRate || 0).toFixed(1)}%`}
                status={metrics && metrics.activationRate > 70 ? 'normal' : 'warning'}
                description="New tutor onboarding success"
                link="/dashboard/activation"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="bg-[#1a1f2e] border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400 font-mono">QUICK ACCESS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickLink href="/dashboard/tutors" label="All Tutors" />
              <QuickLink href="/dashboard/alerts" label="Alerts" />
              <QuickLink href="/dashboard/performers" label="Top Performers" />
              <QuickLink href="/dashboard/insights" label="AI Insights" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, trend, color, status, suffix = '', link }: any) {
  const colorClasses = {
    cyan: 'text-cyan-400 border-cyan-500/50',
    red: 'text-red-400 border-red-500/50',
    green: 'text-green-400 border-green-500/50',
    blue: 'text-blue-400 border-blue-500/50',
  }

  return (
    <Link href={link}>
      <Card className={`bg-[#1a1f2e] border ${colorClasses[color as keyof typeof colorClasses]} hover:border-${color}-400 transition-all cursor-pointer group`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-gray-400">{title}</p>
            <Icon className={`h-4 w-4 ${colorClasses[color as keyof typeof colorClasses].split(' ')[0]} ${status === 'critical' ? 'animate-pulse' : ''}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <div className={`text-3xl font-bold font-mono ${colorClasses[color as keyof typeof colorClasses].split(' ')[0]}`}>
                {value}{suffix}
              </div>
              {trend !== undefined && (
                <div className={`flex items-center text-xs mt-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(trend)}{suffix} vs last week
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function StatusCard({ title, value, status, description, link }: any) {
  const statusColors = {
    critical: 'border-red-500/50 text-red-400',
    warning: 'border-yellow-500/50 text-yellow-400',
    normal: 'border-green-500/50 text-green-400',
  }

  return (
    <Link href={link}>
      <Card className={`bg-[#1a1f2e] border ${statusColors[status as keyof typeof statusColors]} hover:scale-105 transition-all cursor-pointer`}>
        <CardHeader>
          <CardTitle className="text-sm font-mono text-gray-400">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold font-mono ${statusColors[status as keyof typeof statusColors].split(' ')[1]}`}>
            {value}
          </div>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
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
