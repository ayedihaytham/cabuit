'use client'

import { FormEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { recordPayment } from '@/app/actions/admin'

export function RecordPayment({
  subscriptionId,
  defaultAmount,
}: {
  subscriptionId: string
  defaultAmount: number
}) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState('')
  const router = useRouter()

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const amount = Number(form.get('amount'))
    const method = String(form.get('method'))
    start(async () => {
      const res = await recordPayment(subscriptionId, amount, method)
      if (res?.error) setMsg(res.error)
      else {
        setMsg(`Paiement enregistré — facture ${res?.invoiceNumber}`)
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <label className="field-label">
        Montant (DT)
        <input name="amount" type="number" defaultValue={defaultAmount} min={0} className="field-input w-32" />
      </label>
      <label className="field-label">
        Méthode
        <select name="method" className="field-input">
          <option value="BANK_TRANSFER">Virement</option>
          <option value="CASH">Espèces</option>
          <option value="E_DINAR">e-Dinar</option>
          <option value="CARD">Carte</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {pending ? 'Enregistrement…' : 'Marquer payé'}
      </button>
      {msg && <p className="w-full text-sm font-medium text-olive">{msg}</p>}
    </form>
  )
}
