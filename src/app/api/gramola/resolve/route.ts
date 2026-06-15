import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  try {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url)
      if (videoId) {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
        if (oembedRes.ok) {
          const data = await oembedRes.json()
          const parsed = parseArtistTitle(data.title)
          return NextResponse.json({
            title: parsed.title,
            artist: parsed.artist,
            embed_url: `https://www.youtube.com/embed/${videoId}`,
            thumbnail_url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            platform: 'youtube',
          })
        }
      }
    }

    // SoundCloud
    if (url.includes('soundcloud.com')) {
      const oembedRes = await fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`)
      if (oembedRes.ok) {
        const data = await oembedRes.json()
        const parsed = parseArtistTitle(data.title)
        return NextResponse.json({
          title: parsed.title,
          artist: parsed.artist || data.author_name,
          embed_url: url,
          thumbnail_url: data.thumbnail_url,
          platform: 'soundcloud',
        })
      }
    }

    // Spotify
    if (url.includes('spotify.com')) {
      const oembedRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`)
      if (oembedRes.ok) {
        const data = await oembedRes.json()
        return NextResponse.json({
          title: data.title,
          artist: null,
          embed_url: url,
          thumbnail_url: data.thumbnail_url,
          platform: 'spotify',
        })
      }
    }

    return NextResponse.json({ title: 'Track', artist: null, embed_url: url, thumbnail_url: null, platform: 'other' })
  } catch {
    return NextResponse.json({ title: 'Track', artist: null, embed_url: url, thumbnail_url: null, platform: 'other' })
  }
}

function extractYouTubeId(url: string): string | null {
  const patterns = [/[?&]v=([^&]+)/, /youtu\.be\/([^?]+)/, /embed\/([^?]+)/]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function parseArtistTitle(rawTitle: string) {
  const cleaned = rawTitle
    .replace(/\(Official.*?\)/gi, '')
    .replace(/\[Official.*?\]/gi, '')
    .replace(/\(Lyric.*?\)/gi, '')
    .replace(/\(Audio.*?\)/gi, '')
    .replace(/\(Video.*?\)/gi, '')
    .trim()

  const sep = cleaned.match(/^(.+?)\s*[-–—]\s*(.+)$/)
  if (sep) return { artist: sep[1].trim(), title: sep[2].trim() }
  return { artist: null, title: cleaned }
}
