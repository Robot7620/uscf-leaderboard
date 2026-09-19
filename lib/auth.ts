import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import { sql } from './db'

const SESSION_SECRET = process.env.SESSION_SECRET
if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is not set')
}

const secret = new TextEncoder().encode(SESSION_SECRET)
const SESSION_COOKIE_NAME = 'uscf_session'
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

export interface SessionPayload extends JWTPayload {
  userId: string
  username: string
  uscfId: string
}

export interface User {
  id: string
  username: string
  uscf_id: string
  uscf_verified: boolean
  created_at: string
}

const PASSWORD_MIN_LENGTH = 8
// bcrypt only looks at the first 72 bytes of its input and silently
// ignores the rest, so without this check two passwords that only differ
// after byte 72 would hash identically and a user could believe a much
// longer password was in effect than actually was.
const PASSWORD_MAX_BYTES = 72

// Returns an error message if the password fails policy, or null if it's fine.
export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  }
  if (Buffer.byteLength(password, 'utf8') > PASSWORD_MAX_BYTES) {
    return `Password must be ${PASSWORD_MAX_BYTES} bytes or fewer (bcrypt, which we use to hash passwords, ignores anything past that)`
  }
  return null
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verify a password against a hash
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Create a signed JWT session token
export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

// Verify and decode a session token
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as SessionPayload
  } catch {
    return null
  }
}

// Set session cookie
export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSession(payload)
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

// Clear session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Get current user from session cookie (server-side only)
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  const session = await verifySession(token)
  if (!session) {
    return null
  }

  // Fetch fresh user data from database
  const users = await sql<User[]>`
    SELECT id, username, uscf_id, uscf_verified, created_at
    FROM users
    WHERE id = ${session.userId}
    LIMIT 1
  `

  return users[0] || null
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

// Require authentication (throws if not logged in)
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new UnauthorizedError()
  }
  return user
}
