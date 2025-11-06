/**
 * Star Performer Leaderboard Page
 * 
 * Displays top-performing tutors with key differentiating metrics
 */

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StarPerformerList } from '@/components/dashboard/star-performer-list'
import { PerformerComparison } from '@/components/dashboard/performer-comparison'
import { DifferentiatingFactors } from '@/components/dashboard/differentiating-factors'

export default function StarPerformersPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Star Performers</h1>
          <p className="text-gray-600 mt-2">
            Identify and analyze top-performing tutors
          </p>
        </div>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 px-4 py-2">
          Top 10%
        </Badge>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="factors">Differentiating Factors</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <StarPerformerList />
          </Suspense>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <PerformerComparison />
          </Suspense>
        </TabsContent>

        <TabsContent value="factors" className="space-y-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <DifferentiatingFactors />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
