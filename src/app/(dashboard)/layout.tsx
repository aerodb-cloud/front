import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { SidebarNav } from '@/components/SidebarNav';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) {
        redirect('/login');
    }

    return (
        <div className="flex h-screen bg-zinc-950">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 bg-[#161616] flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-zinc-800">
                    <Link href="/projects" className="text-xl font-bold tracking-wider text-[#00e599] flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#00e599]/20 flex items-center justify-center rounded">
                            <span className="text-[#00e599] text-sm">◩</span>
                        </span>
                        AERO
                    </Link>
                </div>
                <SidebarNav />
                <div className="p-4 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <p className="font-medium text-white">{session.user?.name}</p>
                        </div>
                        <form action={async () => {
                            "use server"
                            await signOut()
                        }}>
                            <button className="text-sm text-zinc-400 hover:text-white" type="submit">
                                Cerrar sesión
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
