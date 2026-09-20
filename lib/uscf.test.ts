import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatName, fetchUscfPlayer } from './uscf'

function mockFetchOnce(body: unknown, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      json: () => Promise.resolve(body),
    })
  )
}

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

describe('fetchUscfPlayer', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns a formatted player for a normal response', async () => {
    mockFetchOnce({ name: 'SMITH,JOHN', rating: 1500 })
    await expect(fetchUscfPlayer('12345678')).resolves.toEqual({
      id: '12345678',
      name: 'JOHN SMITH',
      regular: 1500,
    })
  })

  it('returns null when the upstream response is not ok', async () => {
    mockFetchOnce({ name: 'SMITH,JOHN', rating: 1500 }, false)
    await expect(fetchUscfPlayer('12345678')).resolves.toBeNull()
  })

  it('returns null instead of throwing when name is not a string', async () => {
    // Regression case: a bare type assertion on the JSON response let a
    // non-string `name` flow into formatName(), which would throw on
    // .split() and turn a bad upstream response into an unhandled 500
    // instead of a clean "player not found".
    mockFetchOnce({ name: 12345, rating: 1500 })
    await expect(fetchUscfPlayer('12345678')).resolves.toBeNull()
  })

  it('returns null instead of silently producing a blank name for whitespace-only data', async () => {
    mockFetchOnce({ name: '   ', rating: 1500 })
    await expect(fetchUscfPlayer('12345678')).resolves.toBeNull()
  })

  it('returns null when the response body has no name field at all', async () => {
    mockFetchOnce({ rating: 1500 })
    await expect(fetchUscfPlayer('12345678')).resolves.toBeNull()
  })
})
