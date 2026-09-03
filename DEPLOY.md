# Mise en production — checklist

Ordre conseillé. Chaque bloc est indépendant sauf mention contraire.

---

## 0. Avant tout : contenu à renseigner dans le code

Ces valeurs sont regroupées, il n'y a qu'un fichier à éditer :

**`lib/legal.ts`** → objet `COMPANY` (raison sociale, forme juridique, capital,
matricule fiscal, RNE, adresse du siège, responsable de publication, téléphone)
et objet `BANK_DETAILS` (titulaire, banque, RIB, IBAN).

**`lib/data/plans.ts`** → `PLANS` (prix annuels définitifs) et `TRIAL_DAYS`
(durée d'essai). Actuellement : Essentiel 200 / Populaire 300 / Premium 500 DT,
essai 30 j — à confirmer.

Commit + push une fois rempli. Les pages `/cgu`, `/mentions-legales`,
`/confidentialite` et `/paiement` se mettent à jour automatiquement.

---

## 1. Base de données (Neon)

1. Sur neon.tech, créer un projet **dans une région UE** (`eu-central-1`) — mieux
   pour la latence et la conformité que `us-east-2`.
2. Récupérer 2 chaînes de connexion :
   - **pooled** (avec `-pooler` dans l'hôte) → `DATABASE_URL`
   - **directe** (sans `-pooler`) → `DIRECT_URL`
3. Ne PAS réutiliser la base de développement : elle contient des données de test.
   Pour repartir propre en local : `pnpm db:reset`.

---

## 2. Déploiement (Vercel)

1. Pousser le repo sur GitHub (déjà fait : `ayedihaytham/cabuit`).
2. Vercel → **New Project** → importer le repo. Framework détecté : Next.js.
3. **Environment Variables** (Production) — au minimum :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | Neon, pooled |
   | `DIRECT_URL` | Neon, directe |
   | `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
   | `NEXT_PUBLIC_APP_URL` | `https://<projet>.vercel.app` (puis le domaine final) |
   | `CRON_SECRET` | une chaîne aléatoire (voir §5) |

4. **Deploy**. Le script `build` lance `prisma generate && prisma migrate deploy && next build` :
   les migrations sont appliquées automatiquement à chaque déploiement.
5. Après le 1er déploiement, créer le compte admin : soit définir
   `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` puis lancer `pnpm db:seed` en local
   pointé sur la base de prod, soit créer l'admin manuellement dans Neon.

---

## 3. Emails (Resend)

1. resend.com → créer un compte, **API Keys** → nouvelle clé.
2. **Domains** → ajouter le domaine → poser les 3 enregistrements DNS
   (SPF, DKIM, DMARC) chez le registrar → **Verify**.
3. Vercel env :
   | Variable | Valeur |
   |---|---|
   | `RESEND_API_KEY` | `re_...` |
   | `EMAIL_FROM` | `Winou <bonjour@ton-domaine>` (adresse du domaine vérifié) |

   Sans domaine vérifié, garder `EMAIL_FROM="Winou <onboarding@resend.dev>"` :
   les emails ne partent alors **que vers l'adresse du compte Resend**.
3bis. Tester : `/mot-de-passe-oublie` avec une adresse réelle → l'email doit
   arriver ; le dashboard Resend > Logs montre chaque envoi.

---

## 4. Rate-limiting (Upstash Redis)

1. upstash.com → **Create Database** → Redis → région proche (UE).
2. Onglet **REST API** → copier `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`.
3. Vercel env : ces 2 variables.

Sans elles : repli sur un limiteur en mémoire, inefficace entre les lambdas.

---

## 5. Cron

- `vercel.json` planifie déjà `/api/cron/subscriptions` **une fois par jour**
  (essais expirés, relances de renouvellement, suspensions). Vercel Cron ajoute
  automatiquement l'en-tête `Authorization: Bearer $CRON_SECRET` : définir
  `CRON_SECRET` dans les env Vercel suffit.
- **Anti-veille Neon** (offre gratuite = pause après 5 min) : Vercel Hobby ne
  permet qu'un cron quotidien. Créer un ping **toutes les 5 min** sur
  `https://<domaine>/api/keep-alive` via un service externe gratuit
  (cron-job.org, UptimeRobot, Better Stack…). Aucune authentification requise sur
  cet endpoint.

---

## 6. Monitoring (Sentry)

1. sentry.io → **Create Project** → plateforme **Next.js** → copier le DSN.
2. Vercel env :
   | Variable | Valeur |
   |---|---|
   | `SENTRY_DSN` | le DSN |
   | `NEXT_PUBLIC_SENTRY_DSN` | le même DSN |

   Sans DSN : Sentry est totalement inerte (aucun envoi).
   Les source maps ne sont pas envoyées (build Turbopack) ; à ajouter plus tard
   via `withSentryConfig` + `SENTRY_AUTH_TOKEN` si besoin de traces lisibles.

---

## 7. Stockage des photos (Vercel Blob) — optionnel

Vercel → **Storage** → **Create → Blob**. `BLOB_READ_WRITE_TOKEN` est injecté
automatiquement. Sans lui, les commerçants collent une URL d'image (le bouton
« choisir un fichier » reste masqué).

---

## 8. Domaine + Google OAuth — optionnels

- **Domaine** : Vercel → Settings → Domains → ajouter `winou.tn`, poser les DNS.
  Mettre ensuite `NEXT_PUBLIC_APP_URL` sur ce domaine, et refaire la vérification
  du domaine dans Resend si l'email est sur le même.
- **Google** : console Google Cloud → OAuth client (type « Web »), URL de
  redirection `https://<domaine>/api/auth/callback/google`. Poser
  `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` → le bouton « Continuer avec Google »
  apparaît.

---

## 9. Vérification post-déploiement

- [ ] `/` charge, la recherche `/recherche?q=...` renvoie des résultats paginés
- [ ] Inscription client → email de confirmation reçu → `/verifier-email` OK
- [ ] Connexion des 4 rôles : `/espace-client`, `/dashboard`, `/commercial`, `/admin`
- [ ] Un bon plan se récupère (compte vérifié) et le code se valide côté commerçant
- [ ] `/manifest.webmanifest` répond, l'app est installable sur mobile
- [ ] En-têtes de sécurité présents (`curl -I https://<domaine>` → `Content-Security-Policy`, `Strict-Transport-Security`)
- [ ] `/robots.txt` et `/sitemap.xml` pointent sur le bon domaine
- [ ] Sentry reçoit un événement de test ; Upstash montre du trafic sur `winou/rl:*`
- [ ] Le cron externe pingue `/api/keep-alive` (logs du service)
- [ ] `/cgu`, `/mentions-legales`, `/confidentialite` : plus aucun `[À COMPLÉTER]`
