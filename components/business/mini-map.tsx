import { MapPin } from 'lucide-react'

/** Carte OpenStreetMap embarquée — aucune clé API requise. */
export function MiniMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const d = 0.006
  const bbox = `${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}`
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="relative h-56 bg-secondary">
        <iframe
          title={`Carte — ${label}`}
          src={src}
          loading="lazy"
          className="size-full border-0"
        />
      </div>
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
        target="_blank"
        rel="noopener"
        className="flex items-center gap-2 p-3 text-sm font-semibold hover:text-terracotta"
      >
        <MapPin className="size-4 text-terracotta" /> Ouvrir dans la carte
      </a>
    </div>
  )
}
