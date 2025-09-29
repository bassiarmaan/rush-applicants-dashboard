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

    console.log('FORCE REFRESH: Fetching fresh data from Airtable...')
    
    // Force a fresh fetch from Airtable
    const airtable = new AirtableAPI()
    const applicants = await airtable.getApplicants()
    
    // Sort by creation date to see newest first
    const sortedApplicants = applicants.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    console.log(`FORCE REFRESH: Found ${applicants.length} total applicants`)
    console.log('FORCE REFRESH: Newest 3 applicants:', sortedApplicants.slice(0, 3).map(a => ({
      name: a.applicant_name,
      created: a.created_at,
      has_elo: !!a.elo,
      elo: a.elo
    })))
    
    // Return with aggressive cache-busting
    const response = NextResponse.json({
      applicants: sortedApplicants,
      total: applicants.length,
      newest: sortedApplicants.slice(0, 3),
      timestamp: new Date().toISOString()
    })
    
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Last-Modified', new Date().toUTCString())
    
    return response
  } catch (error) {
    console.error('FORCE REFRESH: Error:', error)
    return NextResponse.json({ 
      error: 'Force refresh failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
