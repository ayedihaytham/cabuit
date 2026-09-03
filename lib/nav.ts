import {
  CalendarDays,
  Flag,
  LayoutDashboard,
  Mail,
  Megaphone,
  ScrollText,
  Settings,
  ShieldCheck,
  Star,
  Store,
  Ticket,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import type { NavItem } from '@/components/app/app-shell'

export const MERCHANT_NAV: NavItem[] = [
  { key: 'etablissements', label: 'Mes établissements', href: '/dashboard', icon: Store, section: 'Ma vitrine' },
  { key: 'sponsoring', label: 'Mise en avant', href: '/dashboard/espace-pub', icon: Megaphone, section: 'Croissance' },
  { key: 'compte', label: 'Mon compte', href: '/compte', icon: Settings, section: 'Croissance' },
]

export const COMMERCIAL_NAV: NavItem[] = [
  { key: 'overview', label: 'Tableau de bord', href: '/commercial', icon: LayoutDashboard },
  { key: 'onboard', label: 'Onboarder un lieu', href: '/commercial/nouveau', icon: UserPlus },
  { key: 'compte', label: 'Mon compte', href: '/compte', icon: Settings },
]

type AdminCounts = { reviews: number; reports: number; messages: number }

export function adminNav(
  counts: AdminCounts = { reviews: 0, reports: 0, messages: 0 },
): NavItem[] {
  return [
    { key: 'overview', label: 'Vue d’ensemble', href: '/admin', icon: LayoutDashboard, section: 'Activité' },
    { key: 'all', label: 'Commerces', href: '/admin?tab=all', icon: Store, section: 'Activité' },
    { key: 'offers', label: 'Bons plans', href: '/admin?tab=offers', icon: Ticket, section: 'Activité' },
    { key: 'clients', label: 'Clients', href: '/admin?tab=clients', icon: Users, section: 'Communauté' },
    { key: 'users', label: 'Utilisateurs', href: '/admin/utilisateurs', icon: ShieldCheck, section: 'Communauté' },
    { key: 'reviews', label: 'Avis', href: '/admin?tab=reviews', icon: Star, badge: counts.reviews, section: 'Communauté' },
    { key: 'reports', label: 'Signalements', href: '/admin?tab=reports', icon: Flag, badge: counts.reports, section: 'Communauté' },
    { key: 'messages', label: 'Messages', href: '/admin?tab=messages', icon: Mail, badge: counts.messages, section: 'Communauté' },
    { key: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: TrendingUp, section: 'Plateforme' },
    { key: 'ads', label: 'Espaces sponsorisés', href: '/admin/espaces-pub', icon: CalendarDays, section: 'Plateforme' },
    { key: 'journal', label: 'Journal', href: '/admin/journal', icon: ScrollText, section: 'Plateforme' },
  ]
}
