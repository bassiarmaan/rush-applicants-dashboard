import { NextRequest, NextResponse } from 'next/server'
import { AirtableAPI } from '@/lib/airtable'
import { PerplexityAPI } from '@/lib/perplexity'
import { verifyToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const airtable = new AirtableAPI()
    const perplexity = new PerplexityAPI()

    // Get applicant data
    const applicant = await airtable.getApplicantById(params.id)
    if (!applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    // Get all interactions/notes for this applicant
    const interactions = await airtable.getInteractions(params.id)
    const notes = interactions.map(interaction => interaction.note).filter(Boolean)

    // Generate AI summary
    const summary = await perplexity.generateSummary(notes)

    // Update applicant with the summary
    const updatedApplicant = await airtable.updateApplicant(params.id, {
      notes_summary: summary
    })

    return NextResponse.json({ 
      success: true, 
      summary,
      applicant: updatedApplicant 
    })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
