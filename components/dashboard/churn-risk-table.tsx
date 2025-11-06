'use client'

import React, { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChurnRiskBadge } from './churn-risk-badge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Eye, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Tutor {
  id: string
  tutorId: string
  primarySubject: string
  aggregates: {
    churnProbability: number
    churnRiskLevel: string
    churnSignalsDetected: number
    totalSessions7d: number
    avgRating7d: number | null
  } | null
}

interface ChurnRiskTableProps {
  initialTutors: Tutor[]
}

export function ChurnRiskTable({ initialTutors }: ChurnRiskTableProps) {
  const [tutors, setTutors] = useState(initialTutors)
  const [riskFilter, setRiskFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const filteredTutors = useMemo(() => {
    return tutors.filter((tutor) => {
      const matchesRisk = riskFilter === 'All' || tutor.aggregates?.churnRiskLevel === riskFilter
      const matchesSearch = tutor.tutorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.primarySubject.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesRisk && matchesSearch
    })
  }, [tutors, riskFilter, searchQuery])

  const totalPages = Math.ceil(filteredTutors.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTutors = filteredTutors.slice(startIndex, endIndex)

  const handleFilterChange = (value: string) => {
    setRiskFilter(value)
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  const getPrimarySignal = (tutor: Tutor): string => {
    if (!tutor.aggregates) return 'No data'
    
    const signals = []
    if (tutor.aggregates.churnSignalsDetected > 3) {
      signals.push('Multiple signals')
    }
    if (tutor.aggregates.churnProbability > 0.7) {
      signals.push('Very high probability')
    }
    if (tutor.aggregates.avgRating7d && tutor.aggregates.avgRating7d < 3.5) {
      signals.push('Low recent ratings')
    }
    
    return signals[0] || 'Monitoring'
  }

  const getHeatmapColor = (value: number, max: number): string => {
    const ratio = value / max
    if (ratio > 0.7) return 'bg-green-900/40 text-green-400 border-l-2 border-green-500'
    if (ratio > 0.4) return 'bg-yellow-900/40 text-yellow-400 border-l-2 border-yellow-500'
    return 'bg-red-900/40 text-red-400 border-l-2 border-red-500'
  }

  const getRatingColor = (rating: number | null): string => {
    if (!rating) return 'text-gray-500'
    if (rating >= 4.0) return 'text-green-400'
    if (rating >= 3.5) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (tutors.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg mission-card">
        <p className="text-gray-400">No tutors found. Import data to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search by ID or subject..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200 placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-2">
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[120px] bg-[#1a1f2e] border-cyan-500/30 text-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1419] border-cyan-500/30">
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px] bg-[#1a1f2e] border-cyan-500/30 text-gray-200">
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1419] border-cyan-500/30">
              <SelectItem value="All">All Risk Levels</SelectItem>
              <SelectItem value="High">High Risk</SelectItem>
              <SelectItem value="Medium">Medium Risk</SelectItem>
              <SelectItem value="Low">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border border-cyan-500/30 rounded-lg mission-card overflow-hidden">
        <Table className="table-compact">
          <TableHeader>
            <TableRow className="border-b border-cyan-500/20 hover:bg-cyan-500/5">
              <TableHead className="text-cyan-400 font-mono text-xs uppercase">Tutor ID</TableHead>
              <TableHead className="text-cyan-400 font-mono text-xs uppercase">Subject</TableHead>
              <TableHead className="text-cyan-400 font-mono text-xs uppercase">Churn %</TableHead>
              <TableHead className="text-cyan-400 font-mono text-xs uppercase">Risk</TableHead>
              <TableHead className="text-cyan-400 font-mono text-xs uppercase">Signals</TableHead>
              <TableHead className="text-cyan-400 font-mono text-xs uppercase">7d Sessions</TableHead>
              <TableHead className="text-cyan-400 font-mono text-xs uppercase">7d Rating</TableHead>
              <TableHead className="text-cyan-400 font-mono text-xs uppercase text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTutors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                  No tutors match the filters
                </TableCell>
              </TableRow>
            ) : (
              paginatedTutors.map((tutor) => (
                <React.Fragment key={tutor.id}>
                  <TableRow 
                    className={cn(
                      "border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors cursor-pointer",
                      expandedRow === tutor.id && "bg-cyan-500/5"
                    )}
                    onClick={() => setExpandedRow(expandedRow === tutor.id ? null : tutor.id)}
                  >
                    <TableCell className="font-mono font-medium text-cyan-400 text-sm">
                      {tutor.tutorId}
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm">
                      <Link 
                        href={`/dashboard?subject=${encodeURIComponent(tutor.primarySubject)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-cyan-400 transition-colors"
                      >
                        <Badge 
                          variant="outline" 
                          className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 cursor-pointer"
                        >
                          {tutor.primarySubject}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tutor.aggregates?.avgRating7d && tutor.aggregates.avgRating7d < 3.5 ? (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        ) : (
                          <TrendingUp className="h-3 w-3 text-green-400" />
                        )}
                        <span className="font-semibold font-mono text-sm text-gray-200">
                          {tutor.aggregates
                            ? `${Math.round(tutor.aggregates.churnProbability * 100)}%`
                            : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tutor.aggregates ? (
                        <ChurnRiskBadge
                          probability={tutor.aggregates.churnProbability}
                          riskLevel={tutor.aggregates.churnRiskLevel as 'High' | 'Medium' | 'Low'}
                          showProbability={false}
                        />
                      ) : (
                        <Badge variant="outline" className="text-gray-500">No Data</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "font-mono text-xs",
                          tutor.aggregates && tutor.aggregates.churnSignalsDetected > 3 
                            ? "bg-red-900/30 text-red-400 border-red-500/50" 
                            : "bg-gray-800/50 text-gray-400 border-gray-600/50"
                        )}
                      >
                        {tutor.aggregates?.churnSignalsDetected ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(
                      "font-mono text-sm",
                      getHeatmapColor(tutor.aggregates?.totalSessions7d ?? 0, 20)
                    )}>
                      {tutor.aggregates?.totalSessions7d ?? 0}
                    </TableCell>
                    <TableCell className={cn(
                      "font-mono text-sm font-semibold",
                      getRatingColor(tutor.aggregates?.avgRating7d ?? null)
                    )}>
                      {tutor.aggregates?.avgRating7d
                        ? tutor.aggregates.avgRating7d.toFixed(1)
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/tutors/${tutor.tutorId}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-cyan-400"
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedRow(expandedRow === tutor.id ? null : tutor.id)
                          }}
                        >
                          {expandedRow === tutor.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRow === tutor.id && tutor.aggregates && (
                    <TableRow className="border-b border-cyan-500/10 bg-cyan-900/5">
                      <TableCell colSpan={8} className="py-3">
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500 uppercase">Primary Signal:</span>
                            <p className="text-gray-300 font-semibold mt-1">{getPrimarySignal(tutor)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 uppercase">30d Sessions:</span>
                            <p className="text-gray-300 font-semibold mt-1 font-mono">
                              {tutor.aggregates.totalSessions7d * 4}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 uppercase">30d Avg Rating:</span>
                            <p className={cn("font-semibold mt-1 font-mono", getRatingColor(tutor.aggregates.avgRating7d))}>
                              {tutor.aggregates.avgRating7d ? tutor.aggregates.avgRating7d.toFixed(2) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredTutors.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-400 font-mono">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredTutors.length)} of{' '}
            {filteredTutors.length} tutor{filteredTutors.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200 hover:bg-cyan-500/10"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-10",
                      currentPage === pageNum 
                        ? "bg-cyan-500 text-black hover:bg-cyan-400" 
                        : "bg-[#1a1f2e] border-cyan-500/30 text-gray-200 hover:bg-cyan-500/10"
                    )}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200 hover:bg-cyan-500/10"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


