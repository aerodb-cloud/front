'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBranch } from '@/components/BranchContext';

export default function ProjectSqlEditorRedirectPage() {
    const { slug } = useParams() as { slug: string };
    const { activeBranch } = useBranch();
    const router = useRouter();

    useEffect(() => {
        if (activeBranch && slug) {
            router.replace(`/projects/${slug}/branches/${activeBranch.id}/sql-editor`);
        }
    }, [activeBranch, slug, router]);

    return (
        <div className="flex h-full items-center justify-center bg-[#0c0d0d]">
            <div className="text-zinc-500 animate-pulse text-sm font-medium">Cargando SQL Editor...</div>
        </div>
    );
}
