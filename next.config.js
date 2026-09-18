// No third-party scripts, fonts, or images anywhere in the app (see
// app/globals.css and app/layout.tsx), so a same-origin CSP needs no
// allowlisted domains. 'unsafe-inline' on script/style is required
// because Next.js injects inline hydration/RSC bootstrap scripts; a
// stricter nonce-based CSP would require forcing every page into dynamic
// rendering (see next.config.js docs "Content Security Policy" ->
// Nonces), which isn't worth the caching/perf tradeoff for this app.
const isDev = process.env.NODE_ENV === 'development'
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\n/g, '')
  .trim()

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
