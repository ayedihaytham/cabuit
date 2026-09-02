import { AppShell } from '@/components/app/app-shell'
import { PageHead, EmptyState } from '@/components/app/ui'
import { adminNav } from '@/lib/nav'
import { Search, ShieldCheck } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { getAdminStats, listUsersForAdmin } from '@/lib/queries'
import { UserRoleSelect } from '@/components/admin/user-role-select'

export const dynamic = 'force-dynamic'

const fmt = (d: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(d)

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const [user, { q }] = await Promise.all([requireUser(['ADMIN']), searchParams])
  const [users, stats] = await Promise.all([listUsersForAdmin(q), getAdminStats()])

  return (
    <AppShell
      roleLabel="Administration"
      accent="ink"
      userName={user.name ?? user.email}
      homeHref="/admin"
      nav={adminNav({ reviews: stats.reviewsPending, reports: stats.reportsOpen, messages: stats.messagesOpen })}
      activeKey="users"
    >
      <PageHead
        eyebrow="Comptes"
        title="Utilisateurs"
        subtitle="Gérez les rôles. Le dernier administrateur ne peut pas être rétrogradé."
      />

      <form className="mb-6 flex max-w-sm items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
        <Search className="size-4 text-muted-foreground" />
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Rechercher par nom ou email"
          className="w-full bg-transparent text-sm outline-none"
        />
      </form>

      {users.length === 0 ? (
        <EmptyState icon={ShieldCheck} text="Aucun utilisateur." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="divide-y divide-border">
            {users.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {u.name ?? 'Sans nom'}
                    {u.id === user.id && (
                      <span className="ml-2 rounded-full bg-terracotta/10 px-2 py-0.5 text-[11px] font-bold text-terracotta">
                        vous
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.email}
                    {!u.emailVerified && ' · non vérifié'}
                    {u._count.businesses > 0 && ` · ${u._count.businesses} établissement(s)`}
                    {' · inscrit le '}
                    {fmt(u.createdAt)}
                  </p>
                </div>
                <UserRoleSelect userId={u.id} role={u.role} disabled={u.id === user.id} />
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  )
}
