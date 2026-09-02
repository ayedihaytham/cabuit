import {
  CalendarDays,
  Flag,
  LayoutDashboard,
  Mail,
  Megaphone,
  ScrollText,
  Star,
  Store,
  Ticket,
  Users,
} from 'lucide-react'
import type { NavItem } from '@/components/app/app-shell'

export const MERCHANT_NAV: NavItem[] = [
  { key: 'etablissements', label: 'Mes établissements', href: '/dashboard', icon: Store },
  { key: 'sponsoring', label: 'Espace sponsorisé', href: '/dashboard/espace-pub', icon: Megaphone },
]

type AdminCounts = { reviews: number; reports: number; messages: number }

export function adminNav(
  counts: AdminCounts = { reviews: 0, reports: 0, messages: 0 },
): NavItem[] {
  return [
    { key: 'overview', label: 'Vue d’ensemble', href: '/admin', icon: LayoutDashboard },
    { key: 'all', label: 'Commerces', href: '/admin?tab=all', icon: Store },
    { key: 'clients', label: 'Clients', href: '/admin?tab=clients', icon: Users },
    { key: 'offers', label: 'Bons plans', href: '/admin?tab=offers', icon: Ticket },
    { key: 'reviews', label: 'Avis', href: '/admin?tab=reviews', icon: Star, badge: counts.reviews },
    { key: 'reports', label: 'Signalements', href: '/admin?tab=reports', icon: Flag, badge: counts.reports },
    { key: 'messages', label: 'Messages', href: '/admin?tab=messages', icon: Mail, badge: counts.messages },
    { key: 'ads', label: 'Espaces sponsorisés', href: '/admin/espaces-pub', icon: CalendarDays },
    { key: 'journal', label: 'Journal', href: '/admin/journal', icon: ScrollText },
  ]
}
