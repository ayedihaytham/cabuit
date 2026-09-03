import { LegalPage, legalMetadata } from '@/components/layout/legal-page'
import { BRAND } from '@/lib/constants'
import { COMPANY, LEGAL_UPDATED } from '@/lib/legal'

export const metadata = legalMetadata('Mentions légales')

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" updated={LEGAL_UPDATED}>
      <h2>Éditeur du site</h2>
      <p>
        <strong>{COMPANY.legalName}</strong> ({COMPANY.legalForm})
        {COMPANY.capital ? ` — capital ${COMPANY.capital}` : ''}
        <br />
        Siège social : {COMPANY.address}
        <br />
        Matricule fiscal : {COMPANY.taxId}
        <br />
        Registre national des entreprises : {COMPANY.rne}
        <br />
        Email :{' '}
        <a href={`mailto:${COMPANY.email}`} className="text-terracotta">
          {COMPANY.email}
        </a>
        {COMPANY.phone ? <> · Téléphone : {COMPANY.phone}</> : null}
      </p>

      <h2>Responsable de la publication</h2>
      <p>{COMPANY.publisher}</p>

      <h2>Nature du service</h2>
      <p>
        {BRAND} est une plateforme de mise en relation entre les restaurants, cafés et salons de thé
        de Tunisie et leurs clients. {BRAND} n’est pas partie aux prestations fournies par les
        établissements référencés.
      </p>

      <h2>Hébergement</h2>
      <p>
        Application : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
        (vercel.com).
        <br />
        Base de données : Neon Inc. (neon.tech).
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        La marque {BRAND}, le logo et l’interface sont protégés. Les contenus des fiches (textes,
        photos) restent la propriété des établissements qui les publient et sont diffusés sous leur
        responsabilité.
      </p>

      <h2>Signalement de contenu</h2>
      <p>
        Tout contenu illicite peut être signalé via le bouton « Signaler cette fiche » présent sur
        chaque page d’établissement, ou par email à{' '}
        <a href={`mailto:${COMPANY.email}`} className="text-terracotta">
          {COMPANY.email}
        </a>
        .
      </p>
    </LegalPage>
  )
}
