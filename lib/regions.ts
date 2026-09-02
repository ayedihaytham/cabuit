/** Les 24 gouvernorats de Tunisie — maille géographique de la plateforme. */

export type Governorate = {
  key: string
  label: string
  /** Centroïde approximatif, pour retrouver le gouvernorat le plus proche depuis un GPS. */
  lat: number
  lng: number
}

export const GOVERNORATES: Governorate[] = [
  { key: 'tunis', label: 'Tunis', lat: 36.81, lng: 10.18 },
  { key: 'ariana', label: 'Ariana', lat: 36.95, lng: 10.1 },
  { key: 'ben-arous', label: 'Ben Arous', lat: 36.68, lng: 10.3 },
  { key: 'manouba', label: 'Manouba', lat: 36.81, lng: 9.9 },
  { key: 'nabeul', label: 'Nabeul', lat: 36.45, lng: 10.7 },
  { key: 'zaghouan', label: 'Zaghouan', lat: 36.4, lng: 10.14 },
  { key: 'bizerte', label: 'Bizerte', lat: 37.15, lng: 9.8 },
  { key: 'beja', label: 'Béja', lat: 36.73, lng: 9.19 },
  { key: 'jendouba', label: 'Jendouba', lat: 36.5, lng: 8.78 },
  { key: 'le-kef', label: 'Le Kef', lat: 36.17, lng: 8.7 },
  { key: 'siliana', label: 'Siliana', lat: 36.08, lng: 9.37 },
  { key: 'sousse', label: 'Sousse', lat: 35.83, lng: 10.6 },
  { key: 'monastir', label: 'Monastir', lat: 35.77, lng: 10.83 },
  { key: 'mahdia', label: 'Mahdia', lat: 35.5, lng: 11.06 },
  { key: 'sfax', label: 'Sfax', lat: 34.74, lng: 10.76 },
  { key: 'kairouan', label: 'Kairouan', lat: 35.68, lng: 10.1 },
  { key: 'kasserine', label: 'Kasserine', lat: 35.17, lng: 8.83 },
  { key: 'sidi-bouzid', label: 'Sidi Bouzid', lat: 35.04, lng: 9.48 },
  { key: 'gabes', label: 'Gabès', lat: 33.88, lng: 10.1 },
  { key: 'medenine', label: 'Médenine', lat: 33.35, lng: 10.5 },
  { key: 'tataouine', label: 'Tataouine', lat: 32.93, lng: 10.45 },
  { key: 'gafsa', label: 'Gafsa', lat: 34.42, lng: 8.78 },
  { key: 'tozeur', label: 'Tozeur', lat: 33.92, lng: 8.13 },
  { key: 'kebili', label: 'Kébili', lat: 33.7, lng: 8.97 },
]

export const GOVERNORATE_KEYS = GOVERNORATES.map((g) => g.key)

const BY_KEY = new Map(GOVERNORATES.map((g) => [g.key, g]))

export function governorateLabel(key: string | null | undefined): string | null {
  if (!key) return null
  return BY_KEY.get(key)?.label ?? null
}

export function isGovernorate(key: string | null | undefined): key is string {
  return !!key && BY_KEY.has(key)
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/gouvernorat de |governorate|gouvernorat|province of |province/gi, '')
    .replace(/[^a-z]/g, '')
    .trim()

/** Alias -> key, pour rattacher un nom renvoyé par un géocodeur (FR/EN/translittérations). */
const ALIASES: Record<string, string> = {
  tunis: 'tunis',
  ariana: 'ariana',
  lariana: 'ariana',
  benarous: 'ben-arous',
  binarous: 'ben-arous',
  manouba: 'manouba',
  lamanouba: 'manouba',
  mannouba: 'manouba',
  nabeul: 'nabeul',
  zaghouan: 'zaghouan',
  bizerte: 'bizerte',
  banzart: 'bizerte',
  beja: 'beja',
  bajah: 'beja',
  jendouba: 'jendouba',
  kef: 'le-kef',
  lekef: 'le-kef',
  siliana: 'siliana',
  sousse: 'sousse',
  susah: 'sousse',
  monastir: 'monastir',
  almunastir: 'monastir',
  mahdia: 'mahdia',
  almahdiyah: 'mahdia',
  sfax: 'sfax',
  safaqis: 'sfax',
  kairouan: 'kairouan',
  alqayrawan: 'kairouan',
  kasserine: 'kasserine',
  alqasrayn: 'kasserine',
  sidibouzid: 'sidi-bouzid',
  gabes: 'gabes',
  qabis: 'gabes',
  medenine: 'medenine',
  madanin: 'medenine',
  tataouine: 'tataouine',
  tatawin: 'tataouine',
  gafsa: 'gafsa',
  qafsah: 'gafsa',
  tozeur: 'tozeur',
  tawzar: 'tozeur',
  kebili: 'kebili',
  qibili: 'kebili',
}

/** Rattache une chaîne libre (state/région d'un géocodeur) à un gouvernorat. */
export function matchGovernorate(raw: string | null | undefined): string | null {
  if (!raw) return null
  const n = norm(raw)
  if (!n) return null
  if (BY_KEY.has(n)) return n
  if (ALIASES[n]) return ALIASES[n]
  for (const g of GOVERNORATES) {
    if (norm(g.label) === n) return g.key
  }
  return null
}

/** Gouvernorat dont le centroïde est le plus proche d'un point GPS. */
export function nearestGovernorate(lat: number, lng: number): string {
  let best = GOVERNORATES[0]
  let bestD = Infinity
  for (const g of GOVERNORATES) {
    const d = (g.lat - lat) ** 2 + (g.lng - lng) ** 2
    if (d < bestD) {
      bestD = d
      best = g
    }
  }
  return best.key
}
