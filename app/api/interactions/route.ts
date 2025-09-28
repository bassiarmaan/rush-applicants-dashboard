import { NextRequest, NextResponse } from 'next/server'
import { AirtableAPI } from '@/lib/airtable'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const applicantId = searchParams.get('applicantId')

    const airtable = new AirtableAPI()
    const interactions = await airtable.getInteractions(applicantId || undefined)
    
    return NextResponse.json(interactions)
  } catch (error) {
    console.error('Error fetching interactions:', error)
    return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const interaction = await request.json()
    const airtable = new AirtableAPI()
    const newInteraction = await airtable.createInteraction(interaction)
    
    return NextResponse.json(newInteraction)
  } catch (error) {
    console.error('Error creating interaction:', error)
    return NextResponse.json({ error: 'Failed to create interaction' }, { status: 500 })
  }
}
