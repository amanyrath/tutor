import { prisma } from '@/lib/db'
import { ChurnRiskTable } from '@/components/dashboard/churn-risk-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Radio } from 'lucide-react'

async function getTutors() {
  try {
    const tutors = await prisma.tutor.findMany({
      where: {
        activeStatus: true,
      },
      include: {
        aggregates: true,
      },
      take: 100, // Get top 100 tutors
    })

    // Sort by churn probability in memory
    tutors.sort((a, b) => {
      const probA = a.aggregates?.churnProbability ?? 0
      const probB = b.aggregates?.churnProbability ?? 0
      return probB - probA
    })

    return tutors
  } catch (error) {
    console.error('Error fetching tutors:', error)
    return []
  }
}

export default async function TutorsPage() {
  const tutors = await getTutors()

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-gradient-to-r from-[#0f1419] to-[#1a2332]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Radio className="h-6 w-6 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-cyan-400 tracking-tight font-mono">
                TUTOR DIRECTORY
              </h1>
              <p className="text-gray-400 mt-1 font-mono text-sm">
                Active tutors ranked by churn risk
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="bg-[#1a1f2e] border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400 font-mono">CHURN RISK PRIORITY TABLE</CardTitle>
            <CardDescription className="text-gray-400">
              All active tutors sorted by churn probability. Click any row to view details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tutors.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No tutors found</p>
              </div>
            ) : (
              <ChurnRiskTable initialTutors={tutors} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

