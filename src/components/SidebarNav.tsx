'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, Receipt, Puzzle, Settings } from 'lucide-react';

const navigation = [
    { name: 'Proyectos', href: '/projects', icon: LayoutGrid },
    { name: 'Personas', href: '/people', icon: Users },
    { name: 'Facturación', href: '/billing', icon: Receipt },
    { name: 'Integraciones', href: '/integrations', icon: Puzzle },
    { name: 'Configuración', href: '/settings', icon: Settings },
];

export function SidebarNav() {
    const pathname = usePathname();

    return (
        <nav className="flex-1 p-3 space-y-1">
            <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                Organización
            </div>
            {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                            ? 'text-white bg-zinc-800'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                            }`}
                    >
                        <item.icon size={16} className={isActive ? 'text-white' : 'text-zinc-500'} />
                        {item.name}
                    </Link>
                )
            })}
        </nav>
    );
}
