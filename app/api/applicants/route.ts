import { NextRequest, NextResponse } from 'next/server'
import { AirtableAPI } from '@/lib/airtable'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get filter parameters from URL
    const { searchParams } = new URL(request.url)
    const filterByFormula = searchParams.get('filterByFormula') || undefined

    console.log('API: Fetching applicants from Airtable...')
    console.log('API: Filter formula:', filterByFormula)
    console.log('API: Environment check:', {
      hasApiKey: !!process.env.AIRTABLE_API_KEY,
      hasBaseId: !!process.env.AIRTABLE_BASE_ID,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    })
    
    const airtable = new AirtableAPI()
    const applicants = await airtable.getApplicants(filterByFormula)
    
    console.log(`API: Returning ${applicants.length} applicants to frontend`)
    console.log('API: Sample applicant names:', applicants.slice(0, 3).map(a => a.applicant_name))
    
    // Log ELO and weight statistics
    const eloCount = applicants.filter(a => a.elo !== undefined && a.elo !== null).length
    const weightCount = applicants.filter(a => a.weight !== undefined && a.weight !== null).length
    console.log(`API: ELO ratings found: ${eloCount}/${applicants.length}`)
    console.log(`API: Weight values found: ${weightCount}/${applicants.length}`)
    
    // Add comprehensive cache-busting headers
    const response = NextResponse.json(applicants)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Last-Modified', new Date().toUTCString())
    response.headers.set('ETag', `"${Date.now()}-${Math.random()}"`)
    
    return response
  } catch (error) {
    console.error('Error fetching applicants:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch applicants',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
