import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Bell, Activity, Radio, Trophy, Users, Lightbulb, Shield, Mail } from 'lucide-react'
import { prisma } from '@/lib/db'

async function getUnacknowledgedAlertCount() {
  try {
    const count = await prisma.alert.count({
      where: { isAcknowledged: false },
    })
    return count
  } catch (error) {
    console.error('Error fetching alert count:', error)
    return 0
  }
}

export async function Navbar() {
  const alertCount = await getUnacknowledgedAlertCount()

  return (
    <nav className="border-b border-cyan-500/30 bg-[#0f1419] sticky top-0 z-50 shadow-lg shadow-cyan-500/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Main Nav */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 group">
              <Radio className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <span className="text-xl font-bold text-cyan-400 tracking-tight font-mono">
                MISSION CONTROL
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/dashboard/tutors">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Tutors
                </Button>
              </Link>
              <Link href="/dashboard/alerts">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors relative"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Alerts
                  {alertCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-2 h-5 min-w-5 px-1.5 flex items-center justify-center text-xs bg-red-500 text-white pulse-glow"
                    >
                      {alertCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/dashboard/performers">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Performers
                </Button>
              </Link>
              <Link href="/dashboard/first-sessions">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  First Sessions
                </Button>
              </Link>
              <Link href="/dashboard/interventions">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Interventions
                </Button>
              </Link>
              <Link href="/dashboard/reliability">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Reliability
                </Button>
              </Link>
              <Link href="/dashboard/insights">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  AI Insights
                </Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
              <Input
                type="search"
                placeholder="Search tutors by ID, name, or subject..."
                className="pl-10 bg-[#1a1f2e] border-cyan-500/30 text-gray-200 placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400/50"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
