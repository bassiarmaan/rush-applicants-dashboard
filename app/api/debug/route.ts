import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are available
    const envCheck = {
      hasAirtableApiKey: !!process.env.AIRTABLE_API_KEY,
      hasAirtableBaseId: !!process.env.AIRTABLE_BASE_ID,
      hasDashboardPassword: !!process.env.DASHBOARD_PASSWORD,
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    }

    // Don't expose actual values, just check if they exist
    return NextResponse.json({
      message: 'Environment variables check',
      environment: envCheck,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug check failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
