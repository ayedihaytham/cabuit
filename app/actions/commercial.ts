'use server'

import { randomInt } from 'crypto'
import { revalidatePath, revalidateTag } from 'next/cache'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { requireCommercial, requireMerchant } from '@/lib/session'
import { slugify } from '@/lib/slug'
import { onboardSchema } from '@/lib/validations'
import { getPlan, TRIAL_DAYS } from '@/lib/data/plans'
import { TAG } from '@/lib/queries'
import { sendEmail, layout, appUrl } from '@/lib/email'
import { guard } from '@/lib/rate-limit'

export type OnboardState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  ok?: boolean
  businessId?: string
  credentials?: { email: string; password: string }
}

async function uniqueSlug(base: string) {
  const root = slugify(base) || 'commerce'
  let slug = root
  let n = 2
  while (await db.business.findUnique({ where: { slug } })) slug = `${root}-${n++}`
  return slug
}

/** Mot de passe temporaire lisible : Winou-XXXXXX (sans caractères ambigus). */
function tempPassword() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += alphabet[randomInt(alphabet.length)]
  return `Winou-${s}`
}

/**
 * Le commercial onboarde un établissement : crée le compte gérant (mot de passe
 * temporaire) + la fiche (mise en ligne directe) + l'abonnement en essai.
 */
export async function onboardBusiness(_prev: OnboardState, formData: FormData): Promise<OnboardState> {
  const commercial = await requireCommercial()
  const limited = await guard('onboard', 30, 60 * 60 * 1000)
  if (limited) return limited

  const parsed = onboardSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }
  const d = parsed.data

  const existing = await db.user.findUnique({ where: { email: d.ownerEmail } })
  if (existing) return { error: 'Un compte existe déjà avec cet email de gérant.' }

  const plan = getPlan('Populaire')!
  const password = tempPassword()
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS)

  const business = await db.$transaction(async (tx) => {
    const owner = await tx.user.create({
      data: {
        name: d.ownerName,
        email: d.ownerEmail,
        phone: d.ownerPhone || null,
        role: 'MERCHANT',
        passwordHash: await bcrypt.hash(password, 10),
        emailVerified: new Date(),
        mustChangePassword: true,
      },
    })

    const biz = await tx.business.create({
      data: {
        ownerId: owner.id,
        createdById: commercial.id,
        name: d.name,
        slug: await uniqueSlug(d.name),
        category: d.category,
        type: d.type,
        region: d.region,
        city: d.city,
        address: d.address,
        description: d.description,
        phone: d.phone || null,
        whatsapp: d.whatsapp || null,
        instagram: d.instagram || null,
        status: 'ACTIVE',
      },
    })

    await tx.subscription.create({
      data: {
        businessId: biz.id,
        tier: 'POPULAIRE',
        pricePerYear: plan.pricePerYear,
        status: 'TRIALING',
        trialEndsAt: trialEnd,
        acceptedTermsAt: new Date(),
        acceptedTermsIp: `onboarding-commercial:${commercial.id}`,
        contractVersion: 'v1',
      },
    })

    await tx.auditLog.create({
      data: { actorId: commercial.id, action: 'business.onboard', entity: 'Business', entityId: biz.id },
    })

    return biz
  })

  await db.event.create({ data: { type: 'SIGNUP' } }).catch(() => {})

  void sendEmail({
    to: d.ownerEmail,
    subject: `${d.name} est en ligne sur Winou`,
    html: layout(
      `Bienvenue ${d.ownerName} 👋`,
      `<p>Votre fiche <strong>${d.name}</strong> a été créée par notre équipe et elle est déjà visible sur Winou.</p>
       <p>Connectez-vous pour la gérer :</p>
       <p><strong>Identifiant :</strong> ${d.ownerEmail}<br/>
       <strong>Mot de passe temporaire :</strong> ${password}</p>
       <p>Il vous sera demandé de choisir un nouveau mot de passe à la première connexion.</p>`,
      { href: `${appUrl()}/connexion`, label: 'Accéder à mon espace' },
    ),
  })

  revalidateTag(TAG.businesses, 'max')
  revalidateTag(TAG.stats, 'max')
  revalidatePath('/commercial')

  return { ok: true, businessId: business.id, credentials: { email: d.ownerEmail, password } }
}

/** Le gérant reprend la main : le commercial passe en lecture seule sur cette fiche. */
export async function claimBusiness(businessId: string): Promise<{ ok?: boolean; error?: string }> {
  const user = await requireMerchant()
  const biz = await db.business.findFirst({ where: { id: businessId, ownerId: user.id } })
  if (!biz) return { error: 'Fiche introuvable.' }
  if (biz.claimedByOwnerAt) return { ok: true }

  await db.business.update({ where: { id: businessId }, data: { claimedByOwnerAt: new Date() } })
  await db.auditLog.create({
    data: { actorId: user.id, action: 'business.claim', entity: 'Business', entityId: businessId },
  })
  revalidatePath(`/dashboard/${businessId}`)
  revalidatePath('/commercial')
  return { ok: true }
}
