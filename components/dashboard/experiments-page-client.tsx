'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ExperimentForm } from '@/components/dashboard/experiment-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Filter } from 'lucide-react'

export function ExperimentsPageClient() {
  const [formOpen, setFormOpen] = useState(false)
  
  return (
    <>
      <Button 
        onClick={() => setFormOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-500 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Experiment
      </Button>
      <ExperimentForm open={formOpen} onOpenChange={setFormOpen} />
    </>
  )
}

export function StatusFilter({ currentStatus }: { currentStatus: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    router.push(`/dashboard/experiments?${params.toString()}`)
  }
  
  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px] bg-[#1a1f2e] border-indigo-500/20 text-gray-200">
        <Filter className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent className="bg-[#1a1f2e] border-indigo-500/20">
        <SelectItem value="all" className="text-gray-200">All Statuses</SelectItem>
        <SelectItem value="draft" className="text-gray-200">Draft</SelectItem>
        <SelectItem value="active" className="text-gray-200">Active</SelectItem>
        <SelectItem value="paused" className="text-gray-200">Paused</SelectItem>
        <SelectItem value="completed" className="text-gray-200">Completed</SelectItem>
        <SelectItem value="archived" className="text-gray-200">Archived</SelectItem>
      </SelectContent>
    </Select>
  )
}

