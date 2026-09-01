import { z } from 'zod'

export const businessSchema = z.object({
  name: z.string().trim().min(2, 'Nom trop court').max(80),
  category: z.enum(['RESTAURANT', 'CAFE']),
  type: z.string().trim().min(2, 'Précisez le type').max(60),
  city: z.string().trim().min(2).max(60),
  address: z.string().trim().min(4, 'Adresse trop courte').max(160),
  description: z.string().trim().min(20, 'Décrivez votre établissement (20 caractères min.)').max(600),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  whatsapp: z.string().trim().max(30).optional().or(z.literal('')),
  instagram: z.string().trim().max(60).optional().or(z.literal('')),
})

export type BusinessInput = z.infer<typeof businessSchema>

export const submitSchema = z.object({
  tier: z.enum(['ESSENTIEL', 'POPULAIRE', 'PREMIUM']),
  acceptTerms: z.literal('on', { message: "Vous devez accepter les Conditions Générales d'Abonnement" }),
})

export const signupClientSchema = z.object({
  name: z.string().trim().min(2, 'Nom requis').max(80),
  email: z.string().trim().toLowerCase().email('Email invalide'),
  password: z.string().min(8, '8 caractères minimum'),
})

export const signupMerchantSchema = signupClientSchema
