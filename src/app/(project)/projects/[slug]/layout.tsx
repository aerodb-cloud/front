import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { ProjectHeader } from '@/components/ProjectHeader';
import { BranchProvider } from '@/components/BranchContext';
import { ApiClient } from '@/lib/api';
import { headers } from 'next/headers';

export default async function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const session = await auth();
    if (!session) {
        redirect('/login');
    }

    // Await params as it's a Promise in Next.js 15+
    // const resolvedParams = await params; // This line is removed as slug is destructured directly
    const projectId = slug; // projectId now directly uses slug

    return (
        <BranchProvider projectId={projectId}>
            <div className="flex h-screen bg-zinc-950">
                {/* Project specific sidebar */}
                <ProjectSidebar projectId={projectId} />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0c0d0d]">
                    <ProjectHeader projectId={slug} userEmail={session.user?.email || ''} />
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </BranchProvider>
    );
}
