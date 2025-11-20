/**
 * Main Dashboard Page
 * 
 * Landing page with links to all dashboard sections
 */

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, Trophy, TrendingUp, Shield, FlaskConical, Mail, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const dashboards = [
    {
      title: 'Activation & Engagement',
      description: 'Monitor tutor activity patterns, login frequency, and engagement metrics',
      icon: Activity,
      href: '/dashboard/activation',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Star Performers',
      description: 'Leaderboard and analysis of top-performing tutors with key differentiating factors',
      icon: Trophy,
      href: '/dashboard/performers',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'AI Insights',
      description: 'Patterns and recommendations discovered by AI analysis',
      icon: TrendingUp,
      href: '/dashboard/insights',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Reliability & No-Shows',
      description: 'Analyze rescheduling patterns, no-show predictions, and reliability metrics',
      icon: Shield,
      href: '/dashboard/reliability',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Experiments',
      description: 'Manage A/B tests and analyze intervention effectiveness',
      icon: FlaskConical,
      href: '/dashboard/experiments',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Interventions',
      description: 'Create and monitor targeted campaigns and automated messages',
      icon: Mail,
      href: '/dashboard/interventions',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Alerts',
      description: 'View and manage system alerts for at-risk tutors',
      icon: AlertCircle,
      href: '/dashboard/alerts',
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    }
  ]

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tutor Quality Dashboard</h1>
        <p className="text-gray-600 mt-2">
          AI-powered engagement and intervention platform for gig tutors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map((dashboard) => {
          const Icon = dashboard.icon
          return (
            <Card key={dashboard.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`p-3 rounded-lg ${dashboard.bgColor} w-fit`}>
                  <Icon className={`h-6 w-6 ${dashboard.color}`} />
                </div>
                <CardTitle className="mt-4">{dashboard.title}</CardTitle>
                <CardDescription>{dashboard.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={dashboard.href}>
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    View Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Tutors (7d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">156</div>
            <p className="text-xs text-green-600 mt-1">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">23</div>
            <p className="text-xs text-red-600 mt-1">5 critical</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Interventions Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">87</div>
            <p className="text-xs text-blue-600 mt-1">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Experiments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-purple-600 mt-1">2 reaching significance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
