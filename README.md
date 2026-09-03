# Winou

Plateforme tunisienne qui regroupe restaurants et cafés / salons de thé.
Les commerces exposent leur espace via un **abonnement annuel** ; les clients
s'inscrivent pour débloquer les **bons plans membres** (offre réclamée → code →
présenté au comptoir → validé par le commerçant).

**Stack** : Next.js 16 (App Router) · React 19 · Prisma 6 · PostgreSQL (Neon) ·
Auth.js v5 · Tailwind v4 · Resend · Vercel Blob.

---

## Développement local

```bash
pnpm install
cp .env.example .env      # puis remplir (voir ci-dessous)
pnpm db:migrate           # applique les migrations Prisma
pnpm db:seed              # crée l'admin + jeu de données de démo
pnpm dev                  # http://localhost:3100
```

### Rôles de test (après seed)

| Rôle | Accès | Identifiants |
|---|---|---|
| Admin | `/admin` | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` |
| Commerçant | `/dashboard` | `commercant@winou.tn` / `ChangeMoi!2026` |
| Client | `/espace-client` | `client1@winou.tn` … `client8@winou.tn` / `ChangeMoi!2026` |

---

## Variables d'environnement

| Variable | Requis | Rôle |
|---|---|---|
| `DATABASE_URL` | ✅ | Connexion Postgres *pooler* (runtime) |
| `DIRECT_URL` | ✅ | Connexion directe (migrations Prisma) |
| `AUTH_SECRET` | ✅ | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXT_PUBLIC_APP_URL` | ✅ prod | URL publique (emails, sitemap, JSON-LD) |
| `RESEND_API_KEY` | ⬜ | Sans clé : emails loggés en console, le reste fonctionne |
| `EMAIL_FROM` | ⬜ | `Winou <onboarding@resend.dev>` tant qu'aucun domaine n'est vérifié |
| `BLOB_READ_WRITE_TOKEN` | ⬜ | Upload de photos. Sans : collage d'URL uniquement |
| `CRON_SECRET` | ⬜ | Protège `/api/cron/*` (Vercel l'injecte dans l'en-tête `Authorization`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | ⬜ | Active « Continuer avec Google » |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | ⬜ | Compte admin créé par `pnpm db:seed` |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | ⬜ prod | Rate-limiting distribué. Sans : repli en mémoire (mono-instance) |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | ⬜ prod | Monitoring d'erreurs. Sans : désactivé |

---

## Robustesse

- **En-têtes de sécurité** (CSP, HSTS, X-Frame-Options, Permissions-Policy) : `next.config.mjs` → `headers()`.
- **Rate-limiting** : `lib/rate-limit.ts` — Upstash Redis si configuré, sinon en mémoire. Sur Vercel (multi-lambda) : créer une base Upstash Redis (gratuit).
- **Monitoring** : Sentry via `instrumentation.ts` (serveur/edge) + `instrumentation-client.ts` (navigateur). Inerte sans DSN. Pas d'upload de source maps (Turbopack) : ajouter `withSentryConfig` + `SENTRY_AUTH_TOKEN` plus tard si besoin.
- **Vérification d'email** : à l'inscription, `emailVerified = null` + email avec lien `/verifier-email`. Bandeau de rappel dans les espaces client/commerçant ; `claimOffer` et `submitBusiness` sont bloqués tant que l'email n'est pas confirmé. Les comptes créés par un commercial ou le seed sont pré-vérifiés.
- **Tests** : `pnpm test` (Vitest) — logique d'accès, régions, horaires, validations.
- **CI** : `.github/workflows/ci.yml` — Postgres éphémère, `prisma migrate deploy`, lint + typecheck + test + build sur chaque push/PR.

---

## Déploiement sur Vercel (offre gratuite)

1. **Push** le repo sur GitHub, puis « New Project » sur Vercel → importer le repo.
2. **Base de données** : garder Neon (déjà Postgres). Copier `DATABASE_URL` +
   `DIRECT_URL` dans les *Environment Variables* Vercel.
3. **Variables** : ajouter au minimum `AUTH_SECRET` et `NEXT_PUBLIC_APP_URL`
   (`https://<projet>.vercel.app` au début, le domaine final ensuite).
4. **Photos** : Vercel → *Storage* → *Create Blob Store* → la variable
   `BLOB_READ_WRITE_TOKEN` est injectée automatiquement.
5. **Emails** : ajouter `RESEND_API_KEY`. Pour envoyer à d'autres adresses que la
   tienne, vérifier un domaine dans Resend puis mettre `EMAIL_FROM` dessus.
6. **Migrations** : le `build` lance `prisma migrate deploy` (voir `package.json`).
7. **Cron** : `vercel.json` planifie `/api/cron/subscriptions` une fois par jour
   (essais expirés → à régler, impayés → suspension). Ajouter `CRON_SECRET` dans
   les variables Vercel pour protéger l'endpoint.
8. **Anti-veille Neon** (offre gratuite Neon = pause après 5 min) : créer un ping
   toutes les 5 min sur `https://<domaine>/api/keep-alive` via un service cron
   externe gratuit (cron-job.org, UptimeRobot…). Les crons Vercel Hobby ne
   tournent qu'une fois par jour, d'où le service externe.

---

## Scripts

| Commande | Effet |
|---|---|
| `pnpm dev` | Serveur de dev (port 3100) |
| `pnpm build` / `pnpm start` | Build + serveur de production (port 3100) |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:seed` | Jeu de données de démo |
| `pnpm db:studio` | Prisma Studio |
| `pnpm lint` | ESLint |
