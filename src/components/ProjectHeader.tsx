'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { ChevronDown, HelpCircle, CheckCircle2 } from 'lucide-react';
import { BranchSelector } from './BranchSelector';

export function ProjectHeader({ projectId, userEmail }: { projectId: string; userEmail: string }) {
    const [projectName, setProjectName] = useState<string>('Loading...');

    useEffect(() => {
        let mounted = true;
        async function fetchProject() {
            try {
                const data = await ApiClient.get(`/projects/${projectId}`);
                if (mounted && data.project) {
                    setProjectName(data.project.name);
                }
            } catch (e) {
                console.error('Failed to fetch project name for header', e);
                if (mounted) setProjectName('Project');
            }
        }
        fetchProject();
        return () => { mounted = false; };
    }, [projectId]);

    return (
        <header className="h-[56px] border-b border-zinc-800 bg-[#0c0d0d] flex items-center justify-between px-4 shrink-0 w-full">
            <div className="flex items-center gap-3 text-sm">
                <Link href="/projects" className="flex items-center justify-center w-6 h-6 bg-[#00e599]/20 rounded group transition-all">
                    <span className="text-[#00e599] text-[10px] sm:text-xs font-bold group-hover:scale-110 transition-transform">◩</span>
                </Link>

                <span className="text-zinc-600">/</span>

                <Link href="/projects" className="flex items-center gap-2 hover:bg-zinc-800/50 px-2 py-1.5 rounded transition-colors group">
                    <span className="text-zinc-300 font-medium">{userEmail || 'user'}</span>
                    <span className="text-[10px] font-medium border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded-full bg-zinc-800/50">
                        Launch
                    </span>
                    <ChevronDown size={14} className="text-zinc-500 group-hover:text-zinc-300" />
                </Link>

                <span className="text-zinc-600">/</span>

                <span className="text-zinc-200 font-semibold px-2">{projectName}</span>

                <span className="text-zinc-600">/</span>

                <BranchSelector />
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-[#00e599]"></div>
                    <span className="text-[12px] text-white font-medium">All OK</span>
                </div>

                <button className="w-7 h-7 flex items-center justify-center rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                    <HelpCircle size={14} />
                </button>

                <button className="w-7 h-7 flex items-center justify-center rounded bg-[#00e599] text-black font-bold text-xs hover:opacity-90 transition-opacity">
                    {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                </button>
            </div>
        </header>
    );
}
