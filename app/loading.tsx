export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <span className="sr-only">Chargement…</span>
      <span className="size-8 animate-spin rounded-full border-2 border-border border-t-terracotta" />
    </div>
  )
}
