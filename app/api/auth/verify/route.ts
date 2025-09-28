import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const isValid = verifyToken(token)
    
    if (!isValid) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ authenticated: true })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
