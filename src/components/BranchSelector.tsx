'use client';

import { useBranch, Branch } from './BranchContext';
import { ChevronDown, GitBranch, Target, Eye } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation';

export function BranchSelector() {
    const { branches, activeBranch, setActiveBranch, isLoading } = useBranch();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const params = useParams();
    const slug = params?.slug as string;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isLoading || !activeBranch) return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1c1c] border border-zinc-800 rounded-md animate-pulse">
            <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
            <div className="w-16 h-4 rounded bg-zinc-800"></div>
            <div className="w-3 h-3 rounded bg-zinc-800 ml-1"></div>
        </div>
    );

    const getIcon = (type: string) => {
        switch (type) {
            case 'production': return <Target size={14} className="text-[#00e599]" />;
            case 'preview': return <Eye size={14} className="text-blue-400" />;
            default: return <GitBranch size={14} className="text-zinc-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1c1c] border border-zinc-800 rounded-md hover:bg-zinc-800/80 transition-colors shadow-sm"
            >
                {getIcon(activeBranch.type)}
                <span className="text-[13px] font-medium text-white">{activeBranch.name}</span>
                <ChevronDown size={14} className="text-zinc-500 ml-1" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#1c1c1c] border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="px-3 py-2.5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Cambiar Rama</span>
                        <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">{branches.length} en total</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                        {branches.map((branch: Branch) => (
                            <button
                                key={branch.id}
                                onClick={() => {
                                    setActiveBranch(branch);
                                    setIsOpen(false);
                                    
                                    if (slug && activeBranch) {
                                        let newPath = pathname;
                                        
                                        // Replace the current active branch ID with the newly selected branch ID in the URL.
                                        if (pathname.includes(`/branches/${activeBranch.id}`)) {
                                            newPath = pathname.replace(`/branches/${activeBranch.id}`, `/branches/${branch.id}`);
                                        } else if (pathname.includes('/branches')) {
                                            newPath = `/projects/${slug}/branches/${branch.id}`;
                                        } 
                                        
                                        const search = searchParams.toString();
                                        if (search) {
                                            newPath = `${newPath}?${search}`;
                                        }
                                        
                                        router.push(newPath);
                                    }
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 text-[13px] hover:bg-zinc-800 transition-colors ${activeBranch.id === branch.id ? 'bg-zinc-800/30' : ''}`}
                            >
                                <div className="flex items-center gap-2.5">
                                    {getIcon(branch.type)}
                                    <span className={activeBranch.id === branch.id ? 'text-white font-medium' : 'text-zinc-400 font-medium'}>{branch.name}</span>
                                </div>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide
                                        ${branch.type === 'production'
                                        ? 'bg-[#00e599]/10 text-[#00e599] border-[#00e599]/20'
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}
                                >
                                    {branch.type === 'production' ? 'PRODUCCIÓN' : branch.type === 'preview' ? 'VISTA PREVIA' : 'DESARROLLO'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
