import { describe, it, expect } from 'vitest'
import { validatePassword } from './auth'

describe('validatePassword', () => {
  it('rejects passwords shorter than 8 characters', () => {
    expect(validatePassword('short1')).toMatch(/at least 8 characters/)
  })

  it('accepts a password exactly at the 8-character minimum', () => {
    expect(validatePassword('12345678')).toBeNull()
  })

  it('accepts a typical password', () => {
    expect(validatePassword('correct horse battery staple')).toBeNull()
  })

  it('accepts a password exactly at the 72-byte limit', () => {
    expect(validatePassword('a'.repeat(72))).toBeNull()
  })

  it('rejects a password one byte over the 72-byte limit', () => {
    expect(validatePassword('a'.repeat(73))).toMatch(/72 bytes or fewer/)
  })

  it('measures length in bytes, not characters, for multi-byte input', () => {
    // Each of these emoji is 4 bytes in UTF-8, so 20 of them is already
    // over the 72-byte bcrypt limit even though .length as characters
    // would suggest otherwise (this is exactly the bug the byte check
    // guards against: silent truncation a user would never notice).
    const password = '😀'.repeat(20)
    expect(Buffer.byteLength(password, 'utf8')).toBeGreaterThan(72)
    expect(validatePassword(password)).toMatch(/72 bytes or fewer/)
  })
})
