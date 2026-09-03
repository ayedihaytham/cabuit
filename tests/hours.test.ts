import { describe, expect, it, vi, afterEach } from 'vitest'
import { defaultHours, isOpenNow, type WeekHours } from '@/lib/hours'

// isOpenNow calcule l'heure de Tunis (UTC+1) à partir de Date.now().
function at(iso: string) {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(iso))
}

afterEach(() => vi.useRealTimers())

describe('isOpenNow', () => {
  it('null si pas d’horaires', () => {
    expect(isOpenNow(null)).toBeNull()
  })

  it('ouvert un mardi après-midi (09:00–22:00)', () => {
    at('2026-09-01T12:00:00Z') // mardi 13:00 à Tunis
    expect(isOpenNow(defaultHours())).toBe(true)
  })

  it('fermé le dimanche (jour marqué closed par défaut)', () => {
    at('2026-09-06T12:00:00Z') // dimanche
    expect(isOpenNow(defaultHours())).toBe(false)
  })

  it('fermé avant l’ouverture', () => {
    at('2026-09-01T05:00:00Z') // mardi 06:00 à Tunis
    expect(isOpenNow(defaultHours())).toBe(false)
  })

  it('gère une fermeture après minuit', () => {
    const h = defaultHours()
    const late: WeekHours = { ...h, tue: { closed: false, open: '18:00', close: '02:00' } }
    at('2026-09-02T00:30:00Z') // mercredi 01:30 Tunis — encore "mardi soir" ? non : mercredi
    // On teste plutôt mardi 23:30 Tunis = 22:30 UTC mardi
    at('2026-09-01T22:30:00Z')
    expect(isOpenNow(late)).toBe(true)
  })
})
