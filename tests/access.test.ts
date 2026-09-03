import { describe, expect, it } from 'vitest'
import { canManageBusiness } from '@/lib/access'

const biz = (over: Partial<Parameters<typeof canManageBusiness>[1]> = {}) => ({
  ownerId: 'owner-1',
  createdById: null,
  claimedByOwnerAt: null,
  ...over,
})

describe('canManageBusiness', () => {
  it('autorise le propriétaire', () => {
    expect(canManageBusiness({ id: 'owner-1', role: 'MERCHANT' }, biz())).toBe(true)
  })

  it('refuse un autre commerçant', () => {
    expect(canManageBusiness({ id: 'other', role: 'MERCHANT' }, biz())).toBe(false)
  })

  it('autorise tout admin', () => {
    expect(canManageBusiness({ id: 'x', role: 'ADMIN' }, biz())).toBe(true)
  })

  it('autorise le commercial créateur avant reprise', () => {
    expect(
      canManageBusiness({ id: 'com-1', role: 'COMMERCIAL' }, biz({ createdById: 'com-1' })),
    ).toBe(true)
  })

  it('refuse le commercial créateur après reprise du gérant', () => {
    expect(
      canManageBusiness(
        { id: 'com-1', role: 'COMMERCIAL' },
        biz({ createdById: 'com-1', claimedByOwnerAt: new Date() }),
      ),
    ).toBe(false)
  })

  it('refuse un commercial non créateur', () => {
    expect(
      canManageBusiness({ id: 'com-2', role: 'COMMERCIAL' }, biz({ createdById: 'com-1' })),
    ).toBe(false)
  })

  it('refuse un client', () => {
    expect(canManageBusiness({ id: 'owner-1', role: 'CLIENT' }, biz({ ownerId: 'zzz' }))).toBe(false)
  })
})
