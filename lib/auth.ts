import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'rush2025admin'

export interface AuthUser {
  id: string
  isAuthenticated: boolean
}

export function generateToken(): string {
  return jwt.sign({ authenticated: true }, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function verifyPassword(password: string): Promise<boolean> {
  // For simplicity, we'll use a plain text comparison
  // In production, you should hash the password and compare hashes
  return password === DASHBOARD_PASSWORD
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword)
}
