/**
 * Test script for new API endpoints
 * Run with: tsx scripts/test-endpoints.ts
 */

async function testEndpoints() {
  const BASE_URL = 'http://localhost:3000'
  
  console.log('🧪 Testing API Endpoints...\n')

  // Test 1: Engagement Timeline
  console.log('1️⃣ Testing /api/engagement/tutors/[tutorId]/timeline')
  try {
    const response = await fetch(`${BASE_URL}/api/engagement/tutors/TUTOR_001/timeline?limit=5`)
    const data = await response.json()
    console.log(`✅ Status: ${response.status}`)
    console.log(`   Events: ${data.events?.length || 0}`)
    console.log(`   Sample event types: ${data.events?.slice(0, 3).map((e: any) => e.eventType).join(', ')}`)
  } catch (error) {
    console.log(`❌ Error: ${error}`)
  }
  console.log('')

  // Test 2: Engagement Metrics
  console.log('2️⃣ Testing /api/engagement/metrics')
  try {
    const response = await fetch(`${BASE_URL}/api/engagement/metrics?metricType=engagement&period=30`)
    const data = await response.json()
    console.log(`✅ Status: ${response.status}`)
    console.log(`   Current value: ${data.value?.toFixed(2)}`)
    console.log(`   Previous value: ${data.previousValue?.toFixed(2)}`)
    console.log(`   Trend: ${data.trend} (${data.percentChange?.toFixed(1)}%)`)
  } catch (error) {
    console.log(`❌ Error: ${error}`)
  }
  console.log('')

  // Test 3: Heatmap
  console.log('3️⃣ Testing /api/analytics/heatmap')
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/heatmap?days=7&metricType=engagement`)
    const data = await response.json()
    console.log(`✅ Status: ${response.status}`)
    console.log(`   Data points: ${data.heatmap?.length || 0}`)
    if (data.heatmap?.length > 0) {
      console.log(`   Sample: Day ${data.heatmap[0].dayOfWeek}, Hour ${data.heatmap[0].hourOfDay}, Value: ${data.heatmap[0].value.toFixed(2)}`)
    }
  } catch (error) {
    console.log(`❌ Error: ${error}`)
  }
  console.log('')

  // Test 4: Star Performers
  console.log('4️⃣ Testing /api/analytics/performers')
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/performers`)
    const data = await response.json()
    console.log(`✅ Status: ${response.status}`)
    console.log(`   Total tutors: ${data.summary?.totalTutors}`)
    console.log(`   Star performers: ${data.summary?.starPerformers}`)
    console.log(`   Average performers: ${data.summary?.avgPerformers}`)
    console.log(`   Lagging performers: ${data.summary?.laggingPerformers}`)
    console.log(`   Differentiating factors: ${data.differentiatingFactors?.length}`)
    if (data.differentiatingFactors?.length > 0) {
      console.log(`   Top factor: ${data.differentiatingFactors[0].metric} (${data.differentiatingFactors[0].significance})`)
    }
  } catch (error) {
    console.log(`❌ Error: ${error}`)
  }
  console.log('')

  // Test 5: First Sessions
  console.log('5️⃣ Testing /api/analytics/first-sessions')
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/first-sessions`)
    const data = await response.json()
    console.log(`✅ Status: ${response.status}`)
    console.log(`   Overall population: ${data.overallPopulation?.count}`)
    console.log(`   Poor first sessions: ${data.poorFirstSessionCohort?.count}`)
    console.log(`   Comparisons: ${data.comparisons?.length}`)
    console.log(`   Recommendations: ${data.recommendations?.length}`)
    if (data.comparisons?.length > 0) {
      console.log(`   Top comparison: ${data.comparisons[0].metric} (${data.comparisons[0].significance})`)
    }
  } catch (error) {
    console.log(`❌ Error: ${error}`)
  }
  console.log('')

  console.log('✨ Endpoint testing complete!\n')
}

// Run tests
testEndpoints().catch(console.error)

