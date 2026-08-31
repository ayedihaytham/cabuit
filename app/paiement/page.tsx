import type { Metadata } from 'next'
import { PaymentForm } from '@/components/pricing/payment-form'
import { PLANS, getPlan } from '@/lib/data/plans'

export const metadata: Metadata = {
  title: 'Paiement',
}

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function PaiementPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const offre = Array.isArray(params.offre) ? params.offre[0] : params.offre
  const plan = (offre && getPlan(offre)) || PLANS.find((item) => item.popular) || PLANS[0]

  return <PaymentForm plan={plan} />
}
