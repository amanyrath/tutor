/**
 * Star Performer List Component
 * 
 * Displays a ranked list of top-performing tutors
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, Star, TrendingUp, Award, Filter } from 'lucide-react'

interface TutorPerformance {
  tutorId: string
  compositeScore: number | null
  engagementScore: number | null
  empathyScore: number | null
  clarityScore: number | null
  satisfactionScore: number | null
  studentRating: number | null
  firstSessionRating: number | null
  recommendationRate: number | null
  reliabilityScore: number | null
  sessionsCompleted: number
  churnProbability: number | null
  technicalIssueRate: number | null
  rescheduleRate: number | null
  noShowCount: number
  monthsExperience: number
  primarySubject: string
  certificationLevel: string
}

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Languages', 'Computer Science', 'Test Prep', 'Programming']

export function StarPerformerList() {
  const [performers, setPerformers] = useState<TutorPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  useEffect(() => {
    const url = selectedSubject === 'all' 
      ? '/api/analytics/performers'
      : `/api/analytics/performers?subject=${encodeURIComponent(selectedSubject)}`
    
    setLoading(true)
    fetch(url)
      .then(res => res.json())
      .then(data => {
        // Extract star performers from the response
        const starPerformers = data?.segments?.star?.tutors || []
        setPerformers(starPerformers)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching star performers:', err)
        setLoading(false)
      })
  }, [selectedSubject])

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="h-4 w-4 text-yellow-500" />
    if (rank === 1) return <Award className="h-4 w-4 text-gray-400" />
    if (rank === 2) return <Award className="h-4 w-4 text-orange-600" />
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Star Performers Leaderboard
            </CardTitle>
            <CardDescription className="mt-1">
              {loading ? (
                'Loading top performers...'
              ) : (
                <>
                  {performers.length} {selectedSubject !== 'all' ? selectedSubject : ''} tutor{performers.length !== 1 ? 's' : ''} ranked by composite score
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {SUBJECTS.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : performers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No star performers found for the selected subject.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left py-2 px-2 w-12">#</th>
                  <th className="text-left py-2 px-3">Tutor ID</th>
                  <th className="text-left py-2 px-2">Subject</th>
                  <th className="text-right py-2 px-2">Composite</th>
                  <th className="text-right py-2 px-2">Rating</th>
                  <th className="text-right py-2 px-2">Engagement</th>
                  <th className="text-right py-2 px-2">Empathy</th>
                  <th className="text-right py-2 px-2">Clarity</th>
                  <th className="text-right py-2 px-2">Satisfaction</th>
                  <th className="text-right py-2 px-2">Sessions</th>
                  <th className="text-right py-2 px-2">Reliability</th>
                  <th className="text-right py-2 px-2">Recommend</th>
                  <th className="text-right py-2 px-2">Reschedule</th>
                  <th className="text-right py-2 px-2">Experience</th>
                </tr>
              </thead>
              <tbody>
                {performers.map((tutor, index) => (
                  <tr
                    key={tutor.tutorId}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        {getRankIcon(index)}
                        <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{tutor.tutorId}</span>
                        {index < 3 && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0">
                            Top {index + 1}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <Badge variant="outline" className="text-xs">
                        {tutor.primarySubject}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span className="font-semibold text-sm">{tutor.compositeScore?.toFixed(1) || 'N/A'}</span>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs">{tutor.studentRating?.toFixed(2) || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-xs">{tutor.engagementScore?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right text-xs">{tutor.empathyScore?.toFixed(1) || 'N/A'}</td>
                    <td className="py-2 px-2 text-right text-xs">{tutor.clarityScore?.toFixed(1) || 'N/A'}</td>
                    <td className="py-2 px-2 text-right text-xs">{tutor.satisfactionScore?.toFixed(1) || 'N/A'}</td>
                    <td className="py-2 px-2 text-right text-xs font-medium">{tutor.sessionsCompleted || 0}</td>
                    <td className="py-2 px-2 text-right text-xs">{(tutor.reliabilityScore ? (tutor.reliabilityScore * 10).toFixed(0) : 'N/A')}%</td>
                    <td className="py-2 px-2 text-right text-xs">{(tutor.recommendationRate ? (tutor.recommendationRate * 100).toFixed(0) : 'N/A')}%</td>
                    <td className="py-2 px-2 text-right text-xs text-red-600">{(tutor.rescheduleRate ? (tutor.rescheduleRate * 100).toFixed(1) : 'N/A')}%</td>
                    <td className="py-2 px-2 text-right text-xs text-gray-500">{tutor.monthsExperience}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

