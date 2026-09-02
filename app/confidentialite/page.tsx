import { LegalPage, legalMetadata } from '@/components/layout/legal-page'
import { CONTACT_EMAIL } from '@/lib/constants'

export const metadata = legalMetadata('Politique de confidentialité')

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updated="1er septembre 2026">
      <p>
        Cette politique décrit les données personnelles traitées par Winou et l’usage qui en est
        fait, conformément à la loi tunisienne n° 2004-63 relative à la protection des données à
        caractère personnel.
      </p>

      <h2>Données collectées</h2>
      <p>
        <strong>Comptes</strong> : nom, email, mot de passe (chiffré), rôle. <strong>Commerçants</strong> :
        informations de l’établissement, coordonnées, abonnement, acceptation des CGA (date + IP).
        <strong> Clients</strong> : favoris, avis, historique de consultation.{' '}
        <strong>Mesure d’audience</strong> : événements anonymisables (recherches, vues de fiche,
        clics contact) pour produire des statistiques.
      </p>

      <h2>Finalités</h2>
      <p>
        Fournir le service (fiches, tableau de bord, favoris), assurer la modération, établir les
        statistiques de visibilité communiquées aux commerçants, et gérer la facturation des
        abonnements.
      </p>

      <h2>Conservation</h2>
      <p>
        Les données de compte sont conservées tant que le compte est actif. Les journaux
        d’événements sont conservés de façon agrégée.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander l’accès, la rectification ou la suppression de vos données en écrivant à{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-terracotta">{CONTACT_EMAIL}</a>.
      </p>

      <h2>Cookies</h2>
      <p>
        Winou utilise un cookie de session strictement nécessaire à l’authentification. Aucun cookie
        publicitaire tiers n’est déposé.
      </p>
    </LegalPage>
  )
}
