/**
 * Informations légales de l'exploitant — SOURCE UNIQUE.
 * Remplacer les valeurs « [À COMPLÉTER] » avant la mise en production :
 * elles alimentent /mentions-legales, /cgu, /confidentialite et les factures.
 */
export const COMPANY = {
  /** Nom commercial affiché partout. */
  brand: 'Winou',
  /** Raison sociale complète (ex. « Winou SARL »). */
  legalName: '[À COMPLÉTER — raison sociale]',
  /** Forme juridique (SARL, SUARL, personne physique…). */
  legalForm: '[À COMPLÉTER — forme juridique]',
  /** Capital social, le cas échéant. */
  capital: '[À COMPLÉTER — capital social]',
  /** Matricule fiscal. */
  taxId: '[À COMPLÉTER — matricule fiscal]',
  /** Numéro au registre du commerce (RNE). */
  rne: '[À COMPLÉTER — numéro RNE]',
  /** Adresse du siège social. */
  address: '[À COMPLÉTER — adresse du siège]',
  /** Responsable de la publication. */
  publisher: '[À COMPLÉTER — nom du responsable de publication]',
  /** Email de contact public. */
  email: 'bonjour@winou.tn',
  /** Téléphone public (facultatif). */
  phone: '[À COMPLÉTER — téléphone]',
} as const

/** Version des CGA acceptée par les commerçants (doit rester alignée avec la base). */
export const CGA_VERSION = 'v1'

/** Date de dernière mise à jour affichée sur les pages légales. */
export const LEGAL_UPDATED = '3 septembre 2026'

/** Coordonnées de règlement par virement (factures + page /paiement). */
export const BANK_DETAILS = {
  holder: '[À COMPLÉTER — titulaire du compte]',
  bank: '[À COMPLÉTER — banque]',
  rib: '[À COMPLÉTER — RIB 20 chiffres]',
  iban: '[À COMPLÉTER — IBAN]',
} as const

/**
 * Sous-traitants (hébergement / services) — pour la politique de confidentialité.
 */
export const SUBPROCESSORS = [
  { name: 'Vercel Inc.', role: 'Hébergement de l’application', location: 'États-Unis / UE' },
  { name: 'Neon Inc.', role: 'Base de données PostgreSQL', location: 'UE (eu-central-1) recommandé' },
  { name: 'Resend', role: 'Envoi des emails transactionnels', location: 'États-Unis' },
  { name: 'Upstash', role: 'Limitation de débit (Redis)', location: 'UE / global' },
  { name: 'Sentry', role: 'Journalisation des erreurs', location: 'UE / États-Unis' },
] as const
