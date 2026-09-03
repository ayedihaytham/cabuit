'use client'

import { useState, useTransition } from 'react'
import { adminSetUserRole } from '@/app/actions/admin'
import { ListboxSelect } from '@/components/ui/listbox-select'

const ROLES = [
  { value: 'CLIENT', label: 'Client' },
  { value: 'MERCHANT', label: 'Commerçant' },
  { value: 'COMMERCIAL', label: 'Commercial' },
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
      <ListboxSelect
        ariaLabel="Rôle de l’utilisateur"
        className="w-40"
        align="right"
        value={value}
        disabled={disabled || pending}
        options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
        onChange={(v) => change(v as Role)}
      />
      {error && <span className="max-w-52 text-right text-[11px] font-medium text-destructive">{error}</span>}
    </div>
  )
}
