export const DAYS = [
  { key: 'mon', label: 'Lundi' },
  { key: 'tue', label: 'Mardi' },
  { key: 'wed', label: 'Mercredi' },
  { key: 'thu', label: 'Jeudi' },
  { key: 'fri', label: 'Vendredi' },
  { key: 'sat', label: 'Samedi' },
  { key: 'sun', label: 'Dimanche' },
] as const

export type DayKey = (typeof DAYS)[number]['key']
export type DayHours = { closed: boolean; open: string; close: string }
export type WeekHours = Record<DayKey, DayHours>

export function defaultHours(): WeekHours {
  const base: DayHours = { closed: false, open: '09:00', close: '22:00' }
  return {
    mon: { ...base },
    tue: { ...base },
    wed: { ...base },
    thu: { ...base },
    fri: { ...base },
    sat: { ...base },
    sun: { closed: true, open: '09:00', close: '22:00' },
  }
}

/** Tunisie = UTC+1 fixe (pas de changement d'heure depuis 2005). */
function tunisNow() {
  const d = new Date()
  const utc = d.getTime() + d.getTimezoneOffset() * 60000
  return new Date(utc + 3600000)
}

const ORDER: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export function isOpenNow(hours: WeekHours | null | undefined): boolean | null {
  if (!hours) return null
  const now = tunisNow()
  const day = ORDER[now.getDay()]
  const h = hours[day]
  if (!h || h.closed) return false
  const cur = now.getHours() * 60 + now.getMinutes()
  const [oh, om] = h.open.split(':').map(Number)
  const [ch, cm] = h.close.split(':').map(Number)
  const start = oh * 60 + om
  let end = ch * 60 + cm
  if (end <= start) end += 24 * 60 // ferme après minuit
  return cur >= start && cur <= end
}
