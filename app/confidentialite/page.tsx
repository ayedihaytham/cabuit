import { LegalPage, legalMetadata } from '@/components/layout/legal-page'
import { COMPANY, LEGAL_UPDATED, SUBPROCESSORS } from '@/lib/legal'

export const metadata = legalMetadata('Politique de confidentialité')

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updated={LEGAL_UPDATED}>
      <p>
        Cette politique décrit les données personnelles traitées par {COMPANY.legalName}, éditrice
        de {COMPANY.brand}, et l’usage qui en est fait, conformément à la loi tunisienne n° 2004-63
        du 27 juillet 2004 relative à la protection des données à caractère personnel.
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        {COMPANY.legalName} — {COMPANY.address} —{' '}
        <a href={`mailto:${COMPANY.email}`} className="text-terracotta">
          {COMPANY.email}
        </a>
      </p>

      <h2>Données collectées</h2>
      <p>
        <strong>Comptes</strong> : nom, email, mot de passe (chiffré), rôle, téléphone et ville
        facultatifs. <strong>Commerçants</strong> : informations de l’établissement, coordonnées,
        abonnement, acceptation des CGA (date + adresse IP). <strong>Clients</strong> : favoris,
        avis, bons plans récupérés, historique de consultation. <strong>Mesure d’audience</strong> :
        événements (recherches, vues de fiche, clics contact) utilisés sous forme agrégée.
      </p>

      <h2>Finalités et base légale</h2>
      <p>
        Fournir le service et le tableau de bord (exécution du contrat) ; assurer la modération et
        la sécurité (intérêt légitime) ; établir les statistiques communiquées aux commerçants
        (intérêt légitime) ; gérer la facturation des abonnements (obligation légale) ; envoyer les
        emails liés au compte (exécution du contrat).
      </p>

      <h2>Destinataires et sous-traitants</h2>
      <p>Les données sont hébergées et traitées par les prestataires suivants :</p>
      <ul className="list-disc pl-5">
        {SUBPROCESSORS.map((s) => (
          <li key={s.name}>
            <strong>{s.name}</strong> — {s.role} ({s.location})
          </li>
        ))}
      </ul>

      <h2>Durée de conservation</h2>
      <p>
        Données de compte : tant que le compte est actif, puis suppression ou anonymisation. Avis :
        conservés pour l’information des autres utilisateurs, anonymisés à la suppression du compte.
        Journaux d’événements : conservés sous forme agrégée. Factures : selon les obligations
        comptables et fiscales tunisiennes (10 ans).
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d’un droit d’accès, de rectification, d’opposition et de suppression. Depuis
        votre espace, la page{' '}
        <a href="/compte" className="text-terracotta">
          Mon compte
        </a>{' '}
        permet d’<strong>exporter toutes vos données</strong> (format JSON) et de{' '}
        <strong>supprimer votre compte</strong>. Pour toute autre demande :{' '}
        <a href={`mailto:${COMPANY.email}`} className="text-terracotta">
          {COMPANY.email}
        </a>
        . Vous pouvez également saisir l’Instance Nationale de Protection des Données Personnelles
        (INPDP, inpdp.tn).
      </p>

      <h2>Cookies</h2>
      <p>
        {COMPANY.brand} utilise un cookie de session strictement nécessaire à l’authentification et
        un cookie mémorisant votre zone géographique. Aucun cookie publicitaire tiers n’est déposé.
        La mesure d’audience Vercel Analytics ne dépose pas de cookie et n’utilise pas
        d’identifiant persistant.
      </p>

      <h2>Sécurité</h2>
      <p>
        Mots de passe chiffrés (bcrypt), connexions en HTTPS, en-têtes de sécurité (CSP, HSTS),
        limitation du nombre de tentatives de connexion, journalisation des actions
        d’administration.
      </p>
    </LegalPage>
  )
}
