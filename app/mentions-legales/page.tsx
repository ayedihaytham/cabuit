import { LegalPage, legalMetadata } from '@/components/layout/legal-page'
import { BRAND, CONTACT_EMAIL } from '@/lib/constants'

export const metadata = legalMetadata('Mentions légales')

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" updated="1er septembre 2026">
      <h2>Éditeur</h2>
      <p>
        {BRAND} — plateforme de mise en relation entre les restaurants, cafés et salons de thé de
        Tunisie et leurs clients.
        <br />
        Contact : <a href={`mailto:${CONTACT_EMAIL}`} className="text-terracotta">{CONTACT_EMAIL}</a>
        <br />
        {/* TODO(légal) : raison sociale, matricule fiscal, adresse du siège, responsable de publication. */}
        <strong>Informations légales complètes à compléter</strong> (raison sociale, matricule
        fiscal, adresse du siège, responsable de la publication).
      </p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Vercel Inc. et la base de données par Neon. {/* TODO: adresses */}
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        La marque {BRAND}, le logo et l’interface sont protégés. Les contenus des fiches (textes,
        photos) restent la propriété des établissements qui les publient.
      </p>

      <h2>Signalement</h2>
      <p>
        Tout contenu illicite peut être signalé via le bouton « Signaler cette fiche » présent sur
        chaque page d’établissement, ou par email.
      </p>
    </LegalPage>
  )
}
