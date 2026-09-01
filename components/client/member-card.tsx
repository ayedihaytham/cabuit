import { Ticket } from 'lucide-react'

export function MemberCard({
  name,
  memberSince,
  redemptions,
  favorites,
}: {
  name: string
  memberSince: Date
  redemptions: number
  favorites: number
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-olive to-[oklch(0.36_0.06_150)] p-5 text-primary-foreground shadow-[0_14px_40px_rgba(53,41,30,0.18)]">
      <Ticket className="pointer-events-none absolute -right-4 -top-4 size-24 rotate-12 text-primary-foreground/10" />
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground/70">
        Carte membre
      </p>
      <p className="mt-2 font-display text-2xl font-bold leading-tight">{name}</p>
      <p className="mt-1 text-xs text-primary-foreground/70">
        Membre depuis{' '}
        {new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(memberSince)}
      </p>
      <div className="mt-4 flex gap-5 border-t border-primary-foreground/15 pt-3 text-center text-xs">
        <div>
          <p className="font-display text-lg font-bold">{redemptions}</p>
          <p className="text-primary-foreground/60">bons plans</p>
        </div>
        <div>
          <p className="font-display text-lg font-bold">{favorites}</p>
          <p className="text-primary-foreground/60">favoris</p>
        </div>
      </div>
    </div>
  )
}
