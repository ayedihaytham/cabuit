import { redirect } from 'next/navigation'

/** Anciennes URLs de catégories -> pages actuelles. */
const CATEGORY_ROUTES: Record<string, string> = {
  restauration: '/restauration',
  cafes: '/recherche?category=Caf%C3%A9s%20%26%20salons%20de%20th%C3%A9',
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(CATEGORY_ROUTES[slug.toLowerCase()] ?? '/recherche')
}
