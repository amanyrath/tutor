'use client'

import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'

export function SystemStatusBar() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="bg-[#0a0e1a] border-b border-cyan-500/30 px-4 py-2">
      <div className="container mx-auto flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="status-dot-success pulse-glow" />
            <span className="text-green-400 font-semibold">SYSTEM OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Activity className="h-3 w-3" />
            <span>Mission Control Dashboard v1.0</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-gray-400">
            <span className="text-cyan-400 font-mono" suppressHydrationWarning>
              {mounted ? formatDate(currentTime) : formatDate(new Date())}
            </span>
          </div>
          <div className="font-mono text-cyan-400 text-sm tabular-nums" suppressHydrationWarning>
            {mounted ? formatTime(currentTime) : '--:--:--'}
          </div>
        </div>
      </div>
    </div>
  )
}

