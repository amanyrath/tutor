import { prisma } from '../lib/db'
import { parse } from 'csv-parse/sync'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { Prisma } from '@prisma/client'

interface TutorRow {
  tutor_id: string
  months_experience: string
  total_sessions_completed: string
  avg_historical_rating: string
  subjects_taught: string
  primary_subject: string
  reschedule_rate: string
  no_show_count: string
  reliability_score: string
  certification_level: string
  active_status: string
}

interface SessionRow {
  session_id: string
  tutor_id: string
  session_datetime: string
  scheduled_duration_min: string
  actual_duration_min: string
  subject: string
  grade_level: string
  is_first_session: string
  session_completed: string
  student_showed: string
  tutor_showed: string
  connection_quality: string
  had_technical_issues: string
  student_attention_pct: string
  tutor_camera_on_pct: string
  tutor_speak_ratio: string
  screen_share_pct: string
  overall_sentiment: string
  student_sentiment: string
  tutor_sentiment: string
  empathy_score: string
  clarity_score: string
  engagement_score: string
  student_rating: string
  student_satisfaction: string
  would_recommend: string
}

interface TutorAggregateRow {
  tutor_id: string
  total_sessions_30d: string
  total_sessions_7d: string
  avg_rating_30d: string
  avg_rating_7d: string
  avg_engagement_score: string
  avg_empathy_score: string
  avg_clarity_score: string
  avg_student_satisfaction: string
  first_session_count: string
  first_session_avg_rating: string
  poor_first_session_flag: string
  recommendation_rate: string
  technical_issue_rate: string
  sentiment_trend_7d: string
  churn_probability: string
  churn_risk_level: string
  churn_signals_detected: string
}

function parseBoolean(value: string | null | undefined): boolean | null {
  if (!value || value === '' || value === 'None' || value === 'null') return null
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim()
    return lower === 'true' || lower === '1' || lower === 'yes'
  }
  return Boolean(value)
}

function parseFloatValue(value: string | null | undefined): number | null {
  if (!value || value === '' || value === 'None' || value === 'null') return null
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? null : parsed
}

function parseIntValue(value: string | null | undefined): number | null {
  if (!value || value === '' || value === 'None' || value === 'null') return null
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value || value === '' || value === 'None' || value === 'null') return null
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date
}

function parseJSON(value: string | null | undefined): any {
  if (!value || value === '' || value === 'None' || value === 'null') return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

async function importTutors(dataDir: string) {
  console.log('📝 Importing tutors...')
  const filePath = join(dataDir, 'tutor_profiles.csv')
  const fileContent = readFileSync(filePath, 'utf-8')
  
  const records: TutorRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  })

  console.log(`   Found ${records.length} tutors`)

  const tutors = records.map((row) => ({
    tutorId: row.tutor_id,
    monthsExperience: parseIntValue(row.months_experience) ?? 0,
    totalSessions: parseIntValue(row.total_sessions_completed) ?? 0,
    avgHistoricalRating: parseFloatValue(row.avg_historical_rating) ?? 0,
    subjectsTaught: row.subjects_taught || '',
    primarySubject: row.primary_subject || '',
    rescheduleRate: parseFloatValue(row.reschedule_rate) ?? 0,
    noShowCount: parseIntValue(row.no_show_count) ?? 0,
    reliabilityScore: parseFloatValue(row.reliability_score) ?? 0,
    certificationLevel: row.certification_level || 'Basic',
    activeStatus: parseBoolean(row.active_status) ?? true,
    lastLogin: parseDate((row as any).last_login),
  }))

  // Use createMany for batch insert (faster)
  const BATCH_SIZE = 1000
  let imported = 0

  for (let i = 0; i < tutors.length; i += BATCH_SIZE) {
    const batch = tutors.slice(i, i + BATCH_SIZE)
    await prisma.tutor.createMany({
      data: batch,
      skipDuplicates: true,
    })
    imported += batch.length
    process.stdout.write(`\r   Imported ${imported}/${tutors.length} tutors`)
  }
  console.log('\n   ✓ Tutors imported successfully')
  
  return tutors.length
}

