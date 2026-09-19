import { describe, it, expect } from 'vitest'
import { formatName } from './uscf'

describe('formatName', () => {
  it('reformats "LAST,FIRST" to "First Last"', () => {
    expect(formatName('SMITH,JOHN')).toBe('JOHN SMITH')
  })

  it('reformats "LAST,FIRST MIDDLE" to "First Middle Last"', () => {
    expect(formatName('SMITH,JOHN MICHAEL')).toBe('JOHN MICHAEL SMITH')
  })

  it('trims stray whitespace around the comma', () => {
    expect(formatName('  SMITH ,  JOHN  ')).toBe('JOHN SMITH')
  })

  it('returns a single-part name unchanged (no comma present)', () => {
    expect(formatName('MADONNA')).toBe('MADONNA')
  })

  it('preserves a suffix after a second comma instead of dropping it', () => {
    // This was the actual bug: the old implementation destructured only
    // the first two comma-separated parts, silently discarding "JR".
    expect(formatName('GARCIA,JUAN,JR')).toBe('JUAN GARCIA JR')
  })

  it('preserves multiple trailing parts after additional commas', () => {
    expect(formatName('GARCIA,JUAN,JR,III')).toBe('JUAN GARCIA JR III')
  })

  it('preserves a suffix even when the first-name field is blank', () => {
    // Regression case: branching on "is the first name empty" instead of
    // "is there a comma at all" silently dropped the suffix here too.
    expect(formatName('SMITH,,JR')).toBe('SMITH JR')
  })
})
