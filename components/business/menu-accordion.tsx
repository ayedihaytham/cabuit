'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { MenuSection } from '@/lib/types'

export function MenuAccordion({ sections }: { sections: MenuSection[] }) {
  const [open, setOpen] = useState(sections[1]?.title ?? sections[0]?.title ?? '')

  return (
    <div className="mt-6 flex flex-col divide-y divide-border">
      {sections.map((section) => {
        const isOpen = open === section.title
        return (
          <div key={section.title} className="py-4 first:pt-0">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? '' : section.title)}
              className="flex w-full items-center justify-between text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-xl font-bold">{section.title}</span>
              <ChevronDown
                className={`size-5 text-terracotta transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && (
              <div className="flex flex-col gap-5 pt-5">
                {section.items.map((item) => (
                  <div key={item.name} className="flex items-start justify-between gap-5">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.description}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-terracotta">{item.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