async function importSessions(dataDir: string) {
  console.log('📚 Importing sessions...')
  const filePath = join(dataDir, 'sessions.csv')
  const fileContent = readFileSync(filePath, 'utf-8')
  
  const records: SessionRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  })

  console.log(`   Found ${records.length} sessions`)

  const sessions = records.map((row) => {
    const sessionData: Prisma.SessionCreateInput = {
      sessionId: row.session_id,
      tutor: { connect: { tutorId: row.tutor_id } },
      sessionDatetime: parseDate(row.session_datetime) ?? new Date(),
      scheduledDuration: parseIntValue(row.scheduled_duration_min) ?? 60,
      actualDuration: parseIntValue(row.actual_duration_min) ?? 60,
      subject: row.subject || '',
      gradeLevel: row.grade_level || '',
      isFirstSession: parseBoolean(row.is_first_session),
      sessionCompleted: parseBoolean(row.session_completed) ?? false,
      studentShowed: parseBoolean(row.student_showed) ?? false,
      tutorShowed: parseBoolean(row.tutor_showed) ?? false,
      connectionQuality: row.connection_quality || 'Good',
      hadTechnicalIssues: parseBoolean(row.had_technical_issues),
      studentAttentionPct: parseFloatValue(row.student_attention_pct),
      tutorCameraOnPct: parseFloatValue(row.tutor_camera_on_pct),
      tutorSpeakRatio: parseFloatValue(row.tutor_speak_ratio),
      screenSharePct: parseFloatValue(row.screen_share_pct),
      overallSentiment: parseFloatValue(row.overall_sentiment),
      studentSentiment: parseFloatValue(row.student_sentiment),
      tutorSentiment: parseFloatValue(row.tutor_sentiment),
      empathyScore: parseFloatValue(row.empathy_score),
      clarityScore: parseFloatValue(row.clarity_score),
      engagementScore: parseFloatValue(row.engagement_score),
      studentRating: parseFloatValue(row.student_rating),
      studentSatisfaction: parseFloatValue(row.student_satisfaction),
      wouldRecommend: parseBoolean(row.would_recommend),
    }
    return sessionData
  })

  // Sessions need to be created individually due to relation
  // But we can batch the creates for better performance
  const BATCH_SIZE = 500
  let imported = 0
  let errors = 0

  for (let i = 0; i < sessions.length; i += BATCH_SIZE) {
    const batch = sessions.slice(i, i + BATCH_SIZE)
    
    // Use Promise.allSettled to continue on errors
    const results = await Promise.allSettled(
      batch.map((session) => prisma.session.create({ data: session }))
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    imported += successful
    errors += results.length - successful

    process.stdout.write(`\r   Imported ${imported}/${sessions.length} sessions (${errors} errors)`)
  }
  console.log('\n   ✓ Sessions imported successfully')
  
  return { imported, errors }
}

async function importTutorAggregates(dataDir: string) {
  console.log('📊 Importing tutor aggregates...')
  const filePath = join(dataDir, 'tutor_aggregates.csv')
  const fileContent = readFileSync(filePath, 'utf-8')
  
  const records: TutorAggregateRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  })

  console.log(`   Found ${records.length} tutor aggregates`)

  const aggregates = records.map((row) => ({
    tutor: { connect: { tutorId: row.tutor_id } },
    totalSessions30d: parseIntValue(row.total_sessions_30d) ?? 0,
    totalSessions7d: parseIntValue(row.total_sessions_7d) ?? 0,
    avgRating30d: parseFloatValue(row.avg_rating_30d) ?? 0,
    avgRating7d: parseFloatValue(row.avg_rating_7d),
    avgEngagementScore: parseFloatValue(row.avg_engagement_score) ?? 0,
    avgEmpathyScore: parseFloatValue(row.avg_empathy_score) ?? 0,
    avgClarityScore: parseFloatValue(row.avg_clarity_score) ?? 0,
    avgStudentSatisfaction: parseFloatValue(row.avg_student_satisfaction) ?? 0,
    firstSessionCount: parseIntValue(row.first_session_count) ?? 0,
    firstSessionAvgRating: parseFloatValue(row.first_session_avg_rating),
    poorFirstSessionFlag: parseBoolean(row.poor_first_session_flag) ?? false,
    recommendationRate: parseFloatValue(row.recommendation_rate) ?? 0,
    technicalIssueRate: parseFloatValue(row.technical_issue_rate) ?? 0,
    sentimentTrend7d: parseFloatValue(row.sentiment_trend_7d),
    churnProbability: parseFloatValue(row.churn_probability) ?? 0,
    churnRiskLevel: row.churn_risk_level || 'Low',
    churnSignalsDetected: parseIntValue(row.churn_signals_detected) ?? 0,
  }))

  // Use individual creates due to relation
  const BATCH_SIZE = 500
  let imported = 0
  let errors = 0

  for (let i = 0; i < aggregates.length; i += BATCH_SIZE) {
    const batch = aggregates.slice(i, i + BATCH_SIZE)
    
    const results = await Promise.allSettled(
      batch.map((agg) => prisma.tutorAggregate.create({ data: agg }))
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    imported += successful
    errors += results.length - successful

    process.stdout.write(`\r   Imported ${imported}/${aggregates.length} aggregates (${errors} errors)`)
  }
  console.log('\n   ✓ Tutor aggregates imported successfully')
  
  return { imported, errors }
}

