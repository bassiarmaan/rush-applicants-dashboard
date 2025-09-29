import { NextRequest, NextResponse } from 'next/server'
import { AirtableAPI } from '@/lib/airtable'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 VERCEL DEBUG: Starting comprehensive debug check...')
    
    // 1. Environment Variables Check
    const envCheck = {
      hasAirtableApiKey: !!process.env.AIRTABLE_API_KEY,
      hasAirtableBaseId: !!process.env.AIRTABLE_BASE_ID,
      hasDashboardPassword: !!process.env.DASHBOARD_PASSWORD,
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
      airtableApiKeyLength: process.env.AIRTABLE_API_KEY?.length || 0,
      airtableBaseIdLength: process.env.AIRTABLE_BASE_ID?.length || 0
    }

    console.log('🔍 Environment check:', envCheck)

    // 2. Test Airtable Connection
    let airtableTest = null
    let applicantsData = null
    let eloWeightAnalysis = null

    if (envCheck.hasAirtableApiKey && envCheck.hasAirtableBaseId) {
      try {
        console.log('🔍 Testing Airtable connection...')
        const airtable = new AirtableAPI()
        const applicants = await airtable.getApplicants()
        
        airtableTest = {
          success: true,
          totalApplicants: applicants.length,
          sampleApplicant: applicants[0] ? {
            id: applicants[0].id,
            name: applicants[0].applicant_name,
            email: applicants[0].email,
            has_elo: !!applicants[0].elo,
            has_weight: !!applicants[0].weight,
            elo: applicants[0].elo,
            weight: applicants[0].weight,
            created_at: applicants[0].created_at
          } : null
        }

        // Analyze ELO and Weight fields
        const applicantsWithElo = applicants.filter(a => a.elo !== undefined && a.elo !== null)
        const applicantsWithWeight = applicants.filter(a => a.weight !== undefined && a.weight !== null)
        
        eloWeightAnalysis = {
          totalApplicants: applicants.length,
          applicantsWithElo: applicantsWithElo.length,
          applicantsWithWeight: applicantsWithWeight.length,
          eloRange: applicantsWithElo.length > 0 ? {
            min: Math.min(...applicantsWithElo.map(a => a.elo!)),
            max: Math.max(...applicantsWithElo.map(a => a.elo!))
          } : null,
          weightRange: applicantsWithWeight.length > 0 ? {
            min: Math.min(...applicantsWithWeight.map(a => a.weight!)),
            max: Math.max(...applicantsWithWeight.map(a => a.weight!))
          } : null,
          sampleWithElo: applicantsWithElo.slice(0, 3).map(a => ({
            name: a.applicant_name,
            elo: a.elo,
            weight: a.weight
          })),
          allFields: applicants[0] ? Object.keys(applicants[0]) : []
        }

        applicantsData = {
          total: applicants.length,
          recent: applicants
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map(a => ({
              name: a.applicant_name,
              created: a.created_at,
              has_elo: !!a.elo,
              has_weight: !!a.weight,
              elo: a.elo,
              weight: a.weight
            }))
        }

        console.log('✅ Airtable connection successful')
        console.log(`📊 Found ${applicants.length} applicants`)
        console.log(`📊 ${applicantsWithElo.length} have ELO ratings`)
        console.log(`📊 ${applicantsWithWeight.length} have weight values`)

      } catch (error) {
        console.error('❌ Airtable connection failed:', error)
        airtableTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      }
    } else {
      airtableTest = {
        success: false,
        error: 'Missing required environment variables',
        missing: {
          apiKey: !envCheck.hasAirtableApiKey,
          baseId: !envCheck.hasAirtableBaseId
        }
      }
    }

    // 3. Cache and Deployment Info
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: request.headers.get('user-agent') || 'Unknown',
      cacheControl: request.headers.get('cache-control') || 'Not set',
      ifModifiedSince: request.headers.get('if-modified-since') || 'Not set',
      etag: request.headers.get('etag') || 'Not set'
    }

    const response = NextResponse.json({
      debug: {
        environment: envCheck,
        airtable: airtableTest,
        eloWeightAnalysis,
        applicants: applicantsData,
        deployment: deploymentInfo
      },
      recommendations: generateRecommendations(envCheck, airtableTest, eloWeightAnalysis)
    })

    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Last-Modified', new Date().toUTCString())

    return response

  } catch (error) {
    console.error('❌ Debug endpoint failed:', error)
    return NextResponse.json({ 
      error: 'Debug endpoint failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

function generateRecommendations(envCheck: any, airtableTest: any, eloWeightAnalysis: any) {
  const recommendations = []

  if (!envCheck.hasAirtableApiKey || !envCheck.hasAirtableBaseId) {
    recommendations.push({
      type: 'critical',
      issue: 'Missing Environment Variables',
      solution: 'Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID in Vercel dashboard under Project Settings > Environment Variables'
    })
  }

  if (airtableTest && !airtableTest.success) {
    recommendations.push({
      type: 'critical',
      issue: 'Airtable Connection Failed',
      solution: 'Check your Airtable API key and base ID. Ensure the API key has proper permissions.'
    })
  }

  if (eloWeightAnalysis && eloWeightAnalysis.applicantsWithElo === 0) {
    recommendations.push({
      type: 'warning',
      issue: 'No ELO Ratings Found',
      solution: 'ELO ratings may not be set up in your Airtable base. Check if the "elo" field exists and has data.'
    })
  }

  if (eloWeightAnalysis && eloWeightAnalysis.applicantsWithWeight === 0) {
    recommendations.push({
      type: 'warning',
      issue: 'No Weight Values Found',
      solution: 'Weight values may not be set up in your Airtable base. Check if the "weight" field exists and has data.'
    })
  }

  if (envCheck.vercelEnv === 'production') {
    recommendations.push({
      type: 'info',
      issue: 'Production Deployment',
      solution: 'If data is not updating, try redeploying or clearing Vercel cache in the dashboard.'
    })
  }

  return recommendations
}
