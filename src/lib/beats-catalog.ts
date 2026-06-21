export type LicenseType = 'basica' | 'premium' | 'exclusiva'
export type Genre = 'trance' | 'electronica' | 'orquestal' | 'pop'

export interface Beat {
  id: string
  title: string
  genre: Genre
  bpm: number
  key: string
}

export interface License {
  type: LicenseType
  name: string
  priceEur: number       // precio en euros
  priceCents: number     // para Stripe (céntimos)
  description: string
  includes: string[]
}

export const BEATS: Beat[] = [
  { id: 'hearts-in-motion',          title: 'Hearts In Motion',          genre: 'trance',     bpm: 128, key: 'Am' },
  { id: 'eternal-frequencies',       title: 'Eternal Frequencies',       genre: 'orquestal',  bpm: 120, key: 'Dm' },
  { id: 'summum',                    title: 'Summum',                    genre: 'electronica', bpm: 124, key: 'Gm' },
  { id: 'shine-together',            title: 'Shine Together',            genre: 'electronica', bpm: 130, key: 'Em' },
  { id: 'vuelven-las-emociones',     title: 'Vuelven las Emociones',     genre: 'pop',        bpm: 118, key: 'C'  },
  { id: 'classic-essence',           title: 'Classic Essence',           genre: 'orquestal',  bpm: 80,  key: 'Fm' },
  { id: 'cuando-el-silencio-grita',  title: 'Cuando el Silencio Grita',  genre: 'pop',        bpm: 90,  key: 'Am' },
  { id: 'deepbrave',                 title: 'DEEPBRAVE',                 genre: 'trance',     bpm: 138, key: 'Bm' },
  { id: 'entre-lo-que-fui',          title: 'Entre lo que fui y lo que soy', genre: 'pop',   bpm: 95,  key: 'Dm' },
  { id: 'los-buenos-recuerdos',      title: 'Los Buenos Recuerdos',      genre: 'pop',        bpm: 88,  key: 'G'  },
]

export const LICENSES: License[] = [
  {
    type: 'basica',
    name: 'Básica',
    priceEur: 49,
    priceCents: 4900,
    description: 'Para YouTube, redes sociales y proyectos no comerciales.',
    includes: ['MP3 320 kbps', 'Hasta 100.000 streams', 'YouTube & redes sociales', 'Crédito al productor requerido'],
  },
  {
    type: 'premium',
    name: 'Premium',
    priceEur: 149,
    priceCents: 14900,
    description: 'Para proyectos comerciales, radio y distribución amplia.',
    includes: ['WAV sin comprimir', 'Stems separados', 'Streams ilimitados', 'Uso comercial completo', 'Radio y TV local'],
  },
  {
    type: 'exclusiva',
    name: 'Exclusiva',
    priceEur: 500,
    priceCents: 50000,
    description: 'Derechos totales. Precio orientativo — contacta para negociar.',
    includes: ['Derechos exclusivos totales', 'WAV + Stems + Proyecto DAW', 'Sync: cine, TV, publicidad', 'Beat retirado del catálogo'],
  },
]

export function getBeat(id: string): Beat | undefined {
  return BEATS.find(b => b.id === id)
}

export function getLicense(type: LicenseType): License {
  return LICENSES.find(l => l.type === type)!
}
