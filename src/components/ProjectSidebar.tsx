'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    LayoutDashboard, GitBranch, Blocks, Settings,
    LayoutTemplate, Activity, TerminalSquare, Table2,
    History, ShieldAlert, DatabaseZap, Lock, MessageSquare, PanelLeftClose, Key, Network, HardDrive, GitMerge
} from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { ImportDataDrawer } from './ImportDataDrawer';

export function ProjectSidebar({ projectId }: { projectId: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab');

    // Parse branchId from pathname like /projects/[projectId]/branches/[branchId]
    const branchMatch = pathname.match(/\/branches\/([^/]+)/);
    const branchParam = branchMatch && branchMatch[1] !== 'page' ? branchMatch[1] : null;

    const [project, setProject] = useState<any>(null);
    const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [isImportDrawerOpen, setIsImportDrawerOpen] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const data = await ApiClient.get(`/projects/${projectId}`);
                setProject(data.project);
                if (branchParam) {
                    setSelectedBranchId(branchParam);
                } else if (data.project.branches?.length > 0) {
                    // Try to pick the default/production branch or fallback to first
                    const defBranch = data.project.branches.find((b: { id: string; name: string; isDefault?: boolean; type: string }) => b.isDefault || b.type === 'production');
                    setSelectedBranchId(defBranch ? defBranch.name : data.project.branches[0].name);
                }
            } catch (err) {
                console.error("Failed to load project in sidebar:", err);
            }
        };
        fetchProject();
    }, [projectId, branchParam]);

    const selectedBranch = project?.branches?.find((b: { id: string; name: string }) => b.id === selectedBranchId || b.name === selectedBranchId);

    const isActive = (path: string, exact: boolean = false) => {
        // Build the current full path with search parameters
        const searchString = searchParams.toString();
        const fullCurrentPath = searchString ? `${pathname}?${searchString}` : pathname;

        if (exact) {
            return fullCurrentPath === path;
        }
        
        // Exact match with query params if defined in the `path` param
        if (path.includes('?')) {
            return fullCurrentPath === path;
        }

        // Exact match required for base branch overview to avoid highlighting it 
        // when inside SQL Editor or other sub-routes
        if (path.endsWith(selectedBranch?.name || selectedBranchId)) {
            return fullCurrentPath === path;
        }

        return pathname.startsWith(path);
    };

    const linkClasses = (path: string, exact: boolean = false) => `
        flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors
        ${isActive(path, exact)
            ? 'bg-zinc-800/50 text-white font-medium'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'}
    `;

    return (
        <aside className="w-64 border-r border-zinc-800 bg-[#161616] flex flex-col h-full overflow-y-auto hidden md:flex">
            <div className="flex-1 py-4 px-3 space-y-6">

                {/* PROJECT Category */}
                <div>
                    <h3 className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Project</h3>
                    <nav className="space-y-0.5">
                        <Link href={`/projects/${projectId}`} className={linkClasses(`/projects/${projectId}`, true)}>
                            <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <Link href={`/projects/${projectId}/branches`} className={linkClasses(`/projects/${projectId}/branches`, true)}>
                            <GitBranch size={16} /> Branches
                        </Link>
                        <Link href={`/projects/${projectId}/compare`} className={linkClasses(`/projects/${projectId}/compare`, true)}>
                            <GitMerge size={16} /> Compare & Merge
                        </Link>
                        <span className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-zinc-600 cursor-not-allowed select-none bg-transparent">
                            <Blocks size={16} className="opacity-50" /> Integrations
                        </span>
                        <Link href={`/projects/${projectId}/settings/keys`} className={linkClasses(`/projects/${projectId}/settings/keys`)}>
                            <Key size={16} /> API Keys
                        </Link>
                        <Link href={`/projects/${projectId}/settings`} className={linkClasses(`/projects/${projectId}/settings`, true)}>
                            <Settings size={16} /> Settings
                        </Link>
                    </nav>
                </div>

                {/* BRANCH Category */}
                <div>
                    <h3 className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Branch</h3>
                    <div className="px-3 mb-2 relative">
                        <button
                            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                            className="w-full flex items-center justify-between px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-800 rounded text-zinc-200 hover:border-zinc-700 transition-colors"
                        >
                            <span className="flex items-center gap-2 truncate">
                                {selectedBranch?.isDefault ? (
                                    <GitBranch size={14} className="text-zinc-400 shrink-0" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 17 16" fill="none" role="img" aria-hidden="true" className="text-zinc-400 shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M3.96875 6.4375C3.96875 7.11896 4.06412 7.73079 4.375 8.16504C4.64917 8.54792 5.19934 8.93749 6.46875 8.9375H8.61328C8.92431 7.61231 10.1112 6.625 11.5312 6.625C13.1881 6.625 14.5312 7.96815 14.5312 9.625C14.5312 11.2819 13.1881 12.625 11.5312 12.625C10.1563 12.625 9.00002 11.6992 8.64551 10.4375H6.46875C4.86341 10.4375 3.78835 9.92076 3.15625 9.03809C2.56096 8.20674 2.46875 7.19344 2.46875 6.4375V3.375H3.96875V6.4375ZM11.5312 8.125C10.7028 8.125 10.0312 8.79657 10.0312 9.625C10.0312 10.4534 10.7028 11.125 11.5312 11.125C12.3597 11.125 13.0312 10.4534 13.0312 9.625C13.0312 8.79657 12.3597 8.125 11.5312 8.125Z" fill="currentColor"></path></svg>
                                )}
                                <span className="truncate">{selectedBranch ? selectedBranch.name : 'Loading...'}</span>
                            </span>
                            <span className="text-[10px] text-zinc-500 shrink-0">▼</span>
                        </button>

                        {isBranchDropdownOpen && project && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsBranchDropdownOpen(false)} />
                                <div className="absolute top-full left-3 right-3 mt-1 z-50 bg-[#1c1c1c] border border-zinc-700 rounded-lg shadow-xl overflow-hidden py-1">
                                    <div className="max-h-60 overflow-y-auto">
                                        {project.branches?.map((branch: { id: string; name: string; isDefault?: boolean }) => (
                                            <button
                                                key={branch.id}
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 transition-colors flex items-center gap-2 ${selectedBranch?.name === branch.name ? 'text-white bg-zinc-800/50' : 'text-zinc-400'}`}
                                                onClick={() => {
                                                    setSelectedBranchId(branch.name);
                                                    setIsBranchDropdownOpen(false);
                                                    
                                                    // Determine the sub-tab (SQL, tables, or overview) to maintain context
                                                    if (pathname.includes('/tables')) {
                                                        router.push(`/projects/${projectId}/branches/${branch.name}/tables`);
                                                    } else if (pathname.includes('tab=sql')) { 
                                                        // Note: Query params aren't in pathname, but we check if it's SQL editor elsewhere.
                                                        // Defaulting to root of branch for simplicity if not tables
                                                        router.push(`/projects/${projectId}/branches/${branch.name}`); 
                                                    } else {
                                                        router.push(`/projects/${projectId}/branches/${branch.name}`);
                                                    }
                                                }}
                                            >
                                                {branch.isDefault ? (
                                                    <GitBranch size={14} className="shrink-0" />
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 17 16" fill="none" role="img" aria-hidden="true" className="shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M3.96875 6.4375C3.96875 7.11896 4.06412 7.73079 4.375 8.16504C4.64917 8.54792 5.19934 8.93749 6.46875 8.9375H8.61328C8.92431 7.61231 10.1112 6.625 11.5312 6.625C13.1881 6.625 14.5312 7.96815 14.5312 9.625C14.5312 11.2819 13.1881 12.625 11.5312 12.625C10.1563 12.625 9.00002 11.6992 8.64551 10.4375H6.46875C4.86341 10.4375 3.78835 9.92076 3.15625 9.03809C2.56096 8.20674 2.46875 7.19344 2.46875 6.4375V3.375H3.96875V6.4375ZM11.5312 8.125C10.7028 8.125 10.0312 8.79657 10.0312 9.625C10.0312 10.4534 10.7028 11.125 11.5312 11.125C12.3597 11.125 13.0312 10.4534 13.0312 9.625C13.0312 8.79657 12.3597 8.125 11.5312 8.125Z" fill="currentColor"></path></svg>
                                                )}
                                                <span className="truncate flex-1">{branch.name}</span>
                                                {branch.isDefault && <span className="px-1.5 py-0.5 text-[9px] font-bold bg-zinc-700/50 text-zinc-300 rounded uppercase tracking-wider">Def</span>}
                                            </button>
                                        ))}
                                    </div>
                                    <Link href={`/projects/${projectId}/branches`} onClick={() => setIsBranchDropdownOpen(false)} className="block w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 border-t border-zinc-700 transition-colors">
                                        + Manage branches
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                    {selectedBranch && (
                        <nav className="space-y-0.5">
                            <Link href={`/projects/${projectId}/branches/${selectedBranch.name}`} className={linkClasses(`/projects/${projectId}/branches/${selectedBranch.name}`, true)}>
                                <LayoutTemplate size={16} /> Overview
                            </Link>
                            <span className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-zinc-600 cursor-not-allowed select-none bg-transparent">
                                <Activity size={16} className="opacity-50" /> Monitoring
                            </span>
                            <Link href={`/projects/${projectId}/branches/${selectedBranch.name}/sql-editor`} className={linkClasses(`/projects/${projectId}/branches/${selectedBranch.name}/sql-editor`)}>
                                <TerminalSquare size={16} /> SQL Editor
                            </Link>
                            <Link href={`/projects/${projectId}/branches/${selectedBranch.name}/tables`} className={linkClasses(`/projects/${projectId}/branches/${selectedBranch.name}/tables`)}>
                                <Table2 size={16} /> Tables
                            </Link>
                            <Link href={`/projects/${projectId}/branches/${selectedBranch.name}/schema`} className={linkClasses(`/projects/${projectId}/branches/${selectedBranch.name}/schema`)}>
                                <Network size={16} /> Schema Visualizer
                            </Link>
                            <button
                                onClick={() => setIsImportDrawerOpen(true)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/30 transition-colors"
                            >
                                <HardDrive size={16} /> Import Data
                            </button>
                            <span className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-zinc-600 cursor-not-allowed select-none bg-transparent">
                                <History size={16} className="opacity-50" /> Backup & Restore
                            </span>
                            <span className="flex items-center justify-between px-3 py-2 text-sm rounded-lg text-zinc-600 cursor-not-allowed select-none bg-transparent w-full">
                                <span className="flex items-center gap-3"><ShieldAlert size={16} className="opacity-50" /> Data Masking</span>
                                <span className="text-[9px] font-bold bg-purple-500/10 text-purple-400/50 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">Beta</span>
                            </span>
                        </nav>
                    )}
                </div>

                {/* APP BACKEND Category */}
                <div>
                    <h3 className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">App Backend</h3>
                    <nav className="space-y-0.5">
                        <Link href={`/projects/${projectId}/api`} className={linkClasses(`/projects/${projectId}/api`)}>
                            <DatabaseZap size={16} /> Data API
                        </Link>
                        <Link href={`/projects/${projectId}/auth`} className={linkClasses(`/projects/${projectId}/auth`)}>
                            <Lock size={16} /> Auth
                        </Link>
                    </nav>
                </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-zinc-800/60 space-y-0.5">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/30 transition-colors">
                    <MessageSquare size={16} /> Feedback
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/30 transition-colors">
                    <PanelLeftClose size={16} /> Collapse menu
                </button>
            </div>

            {selectedBranch && (
                <ImportDataDrawer 
                    isOpen={isImportDrawerOpen} 
                    onClose={() => setIsImportDrawerOpen(false)} 
                    projectId={projectId} 
                    branchId={selectedBranch.name} 
                />
            )}
        </aside>
    );
}