async function importEngagementEvents(dataDir: string) {
  console.log('📱 Importing engagement events...')
  const filePath = join(dataDir, 'engagement_events.csv')
  
  if (!existsSync(filePath)) {
    console.log('   ⚠️  engagement_events.csv not found, skipping')
    return { imported: 0, errors: 0 }
  }
  
  const fileContent = readFileSync(filePath, 'utf-8')
  
  const records: any[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  })

  console.log(`   Found ${records.length} engagement events`)

  const events = records.map((row) => ({
    tutor: { connect: { tutorId: row.tutor_id } },
    eventType: row.event_type || '',
    eventData: parseJSON(row.event_data),
    timestamp: parseDate(row.timestamp) ?? new Date(),
  }))

  const BATCH_SIZE = 1000
  let imported = 0
  let errors = 0

  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE)
    
    const results = await Promise.allSettled(
      batch.map((event) => prisma.engagementEvent.create({ data: event }))
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    imported += successful
    errors += results.length - successful

    process.stdout.write(`\r   Imported ${imported}/${events.length} events (${errors} errors)`)
  }
  console.log('\n   ✓ Engagement events imported successfully')
  
  return { imported, errors }
}

async function importExperiments(dataDir: string) {
  console.log('🧪 Importing experiments...')
  const filePath = join(dataDir, 'experiments.csv')
  
  if (!existsSync(filePath)) {
    console.log('   ⚠️  experiments.csv not found, skipping')
    return { imported: 0, errors: 0 }
  }
  
  const fileContent = readFileSync(filePath, 'utf-8')
  
  const records: any[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  })

  console.log(`   Found ${records.length} experiments`)

  const experiments = records.map((row) => ({
    id: row.experiment_id || undefined,
    name: row.name || '',
    hypothesis: row.hypothesis || '',
    description: row.description || null,
    variants: parseJSON(row.variants) || [],
    targetSegment: parseJSON(row.target_segment),
    primaryMetric: row.primary_metric || '',
    secondaryMetrics: parseJSON(row.secondary_metrics),
    startDate: parseDate(row.start_date) ?? new Date(),
    endDate: parseDate(row.end_date),
    status: row.status || 'draft',
    sampleSize: parseIntValue(row.sample_size),
    significance: parseFloatValue(row.significance),
    winner: row.winner || null,
    notes: row.notes || null,
  }))

  const BATCH_SIZE = 100
  let imported = 0
  let errors = 0

  for (let i = 0; i < experiments.length; i += BATCH_SIZE) {
    const batch = experiments.slice(i, i + BATCH_SIZE)
    
    const results = await Promise.allSettled(
      batch.map((exp) => prisma.experiment.create({ data: exp }))
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    imported += successful
    errors += results.length - successful

    process.stdout.write(`\r   Imported ${imported}/${experiments.length} experiments (${errors} errors)`)
  }
  console.log('\n   ✓ Experiments imported successfully')
  
  return { imported, errors }
}

async function importExperimentAssignments(dataDir: string) {
  console.log('📋 Importing experiment assignments...')
  const filePath = join(dataDir, 'experiment_assignments.csv')
  
  if (!existsSync(filePath)) {
    console.log('   ⚠️  experiment_assignments.csv not found, skipping')
    return { imported: 0, errors: 0 }
  }
  
  const fileContent = readFileSync(filePath, 'utf-8')
  
  const records: any[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  })

  console.log(`   Found ${records.length} experiment assignments`)

  const assignments = records.map((row) => ({
    experiment: { connect: { id: row.experiment_id } },
    tutor: { connect: { tutorId: row.tutor_id } },
    variant: row.variant || 'control',
    assignedAt: parseDate(row.assigned_at) ?? new Date(),
    exposedAt: parseDate(row.exposed_at),
    convertedAt: parseDate(row.converted_at),
    conversionValue: parseFloatValue(row.conversion_value),
  }))

  const BATCH_SIZE = 500
  let imported = 0
  let errors = 0

  for (let i = 0; i < assignments.length; i += BATCH_SIZE) {
    const batch = assignments.slice(i, i + BATCH_SIZE)
    
    const results = await Promise.allSettled(
      batch.map((assignment) => prisma.experimentAssignment.create({ data: assignment }))
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    imported += successful
    errors += results.length - successful

    process.stdout.write(`\r   Imported ${imported}/${assignments.length} assignments (${errors} errors)`)
  }
  console.log('\n   ✓ Experiment assignments imported successfully')
  
  return { imported, errors }
}

