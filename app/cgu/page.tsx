import { LegalPage, legalMetadata } from '@/components/layout/legal-page'
import { PLANS, TRIAL_DAYS } from '@/lib/data/plans'
import { COMPANY, CGA_VERSION, LEGAL_UPDATED } from '@/lib/legal'

export const metadata = legalMetadata("Conditions Générales d'Abonnement")

export default function CguPage() {
  return (
    <LegalPage title="Conditions Générales d'Abonnement" updated={LEGAL_UPDATED}>
      <p>
        Les présentes conditions (version <strong>{CGA_VERSION}</strong>) régissent l’abonnement des
        établissements (restaurants, cafés et salons de thé) à la plateforme {COMPANY.brand},
        éditée par <strong>{COMPANY.legalName}</strong>. En cochant la case d’acceptation lors de la
        soumission d’une fiche, le commerçant accepte sans réserve les présentes conditions. Cette
        acceptation est horodatée et associée à l’adresse IP de connexion, et fait foi entre les
        parties.
      </p>

      <h2>1. Objet</h2>
      <p>
        {COMPANY.brand} met à disposition du commerçant une fiche en ligne présentant son
        établissement, sa carte et ses coordonnées, un tableau de bord de gestion, la publication de
        bons plans à destination des membres, et des statistiques de visibilité.
      </p>

      <h2>2. Abonnement et durée</h2>
      <p>
        L’abonnement est <strong>annuel</strong>. Il débute par une période d’essai gratuite de{' '}
        {TRIAL_DAYS} jours, sans engagement. À l’issue de l’essai, l’abonnement est facturé selon la
        formule choisie et reconduit tacitement pour des périodes successives d’un an, sauf
        résiliation.
      </p>

      <h2>3. Tarifs et paiement</h2>
      <p>Formules annuelles en vigueur :</p>
      <ul className="list-disc pl-5">
        {PLANS.map((p) => (
          <li key={p.name}>
            <strong>{p.name}</strong> — {p.pricePerYear} DT / an
          </li>
        ))}
      </ul>
      <p>
        Le règlement s’effectue par les moyens proposés par {COMPANY.brand} (virement bancaire,
        espèces). Une facture est émise pour chaque paiement. Une relance est adressée 30 jours
        avant l’échéance ; à défaut de renouvellement, la fiche est suspendue après un délai de
        grâce de 14 jours.
      </p>

      <h2>4. Validation des fiches</h2>
      <p>
        Toute fiche créée par un commerçant est vérifiée par l’équipe {COMPANY.brand} avant
        publication. Une fiche créée sur place par un commercial mandaté par {COMPANY.brand} est
        publiée directement. {COMPANY.brand} peut refuser, suspendre ou retirer une fiche en cas
        d’informations inexactes, de contenu inapproprié ou de non-paiement.
      </p>

      <h2>5. Obligations du commerçant</h2>
      <p>
        Le commerçant garantit l’exactitude des informations publiées, dispose des droits sur les
        contenus (textes, photos) qu’il met en ligne, et s’engage à honorer les bons plans qu’il
        publie auprès des membres qui présentent un code valide.
      </p>

      <h2>6. Résiliation</h2>
      <p>
        Le commerçant peut résilier à tout moment en contactant {COMPANY.brand} ; la fiche reste
        active jusqu’au terme de la période déjà réglée. Aucun remboursement au prorata n’est dû.
      </p>

      <h2>7. Données personnelles</h2>
      <p>
        Le traitement des données est décrit dans la{' '}
        <a href="/confidentialite" className="text-terracotta">
          politique de confidentialité
        </a>
        .
      </p>

      <h2>8. Responsabilité</h2>
      <p>
        {COMPANY.brand} agit comme intermédiaire de mise en relation et n’est pas partie aux
        transactions entre clients et établissements.
      </p>

      <h2>9. Droit applicable</h2>
      <p>
        Les présentes conditions sont régies par le droit tunisien. Tout litige relève des
        tribunaux compétents du siège de {COMPANY.legalName}.
      </p>

      <h2>10. Contact</h2>
      <p>
        <a href={`mailto:${COMPANY.email}`} className="text-terracotta">
          {COMPANY.email}
        </a>
      </p>
    </LegalPage>
  )
}
