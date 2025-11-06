'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Star, AlertTriangle, Wifi } from 'lucide-react'

interface Session {
  sessionId: string
  sessionDatetime: Date
  subject: string
  actualDuration: number
  studentRating: number | null
  engagementScore: number | null
  isFirstSession: boolean | null
  hadTechnicalIssues: boolean | null
  connectionQuality: string
  empathyScore: number | null
  clarityScore: number | null
  studentSatisfaction: number | null
}

interface SessionHistoryTableProps {
  sessions: Session[]
}

export function SessionHistoryTable({ sessions }: SessionHistoryTableProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-white">
        <p className="text-gray-500">No sessions found</p>
      </div>
    )
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400">N/A</span>
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm ml-1">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="border rounded-lg bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Engagement</TableHead>
            <TableHead>Connection</TableHead>
            <TableHead>Flags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.sessionId}>
              <TableCell className="font-medium">
                {format(new Date(session.sessionDatetime), 'MMM d, yyyy')}
                <div className="text-xs text-gray-500">
                  {format(new Date(session.sessionDatetime), 'h:mm a')}
                </div>
              </TableCell>
              <TableCell>{session.subject}</TableCell>
              <TableCell>{session.actualDuration} min</TableCell>
              <TableCell>{renderStars(session.studentRating)}</TableCell>
              <TableCell>
                {session.engagementScore ? (
                  <span
                    className={`font-semibold ${
                      session.engagementScore >= 7
                        ? 'text-green-600'
                        : session.engagementScore >= 5
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {session.engagementScore.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    session.connectionQuality === 'Excellent'
                      ? 'border-green-200 text-green-700'
                      : session.connectionQuality === 'Good'
                      ? 'border-blue-200 text-blue-700'
                      : session.connectionQuality === 'Fair'
                      ? 'border-yellow-200 text-yellow-700'
                      : 'border-red-200 text-red-700'
                  }
                >
                  {session.connectionQuality}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {session.isFirstSession && (
                    <Badge variant="secondary" className="text-xs">
                      First
                    </Badge>
                  )}
                  {session.hadTechnicalIssues && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

