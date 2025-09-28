import { NextRequest, NextResponse } from 'next/server'
import { AirtableAPI } from '@/lib/airtable'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const airtable = new AirtableAPI()
    const applicants = await airtable.getApplicants()
    
    return NextResponse.json(applicants)
  } catch (error) {
    console.error('Error fetching applicants:', error)
    return NextResponse.json({ error: 'Failed to fetch applicants' }, { status: 500 })
  }
}
