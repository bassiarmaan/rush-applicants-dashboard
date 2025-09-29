import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      version: '1.0.0',
      hasEloSupport: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasAirtableApiKey: !!process.env.AIRTABLE_API_KEY,
      hasAirtableBaseId: !!process.env.AIRTABLE_BASE_ID,
      message: 'This endpoint confirms your latest code is deployed'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Version check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
