export type Plan = 'free' | 'pro' | 'artist' | 'label'

export const PLAN_NAMES: Record<Plan, string> = {
  free: 'Free',
  pro: 'Pro',
  artist: 'Artist',
  label: 'Label',
}

export const PLAN_PRICES: Record<Plan, number> = {
  free: 0,
  pro: 4.99,
  artist: 9.99,
  label: 29.99,
}

export const PLAN_DESCRIPTIONS: Record<Plan, string> = {
  free: 'Acceso al catálogo RAYVER',
  pro: 'Conecta tus plataformas favoritas',
  artist: 'Herramientas para artistas independientes',
  label: 'Gestión completa para sellos y managers',
}

export interface PlanFeatures {
  spotifyConnect: boolean
  soundcloudConnect: boolean
  youtubeConnect: boolean
  appleMusicConnect: boolean
  userPlaylists: boolean
  maxUserPlaylists: number
  crossfade: boolean
  downloadMix: boolean
  highQualityStream: boolean
  analyticsAccess: boolean
  teamMembers: number
  customBranding: boolean
  apiAccess: boolean
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  free: {
    spotifyConnect: false,
    soundcloudConnect: false,
    youtubeConnect: false,
    appleMusicConnect: false,
    userPlaylists: false,
    maxUserPlaylists: 0,
    crossfade: false,
    downloadMix: false,
    highQualityStream: false,
    analyticsAccess: false,
    teamMembers: 1,
    customBranding: false,
    apiAccess: false,
  },
  pro: {
    spotifyConnect: true,
    soundcloudConnect: true,
    youtubeConnect: true,
    appleMusicConnect: false,
    userPlaylists: true,
    maxUserPlaylists: 20,
    crossfade: true,
    downloadMix: false,
    highQualityStream: true,
    analyticsAccess: false,
    teamMembers: 1,
    customBranding: false,
    apiAccess: false,
  },
  artist: {
    spotifyConnect: true,
    soundcloudConnect: true,
    youtubeConnect: true,
    appleMusicConnect: true,
    userPlaylists: true,
    maxUserPlaylists: 100,
    crossfade: true,
    downloadMix: true,
    highQualityStream: true,
    analyticsAccess: true,
    teamMembers: 1,
    customBranding: true,
    apiAccess: false,
  },
  label: {
    spotifyConnect: true,
    soundcloudConnect: true,
    youtubeConnect: true,
    appleMusicConnect: true,
    userPlaylists: true,
    maxUserPlaylists: -1,
    crossfade: true,
    downloadMix: true,
    highQualityStream: true,
    analyticsAccess: true,
    teamMembers: 10,
    customBranding: true,
    apiAccess: true,
  },
}

export const STRIPE_PRICE_IDS: Partial<Record<Plan, string>> = {
  pro: process.env.STRIPE_PRO_PRICE_ID ?? '',
  artist: process.env.STRIPE_ARTIST_PRICE_ID ?? '',
  label: process.env.STRIPE_LABEL_PRICE_ID ?? '',
}

export function hasFeature(plan: Plan, feature: keyof PlanFeatures): boolean {
  return !!PLAN_FEATURES[plan][feature]
}

export function canConnectPlatform(plan: Plan, platform: 'spotify' | 'soundcloud' | 'youtube' | 'apple_music'): boolean {
  const map: Record<string, keyof PlanFeatures> = {
    spotify: 'spotifyConnect',
    soundcloud: 'soundcloudConnect',
    youtube: 'youtubeConnect',
    apple_music: 'appleMusicConnect',
  }
  return hasFeature(plan, map[platform])
}
