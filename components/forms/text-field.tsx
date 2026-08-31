import type { ReactNode } from 'react'

type TextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  icon?: ReactNode
  type?: string
  required?: boolean
  name?: string
  autoComplete?: string
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = 'text',
  required,
  name,
  autoComplete,
}: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">
        {label} {required && <span className="text-terracotta">*</span>}
      </span>
      <span className="relative block">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-12 w-full rounded-xl border border-input bg-background pr-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 ${
            icon ? 'pl-11' : 'pl-4'
          }`}
        />
      </span>
    </label>
  )
}
