import { LegalPage, legalMetadata } from '@/components/layout/legal-page'
import { CONTACT_EMAIL } from '@/lib/constants'

export const metadata = legalMetadata("Conditions Générales d'Abonnement")

export default function CguPage() {
  return (
    <LegalPage title="Conditions Générales d'Abonnement" updated="1er septembre 2026">
      <p>
        Les présentes conditions (version <strong>v1</strong>) régissent l’abonnement des
        établissements (restaurants, cafés et salons de thé) à la plateforme Blayes. En cochant la
        case d’acceptation lors de la soumission d’une fiche, le commerçant accepte sans réserve les
        présentes conditions. Cette acceptation est horodatée et associée à l’adresse IP de
        connexion.
      </p>

      <h2>1. Objet</h2>
      <p>
        Blayes met à disposition du commerçant une fiche en ligne présentant son établissement, sa
        carte et ses coordonnées, ainsi qu’un tableau de bord de gestion et des statistiques de
        visibilité.
      </p>

      <h2>2. Abonnement et durée</h2>
      <p>
        L’abonnement est <strong>annuel</strong>. Il débute par une période d’essai gratuite de 30
        jours, sans engagement. À l’issue de l’essai, l’abonnement est facturé selon la formule
        choisie (Essentiel, Populaire ou Premium) et renouvelé par tacite reconduction pour des
        périodes d’un an.
      </p>

      <h2>3. Tarifs et paiement</h2>
      <p>
        Les tarifs annuels sont ceux affichés sur la page Tarifs au moment de la souscription. Le
        règlement s’effectue par les moyens proposés par Blayes (virement, espèces, paiement en
        ligne). Une facture est émise pour chaque paiement.
      </p>

      <h2>4. Validation des fiches</h2>
      <p>
        Toute fiche est vérifiée par l’équipe Blayes avant publication. Blayes peut refuser,
        suspendre ou retirer une fiche en cas d’informations inexactes, de contenu inapproprié ou de
        non-paiement.
      </p>

      <h2>5. Obligations du commerçant</h2>
      <p>
        Le commerçant garantit l’exactitude des informations publiées et dispose des droits sur les
        contenus (textes, photos) qu’il met en ligne.
      </p>

      <h2>6. Résiliation</h2>
      <p>
        Le commerçant peut résilier à tout moment depuis son espace ; la fiche reste active jusqu’au
        terme de la période déjà réglée. Aucun remboursement au prorata n’est dû.
      </p>

      <h2>7. Responsabilité</h2>
      <p>
        Blayes agit comme intermédiaire de mise en relation et n’est pas partie aux transactions
        entre clients et établissements.
      </p>

      <h2>8. Contact</h2>
      <p>
        Pour toute question : <a href={`mailto:${CONTACT_EMAIL}`} className="text-terracotta">{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  )
}
