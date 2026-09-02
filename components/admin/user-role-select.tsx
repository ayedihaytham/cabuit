'use client'

import { useState, useTransition } from 'react'
import { adminSetUserRole } from '@/app/actions/admin'

const ROLES = [
  { value: 'CLIENT', label: 'Client' },
  { value: 'MERCHANT', label: 'Commerçant' },
  { value: 'ADMIN', label: 'Admin' },
] as const

type Role = (typeof ROLES)[number]['value']

export function UserRoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string
  role: Role
  disabled?: boolean
}) {
  const [value, setValue] = useState<Role>(role)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  const change = (next: Role) => {
    const prev = value
    setValue(next)
    setError('')
    start(async () => {
      const res = await adminSetUserRole(userId, next)
      if (res?.error) {
        setValue(prev)
        setError(res.error)
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={value}
        disabled={disabled || pending}
        onChange={(e) => change(e.target.value as Role)}
        className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      {error && <span className="max-w-52 text-right text-[11px] font-medium text-destructive">{error}</span>}
    </div>
  )
}
