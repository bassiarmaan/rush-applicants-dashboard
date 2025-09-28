import { NextRequest, NextResponse } from 'next/server'
import { AirtableAPI } from '@/lib/airtable'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Airtable connection...')
    
    // Check environment variables first
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        hasApiKey: !!process.env.AIRTABLE_API_KEY,
        hasBaseId: !!process.env.AIRTABLE_BASE_ID
      }, { status: 500 })
    }

    // Try to connect to Airtable
    const airtable = new AirtableAPI()
    const applicants = await airtable.getApplicants()
    
    return NextResponse.json({
      success: true,
      message: 'Airtable connection successful',
      applicantCount: applicants.length,
      sampleApplicants: applicants.slice(0, 2).map(a => ({
        id: a.id,
        name: a.applicant_name,
        email: a.email
      }))
    })
  } catch (error) {
    console.error('Airtable test failed:', error)
    return NextResponse.json({ 
      error: 'Airtable connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
