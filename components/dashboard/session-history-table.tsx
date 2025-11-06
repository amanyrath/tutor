'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Session {
  sessionId: string
  sessionDatetime: Date
  subject: string
  gradeLevel: string
  sessionCompleted: boolean
  actualDuration: number
  studentRating: number | null
  engagementScore: number | null
  empathyScore: number | null
  clarityScore: number | null
  hadTechnicalIssues: boolean | null
  connectionQuality: string
}

interface SessionHistoryTableProps {
  sessions: Session[]
}

export function SessionHistoryTable({ sessions }: SessionHistoryTableProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedSessions = showAll ? sessions : sessions.slice(0, 10)

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>No sessions found</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getConnectionQualityBadge = (quality: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      Excellent: 'default',
      Good: 'default',
      Fair: 'secondary',
      Poor: 'destructive',
    }
    return <Badge variant={variants[quality] || 'secondary'}>{quality}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session History</CardTitle>
        <CardDescription>
          Showing {displayedSessions.length} of {sessions.length} sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Connection</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedSessions.map((session) => (
                <TableRow key={session.sessionId}>
                  <TableCell className="text-sm">
                    {new Date(session.sessionDatetime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{session.subject}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{session.gradeLevel}</TableCell>
                  <TableCell className="text-sm">{session.actualDuration} min</TableCell>
                  <TableCell>
                    {session.studentRating ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {session.studentRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">/5</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {session.engagementScore ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {session.engagementScore.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">/10</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>{getConnectionQualityBadge(session.connectionQuality)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {session.sessionCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {session.hadTechnicalIssues && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {sessions.length > 10 && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Show Less' : `Show All ${sessions.length} Sessions`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

