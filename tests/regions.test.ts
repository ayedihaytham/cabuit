import { describe, expect, it } from 'vitest'
import {
  GOVERNORATE_KEYS,
  matchGovernorate,
  nearestGovernorate,
  isGovernorate,
} from '@/lib/regions'

describe('matchGovernorate', () => {
  it('reconnaît les libellés FR exacts', () => {
    expect(matchGovernorate('Tunis')).toBe('tunis')
    expect(matchGovernorate('Béja')).toBe('beja')
    expect(matchGovernorate('Médenine')).toBe('medenine')
  })

  it('nettoie les préfixes de géocodeur', () => {
    expect(matchGovernorate('Gouvernorat de Sfax')).toBe('sfax')
    expect(matchGovernorate('Sfax Governorate')).toBe('sfax')
  })

  it('gère les translittérations arabes courantes', () => {
    expect(matchGovernorate('Kef')).toBe('le-kef')
    expect(matchGovernorate('Qabis')).toBe('gabes')
  })

  it('renvoie null pour l’inconnu', () => {
    expect(matchGovernorate('Paris')).toBeNull()
    expect(matchGovernorate('')).toBeNull()
    expect(matchGovernorate(null)).toBeNull()
  })
})

describe('nearestGovernorate', () => {
  it('trouve Tunis pour le centre de Tunis', () => {
    expect(nearestGovernorate(36.8, 10.18)).toBe('tunis')
  })
  it('trouve Sfax pour le sud-est côtier', () => {
    expect(nearestGovernorate(34.74, 10.76)).toBe('sfax')
  })
  it('renvoie toujours une clé valide', () => {
    expect(GOVERNORATE_KEYS).toContain(nearestGovernorate(0, 0))
  })
})

describe('isGovernorate', () => {
  it('valide une clé connue et rejette le reste', () => {
    expect(isGovernorate('tunis')).toBe(true)
    expect(isGovernorate('atlantis')).toBe(false)
    expect(isGovernorate(undefined)).toBe(false)
  })
})
