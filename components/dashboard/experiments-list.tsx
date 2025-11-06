'use client'

import { ExperimentCard } from '@/components/dashboard/experiment-card'
import { FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ExperimentsListProps {
  experiments: any[]
}

export function ExperimentsList({ experiments }: ExperimentsListProps) {
  if (experiments.length === 0) {
    return (
      <div className="text-center py-12">
        <FlaskConical className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-400 mb-2">No experiments yet</h3>
        <p className="text-gray-500 mb-4">Create your first experiment to get started</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      {experiments.map((experiment) => (
        <ExperimentCard key={experiment.id} experiment={experiment} />
      ))}
    </div>
  )
}


