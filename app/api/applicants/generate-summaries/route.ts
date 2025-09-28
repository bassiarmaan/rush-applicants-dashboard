import { NextRequest, NextResponse } from 'next/server'
import { AirtableAPI } from '@/lib/airtable'
import { PerplexityAPI } from '@/lib/perplexity'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const airtable = new AirtableAPI()
    const perplexity = new PerplexityAPI()

    // Get all applicants
    const applicants = await airtable.getApplicants()
    const results = []

    for (const applicant of applicants) {
      try {
        // Get all interactions/notes for this applicant
        const interactions = await airtable.getInteractions(applicant.id)
        const notes = interactions.map(interaction => interaction.note).filter(Boolean)

        if (notes.length > 0) {
          // Generate AI summary
          const summary = await perplexity.generateSummary(notes)

          // Update applicant with the summary
          await airtable.updateApplicant(applicant.id, {
            notes_summary: summary
          })

          results.push({
            applicant_id: applicant.id,
            applicant_name: applicant.applicant_name,
            summary,
            success: true
          })
        } else {
          results.push({
            applicant_id: applicant.id,
            applicant_name: applicant.applicant_name,
            summary: "No notes available for this applicant.",
            success: true
          })
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error processing applicant ${applicant.id}:`, error)
        results.push({
          applicant_id: applicant.id,
          applicant_name: applicant.applicant_name,
          summary: "Error generating summary.",
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      total: results.length,
      successful: results.filter(r => r.success).length
    })
  } catch (error) {
    console.error('Error generating summaries:', error)
    return NextResponse.json({ error: 'Failed to generate summaries' }, { status: 500 })
  }
}
