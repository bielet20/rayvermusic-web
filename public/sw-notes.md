# Service worker guidance (Rayver player)

There is **no service worker in this repo today**. If one is added (Workbox, next-pwa, Cloudflare, etc.):

- Do **not** cache these URLs (use network-only / bypass):
  - `https://www.youtube.com/*`, `https://s.ytimg.com/*`, `https://*.googlevideo.com/*`
  - `https://w.soundcloud.com/*`, `https://widget.soundcloud.com/*`, `https://api.soundcloud.com/*`
  - `https://open.spotify.com/*`, `https://*.spotify.com/*`
- Stale cached iframe API scripts cause “plays once then dies” on iOS PWAs.
- Prefer `display: standalone` in `manifest.webmanifest` (already set).
