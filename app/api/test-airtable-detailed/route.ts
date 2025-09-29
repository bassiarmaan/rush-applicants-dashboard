import { NextRequest, NextResponse } from 'next/server'
import { AirtableAPI } from '@/lib/airtable'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing detailed Airtable connection...')
    
    // Check environment variables first
    const envCheck = {
      hasApiKey: !!process.env.AIRTABLE_API_KEY,
      hasBaseId: !!process.env.AIRTABLE_BASE_ID,
      apiKeyLength: process.env.AIRTABLE_API_KEY?.length || 0,
      baseIdLength: process.env.AIRTABLE_BASE_ID?.length || 0
    }
    
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        envCheck
      }, { status: 500 })
    }

    // Test Airtable connection
    const airtable = new AirtableAPI()
    const applicants = await airtable.getApplicants()
    
    // Get the most recent applicants
    const sortedApplicants = applicants.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    const recentApplicants = sortedApplicants.slice(0, 5)
    
    return NextResponse.json({
      success: true,
      totalApplicants: applicants.length,
      recentApplicants: recentApplicants.map(a => ({
        id: a.id,
        name: a.applicant_name,
        email: a.email,
        created_at: a.created_at,
        has_elo: !!a.elo,
        has_weight: !!a.weight,
        elo: a.elo,
        weight: a.weight
      })),
      envCheck,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Detailed Airtable test failed:', error)
    return NextResponse.json({ 
      error: 'Airtable connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
