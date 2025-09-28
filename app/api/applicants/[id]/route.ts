import { NextRequest, NextResponse } from 'next/server'
import { AirtableAPI } from '@/lib/airtable'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const airtable = new AirtableAPI()
    const applicant = await airtable.getApplicantById(params.id)
    
    if (!applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }
    
    return NextResponse.json(applicant)
  } catch (error) {
    console.error('Error fetching applicant:', error)
    return NextResponse.json({ error: 'Failed to fetch applicant' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    const airtable = new AirtableAPI()
    const updatedApplicant = await airtable.updateApplicant(params.id, updates)
    
    return NextResponse.json(updatedApplicant)
  } catch (error) {
    console.error('Error updating applicant:', error)
    return NextResponse.json({ error: 'Failed to update applicant' }, { status: 500 })
  }
}
