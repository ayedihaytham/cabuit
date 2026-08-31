import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

type SelectFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly string[]
  placeholder?: string
  icon?: ReactNode
  required?: boolean
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  icon,
  required,
}: SelectFieldProps) {
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
        <select
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-12 w-full appearance-none rounded-xl border border-input bg-background pr-10 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 ${
            icon ? 'pl-11' : 'pl-4'
          }`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </span>
    </label>
  )
}
