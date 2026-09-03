import { WifiOff } from 'lucide-react'

export const metadata = { title: 'Hors ligne' }

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center text-foreground">
      <div className="max-w-sm">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-ochre/15 text-ochre">
          <WifiOff className="size-7" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold">Pas de connexion</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vérifiez votre réseau. Les pages déjà consultées restent accessibles hors ligne.
        </p>
      </div>
    </main>
  )
}
