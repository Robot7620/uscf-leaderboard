import { describe, it, expect } from 'vitest'
import { parseJsonBody } from './api-error'

function requestWithBody(rawBody: string) {
  return new Request('http://localhost/api/test', { method: 'POST', body: rawBody })
}

describe('parseJsonBody', () => {
  it('returns the parsed object for a normal JSON body', async () => {
    const body = await parseJsonBody(requestWithBody('{"username":"bob"}'))
    expect(body).toEqual({ username: 'bob' })
  })

  it('returns null for invalid JSON instead of throwing', async () => {
    // Regression case: request.json() throwing on malformed JSON was only
    // caught by the route's generic catch block, turning a bad request
    // into an opaque 500 instead of a clean 400.
    const body = await parseJsonBody(requestWithBody('not valid json'))
    expect(body).toBeNull()
  })

  it('returns null for a bare JSON null body', async () => {
    // Regression case: `const { password } = body` throws a TypeError
    // when body is null, since valid JSON can be the literal `null`.
    const body = await parseJsonBody(requestWithBody('null'))
    expect(body).toBeNull()
  })

  it('returns null for a JSON array', async () => {
    const body = await parseJsonBody(requestWithBody('[1,2,3]'))
    expect(body).toBeNull()
  })

  it('returns null for a bare JSON string or number', async () => {
    expect(await parseJsonBody(requestWithBody('"just a string"'))).toBeNull()
    expect(await parseJsonBody(requestWithBody('42'))).toBeNull()
  })
})
