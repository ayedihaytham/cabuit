import {
  CalendarDays,
  Flag,
  LayoutDashboard,
  Megaphone,
  ScrollText,
  Star,
  Store,
  Users,
} from 'lucide-react'
import type { NavItem } from '@/components/app/app-shell'

export const MERCHANT_NAV: NavItem[] = [
  { key: 'etablissements', label: 'Mes établissements', href: '/dashboard', icon: Store },
  { key: 'sponsoring', label: 'Espace sponsorisé', href: '/dashboard/espace-pub', icon: Megaphone },
]

export function adminNav(counts: { reviews: number; reports: number } = { reviews: 0, reports: 0 }): NavItem[] {
  return [
    { key: 'overview', label: 'Vue d’ensemble', href: '/admin', icon: LayoutDashboard },
    { key: 'all', label: 'Commerces', href: '/admin?tab=all', icon: Store },
    { key: 'clients', label: 'Clients', href: '/admin?tab=clients', icon: Users },
    { key: 'reviews', label: 'Avis', href: '/admin?tab=reviews', icon: Star, badge: counts.reviews },
    { key: 'reports', label: 'Signalements', href: '/admin?tab=reports', icon: Flag, badge: counts.reports },
    { key: 'ads', label: 'Espaces sponsorisés', href: '/admin/espaces-pub', icon: CalendarDays },
    { key: 'journal', label: 'Journal', href: '/admin/journal', icon: ScrollText },
  ]
}