async function importInterventions(dataDir: string) {
  console.log('💌 Importing interventions...')
  const filePath = join(dataDir, 'interventions.csv')
  
  if (!existsSync(filePath)) {
    console.log('   ⚠️  interventions.csv not found, skipping')
    return { imported: 0, errors: 0 }
  }
  
  const fileContent = readFileSync(filePath, 'utf-8')
  
  const records: any[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  })

  console.log(`   Found ${records.length} interventions`)

  const interventions = records.map((row) => ({
    id: row.intervention_id || undefined,
    tutor: { connect: { tutorId: row.tutor_id } },
    interventionType: row.intervention_type || '',
    channel: row.channel || 'email',
    subject: row.subject || null,
    content: row.content || '',
    templateId: row.template_id || null,
    experimentId: row.experiment_id || null,
    experimentVariant: row.experiment_variant || null,
    sentAt: parseDate(row.sent_at),
    deliveredAt: parseDate(row.delivered_at),
    openedAt: parseDate(row.opened_at),
    clickedAt: parseDate(row.clicked_at),
    respondedAt: parseDate(row.responded_at),
    responseType: row.response_type || null,
    responseNotes: row.response_notes || null,
    engagementBefore: parseFloatValue(row.engagement_before),
    engagementAfter: parseFloatValue(row.engagement_after),
    sessionsBeforeCount: parseIntValue(row.sessions_before_count),
    sessionsAfterCount: parseIntValue(row.sessions_after_count),
    status: row.status || 'pending',
    errorMessage: row.error_message || null,
  }))

  const BATCH_SIZE = 500
  let imported = 0
  let errors = 0

  for (let i = 0; i < interventions.length; i += BATCH_SIZE) {
    const batch = interventions.slice(i, i + BATCH_SIZE)
    
    const results = await Promise.allSettled(
      batch.map((intervention) => prisma.intervention.create({ data: intervention }))
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    imported += successful
    errors += results.length - successful

    process.stdout.write(`\r   Imported ${imported}/${interventions.length} interventions (${errors} errors)`)
  }
  console.log('\n   ✓ Interventions imported successfully')
  
  return { imported, errors }
}

async function main() {
  const args = process.argv.slice(2)
  const clearExisting = args.includes('--clear') || args.includes('-c')
  const dataDir = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-')) || 'data'

  console.log('🚀 Starting data import...')
  console.log(`   Data directory: ${dataDir}`)
  console.log(`   Clear existing: ${clearExisting}\n`)

  try {
    // Clear existing data if requested
    if (clearExisting) {
      console.log('🗑️  Clearing existing data...')
      // Delete in order: interventions -> experiment_assignments -> experiments -> 
      // engagement_events -> alerts -> aggregates -> sessions -> tutors
      await prisma.intervention.deleteMany()
      await prisma.experimentAssignment.deleteMany()
      await prisma.experiment.deleteMany()
      await prisma.engagementEvent.deleteMany()
      await prisma.alert.deleteMany()
      await prisma.tutorAggregate.deleteMany()
      await prisma.session.deleteMany()
      await prisma.tutor.deleteMany()
      console.log('   ✓ Cleared existing data\n')
    }

    // Import in order: Tutors -> Sessions -> Aggregates -> Experiments -> 
    // Experiment Assignments -> Interventions -> Engagement Events
    const tutorCount = await importTutors(dataDir)
    console.log()
    
    const sessionResult = await importSessions(dataDir)
    console.log()
    
    const aggregateResult = await importTutorAggregates(dataDir)
    console.log()
    
    const experimentResult = await importExperiments(dataDir)
    console.log()
    
    const assignmentResult = await importExperimentAssignments(dataDir)
    console.log()
    
    const interventionResult = await importInterventions(dataDir)
    console.log()
    
    const engagementEventsResult = await importEngagementEvents(dataDir)
    console.log()

    // Summary
    console.log('='.repeat(60))
    console.log('📈 IMPORT SUMMARY')
    console.log('='.repeat(60))
    console.log(`Tutors:              ${tutorCount}`)
    console.log(`Sessions:            ${sessionResult.imported} (${sessionResult.errors} errors)`)
    console.log(`Aggregates:          ${aggregateResult.imported} (${aggregateResult.errors} errors)`)
    console.log(`Experiments:         ${experimentResult.imported} (${experimentResult.errors} errors)`)
    console.log(`Experiment Assign.:  ${assignmentResult.imported} (${assignmentResult.errors} errors)`)
    console.log(`Interventions:       ${interventionResult.imported} (${interventionResult.errors} errors)`)
    console.log(`Engagement Events:   ${engagementEventsResult.imported} (${engagementEventsResult.errors} errors)`)
    console.log('='.repeat(60))
    console.log('✅ Import completed successfully!')
  } catch (error) {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

