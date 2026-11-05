import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV !== 'production'

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    // autoplay=* so embed iframes can start after a user gesture
    value: 'camera=(), microphone=(), geolocation=(), payment=(), autoplay=*',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // SoundCloud Widget API was missing — blocked SC playback under CSP
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com https://w.soundcloud.com https://widget.soundcloud.com",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://open.spotify.com https://w.soundcloud.com https://embed.music.apple.com",
      `img-src 'self' data: blob: https:${isDev ? ' http://127.0.0.1:54321' : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      `connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://www.youtube.com https://*.googlevideo.com https://w.soundcloud.com https://api.soundcloud.com https://*.soundcloud.com https://open.spotify.com https://*.spotify.com${isDev ? ' http://127.0.0.1:54321 ws://127.0.0.1:54321' : ''}`,
      "media-src 'self' https: blob:",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'i1.sndcdn.com' },
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: 'mosaic.scdn.co' },
      { protocol: 'https', hostname: 'image-cdn-ak.spotifycdn.com' },
      { protocol: 'https', hostname: 'image-cdn-fa.spotifycdn.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      ...(isDev ? [{ protocol: 'http' as const, hostname: '127.0.0.1' }] : []),
    ],
  },
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig
