'use client'

import { useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import {
  addMenuSection,
  addMenuItem,
  deleteMenuItem,
  deleteMenuSection,
} from '@/app/actions/menu'

type Item = { id: string; name: string; description: string; price: string }
type Section = { id: string; title: string; items: Item[] }

export function MenuEditor({ businessId, sections }: { businessId: string; sections: Section[] }) {
  const [pending, start] = useTransition()
  const router = useRouter()
  const newSectionRef = useRef<HTMLInputElement>(null)

  const run = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn()
      router.refresh()
    })

  return (
    <div className="flex flex-col gap-5">
      {sections.map((section) => (
        <div key={section.id} className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">{section.title}</h3>
            <button
              type="button"
              onClick={() => run(() => deleteMenuSection(businessId, section.id))}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <ul className="mt-3 divide-y divide-border">
            {section.items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-2 text-sm">
                <div>
                  <p className="font-semibold">{item.name} · <span className="text-terracotta">{item.price}</span></p>
                  {item.description && <p className="text-muted-foreground">{item.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => run(() => deleteMenuItem(businessId, item.id))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>

          <form
            action={(fd) => run(() => addMenuItem(businessId, section.id, fd))}
            className="mt-3 grid gap-2 sm:grid-cols-[1fr_5rem_auto]"
          >
            <input name="name" placeholder="Plat" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <input name="price" placeholder="12 DT" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <button type="submit" disabled={pending} className="rounded-lg bg-foreground px-3 py-2 text-xs font-bold text-background">
              <Plus className="size-4" />
            </button>
            <input name="description" placeholder="Description (facultatif)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-3" />
          </form>
        </div>
      ))}

      <form
        action={(fd) => {
          run(() => addMenuSection(businessId, fd))
          newSectionRef.current!.value = ''
        }}
        className="flex gap-2"
      >
        <input
          ref={newSectionRef}
          name="title"
          placeholder="Nouvelle section (Entrées, Boissons…)"
          required
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button type="submit" disabled={pending} className="rounded-full bg-terracotta px-4 py-2 text-sm font-bold text-primary-foreground">
          Ajouter
        </button>
      </form>
    </div>
  )
}
