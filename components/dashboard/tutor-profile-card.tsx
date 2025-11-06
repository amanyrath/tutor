'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChurnRiskBadge } from './churn-risk-badge'
import { Award, BookOpen, Calendar, CheckCircle, XCircle } from 'lucide-react'

interface TutorProfileCardProps {
  tutor: {
    tutorId: string
    monthsExperience: number
    totalSessions: number
    avgHistoricalRating: number
    subjectsTaught: string
    primarySubject: string
    certificationLevel: string
    activeStatus: boolean
    reliabilityScore: number
    rescheduleRate: number
    noShowCount: number
    aggregates: {
      churnProbability: number
      churnRiskLevel: string
    } | null
  }
}

export function TutorProfileCard({ tutor }: TutorProfileCardProps) {
  const subjects = tutor.subjectsTaught.split(',').map(s => s.trim())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Status</p>
          <div className="flex items-center gap-2">
            {tutor.activeStatus ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Active</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Inactive</span>
              </>
            )}
          </div>
        </div>

        {tutor.aggregates && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Churn Risk</p>
            <ChurnRiskBadge
              probability={tutor.aggregates.churnProbability}
              riskLevel={tutor.aggregates.churnRiskLevel as 'High' | 'Medium' | 'Low'}
              showProbability={true}
            />
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500 mb-1">Experience</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">
              {tutor.monthsExperience} months
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Total Sessions</p>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">
              {tutor.totalSessions.toLocaleString()}
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Certification</p>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-gray-400" />
            <Badge variant="outline">{tutor.certificationLevel}</Badge>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Subjects</p>
          <div className="flex flex-wrap gap-1">
            {subjects.map((subject, idx) => (
              <Badge
                key={idx}
                variant={subject === tutor.primarySubject ? 'default' : 'secondary'}
              >
                {subject}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Rating</span>
            <span className="text-sm font-semibold">
              {tutor.avgHistoricalRating.toFixed(1)} / 5.0
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Reliability</span>
            <span className="text-sm font-semibold">
              {(tutor.reliabilityScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Reschedule Rate</span>
            <span className="text-sm font-semibold">
              {(tutor.rescheduleRate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">No-Shows</span>
            <span className="text-sm font-semibold">{tutor.noShowCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

