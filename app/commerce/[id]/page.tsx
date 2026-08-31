import { notFound, redirect } from 'next/navigation'
import { getBusiness } from '@/lib/data/businesses'

/** Fiches commerce ayant leur propre page dédiée. */
const DEDICATED_PAGES: Record<string, string> = {
  'le-petit-souk': '/restauration/le-petit-souk',
}

export default async function CommercePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const slug = id.toLowerCase()

  if (DEDICATED_PAGES[slug]) redirect(DEDICATED_PAGES[slug])

  // Les autres commerces n'ont pas encore de fiche détaillée : on renvoie vers la recherche.
  if (getBusiness(slug)) redirect('/recherche')

  notFound()
}
