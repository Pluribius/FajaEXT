import {
    BarChart3,
    Users,
    FileSpreadsheet,
    MessageSquare,
    Newspaper,
    type LucideIcon,
} from 'lucide-react';
import { UserRole } from '@/lib/types';

export interface NavItemConfig {
    href: string;
    label: string;
    icon?: LucideIcon;
    badgeCount?: number;
    badgeClass?: string;
}

export const LANDING_PATHS = ['/home', '/landing', '/'] as const;

export function isLandingRoute(pathname: string, activeView?: string): boolean {
    return activeView === 'landing' || (LANDING_PATHS as readonly string[]).includes(pathname);
}

export function getRoleHomeRoute(role?: UserRole): string {
    if (role === 'admin') return '/dashboard';
    if (role === 'viewer') return '/export';
    return '/user';
}

export function getRoleHomeLabel(role?: UserRole): string {
    if (role === 'admin') return 'Ir al Dashboard';
    if (role === 'viewer') return 'Ir a Exportar';
    return 'Ir a Mi Portal';
}

export function getRoleBadgeText(role?: UserRole): string {
    if (role === 'admin') return 'Administrador';
    if (role === 'viewer') return 'Visor Autorizado';
    return 'Cliente';
}

export function getAdminNavItems(pendingReviews: number, pendingTickets: number): NavItemConfig[] {
    return [
        { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
        {
            href: '/listing',
            label: 'Usuarios',
            icon: Users,
            badgeCount: pendingReviews > 0 ? pendingReviews : undefined,
            badgeClass: 'bg-amber-500 text-white',
        },
        { href: '/export', label: 'Exportar', icon: FileSpreadsheet },
        {
            href: '/tickets',
            label: 'Tickets',
            icon: MessageSquare,
            badgeCount: pendingTickets > 0 ? pendingTickets : undefined,
            badgeClass: 'bg-red-500 text-white',
        },
        { href: '/news', label: 'Noticias', icon: Newspaper },
    ];
}