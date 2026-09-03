import { describe, expect, it } from 'vitest'
import { businessSchema, onboardSchema } from '@/lib/validations'

const validBusiness = {
  name: 'Chez Test',
  category: 'RESTAURANT',
  type: 'Pizzeria',
  region: 'tunis',
  city: 'La Marsa',
  address: '12 rue des Jasmins',
  description: 'Petite pizzeria de quartier au feu de bois, cadre chaleureux.',
  phone: '',
  whatsapp: '',
  instagram: '',
}

describe('businessSchema', () => {
  it('accepte une fiche valide', () => {
    expect(businessSchema.safeParse(validBusiness).success).toBe(true)
  })

  it('exige un gouvernorat connu', () => {
    const r = businessSchema.safeParse({ ...validBusiness, region: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.region).toBeTruthy()
  })

  it('rejette une description trop courte', () => {
    const r = businessSchema.safeParse({ ...validBusiness, description: 'court' })
    expect(r.success).toBe(false)
  })

  it('rejette une catégorie hors énum', () => {
    expect(businessSchema.safeParse({ ...validBusiness, category: 'BAR' }).success).toBe(false)
  })
})

describe('onboardSchema', () => {
  it('exige les coordonnées du gérant', () => {
    expect(onboardSchema.safeParse(validBusiness).success).toBe(false)
    const ok = onboardSchema.safeParse({
      ...validBusiness,
      ownerName: 'Ali Ben Ali',
      ownerEmail: 'ali@example.com',
      ownerPhone: '',
    })
    expect(ok.success).toBe(true)
  })

  it('normalise l’email du gérant en minuscules', () => {
    const r = onboardSchema.safeParse({
      ...validBusiness,
      ownerName: 'Ali',
      ownerEmail: 'ALI@EXAMPLE.COM',
    })
    expect(r.success && r.data.ownerEmail).toBe('ali@example.com')
  })
})
