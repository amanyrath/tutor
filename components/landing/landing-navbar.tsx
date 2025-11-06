'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Radio, LayoutDashboard, Bell, Mail, User } from 'lucide-react'

export function LandingNavbar() {
  return (
    <nav className="border-b border-cyan-500/30 bg-[#0f1419] sticky top-0 z-50 shadow-lg shadow-cyan-500/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Radio className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors animate-pulse" />
            <span className="text-xl font-bold text-cyan-400 tracking-tight font-mono">
              MISSION CONTROL
            </span>
          </Link>
          
          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <Link href="/dashboard">
              <Button 
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono tracking-wide shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                DASHBOARDS
              </Button>
            </Link>
            <Link href="/dashboard/alerts">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
              >
                <Bell className="h-4 w-4 mr-2" />
                Alerts
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
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            >
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}


