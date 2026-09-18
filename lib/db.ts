import fs from 'fs'
import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Supabase's pooler requires TLS; local Postgres instances often don't
// support it at all, so we only ask for it in production. Passing the
// string 'require' encrypts the connection but skips certificate
// verification (postgres.js sets rejectUnauthorized: false for it), so an
// attacker on the network path could still MITM with a forged cert. Real
// verification needs Supabase's root CA explicitly - it doesn't chain to
// anything in Node's default trust store. See SETUP.md "Verifying the
// database certificate".
function resolveSsl(): 'prefer' | 'require' | { rejectUnauthorized: true; ca: string } {
  if (process.env.NODE_ENV !== 'production') {
    return 'prefer'
  }

  const ca =
    process.env.DATABASE_CA_CERT ||
    (process.env.DATABASE_CA_CERT_PATH
      ? fs.readFileSync(process.env.DATABASE_CA_CERT_PATH, 'utf-8')
      : undefined)

  if (!ca) {
    console.warn(
      '[db] DATABASE_CA_CERT/DATABASE_CA_CERT_PATH not set - connecting with ' +
        "ssl: 'require', which encrypts the connection but does not verify " +
        'the server certificate. See SETUP.md "Verifying the database ' +
        'certificate" to close this gap.'
    )
    return 'require'
  }

  return { rejectUnauthorized: true, ca }
}

// Create postgres client. This is scoped to this connection only - unlike
// NODE_TLS_REJECT_UNAUTHORIZED, it doesn't weaken every other outbound
// HTTPS call this process makes.
export const sql = postgres(databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: resolveSsl(),
})
