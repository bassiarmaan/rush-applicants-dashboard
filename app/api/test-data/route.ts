import { NextRequest, NextResponse } from 'next/server'
import { AirtableAPI } from '@/lib/airtable'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing data fetch from Airtable...')
    
    const airtable = new AirtableAPI()
    const applicants = await airtable.getApplicants()
    
    // Check what fields are actually available
    const sampleApplicant = applicants[0]
    const availableFields = sampleApplicant ? Object.keys(sampleApplicant) : []
    
    return NextResponse.json({
      success: true,
      totalApplicants: applicants.length,
      sampleApplicant: sampleApplicant,
      availableFields: availableFields,
      hasElo: applicants.some(a => a.elo !== undefined),
      hasWeight: applicants.some(a => a.weight !== undefined),
      eloApplicants: applicants.filter(a => a.elo !== undefined).length,
      weightApplicants: applicants.filter(a => a.weight !== undefined).length
    })
  } catch (error) {
    console.error('Data test failed:', error)
    return NextResponse.json({ 
      error: 'Data test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
