import { NextRequest, NextResponse } from 'next/server'
import { AirtableAPI } from '@/lib/airtable'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: Fetching applicants from Airtable...')
    const airtable = new AirtableAPI()
    const applicants = await airtable.getApplicants()
    
    console.log(`API: Returning ${applicants.length} applicants to frontend`)
    console.log('API: Sample applicant names:', applicants.slice(0, 3).map(a => a.applicant_name))
    
    // Add cache-busting headers
    const response = NextResponse.json(applicants)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error fetching applicants:', error)
    return NextResponse.json({ error: 'Failed to fetch applicants' }, { status: 500 })
  }
}
