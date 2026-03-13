'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { X, Search, GitBranch, MoreVertical, ShieldCheck, Trash2, Edit2, Play, Power, RotateCcw, Clock, Target, Info } from 'lucide-react';
import { CreateBranchModal } from '@/components/CreateBranchModal';
import { RenameBranchModal } from '@/components/RenameBranchModal';
import { SetDefaultBranchModal } from '@/components/SetDefaultBranchModal';
import { DeleteBranchModal } from '@/components/DeleteBranchModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTitle, TooltipDescription, TooltipTrigger } from '@/components/ui/tooltip';

interface Branch {
    id: string;
    name: string;
    type: string;
    timelineId: string;
    createdAt: string;
    autoDeleteAt?: string;
    isSchemaOnly: boolean;
    isDefault: boolean;
    parentTimelineId?: string;
    logicalSize?: number;
    createdBy?: string;
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function BranchRow({ db, project, slug, metrics, onAction }: { db: Branch; project: ProjectDetail; slug: string; metrics: any; onAction: (action: string, db: Branch) => void }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuClick = (action: string) => {
        setDropdownOpen(false);
        onAction(action, db);
    };

    const isDefaultBranch = db.isDefault || db.type === 'production';

    return (
        <div className="flex items-center justify-between px-5 py-3 hover:bg-zinc-800/30 transition-colors border-b border-zinc-800/50 group min-w-max">
            <div className="flex flex-1 items-center">
                <div className="w-[18%] min-w-[250px] max-w-[300px] flex items-center gap-3">
                    {isDefaultBranch ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-git-branch text-zinc-400 shrink-0" aria-hidden="true"><path d="M15 6a9 9 0 0 0-9 9V3"></path><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 17 16" fill="none" role="img" aria-hidden="true" className="text-zinc-400 shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M3.96875 6.4375C3.96875 7.11896 4.06412 7.73079 4.375 8.16504C4.64917 8.54792 5.19934 8.93749 6.46875 8.9375H8.61328C8.92431 7.61231 10.1112 6.625 11.5312 6.625C13.1881 6.625 14.5312 7.96815 14.5312 9.625C14.5312 11.2819 13.1881 12.625 11.5312 12.625C10.1563 12.625 9.00002 11.6992 8.64551 10.4375H6.46875C4.86341 10.4375 3.78835 9.92076 3.15625 9.03809C2.56096 8.20674 2.46875 7.19344 2.46875 6.4375V3.375H3.96875V6.4375ZM11.5312 8.125C10.7028 8.125 10.0312 8.79657 10.0312 9.625C10.0312 10.4534 10.7028 11.125 11.5312 11.125C12.3597 11.125 13.0312 10.4534 13.0312 9.625C13.0312 8.79657 12.3597 8.125 11.5312 8.125Z" fill="currentColor"></path></svg>
                    )}
                    <Link href={`/projects/${slug}/branches/${db.id}`} className="text-[14px] text-white font-medium hover:underline">
                        {db.name}
                    </Link>
                    {isDefaultBranch && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded border border-zinc-700">Default</span>}
                    {db.isSchemaOnly && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#0dc38e]/10 text-[#0dc38e] rounded border border-[#0dc38e]/20">Schema Only</span>}
                    {db.autoDeleteAt && (
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <svg width="16px" height="16px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" className="text-zinc-500 hover:text-zinc-300 cursor-help transition-colors"><path fillRule="evenodd" clipRule="evenodd" d="M1.7334 0.0666504H14.2667V1.26665H13.2667V3.19265C13.2666 3.83748 13.0757 4.46794 12.718 5.00445L10.7211 7.99998L12.7179 10.9955C13.0756 11.532 13.2666 12.1624 13.2667 12.8072V14.7333H14.2667V15.9333H1.7334V14.7333H2.7334V12.8073C2.7335 12.1625 2.92445 11.532 3.2822 10.9955L5.27898 7.99998L3.2822 5.00452C2.92445 4.468 2.7335 3.8376 2.7334 3.19274V1.26665H1.7334V0.0666504ZM3.9334 1.26665H12.0667V3.19256C12.0666 3.6005 11.9458 3.99945 11.7195 4.33885L9.27895 7.99998L11.7195 11.6612C11.9458 12.0006 12.0666 12.3995 12.0667 12.8074V14.7333H3.9334V12.8073C3.93348 12.3994 4.05433 12.0005 4.28064 11.6611L6.72115 7.99998L4.2806 4.33879C4.05428 3.99938 3.93348 3.6005 3.9334 3.19256V1.26665ZM10.7772 12.2904L8.00002 8.12504L5.22402 12.2888C5.1215 12.4422 5.06675 12.6228 5.0667 12.8073V13.6H10.9334L10.9334 12.8073L10.9334 12.8064C10.9331 12.6228 10.8788 12.4433 10.7772 12.2904ZM9.408 12.4H6.59216L8.00004 10.2883L9.408 12.4Z" fill="currentColor"></path></svg>
                                </TooltipTrigger>
                                <TooltipContent theme="Dark" supportingText={false} arrowPosition="Top center" className="max-w-[320px] p-4">
                                    <TooltipTitle theme="Dark" className="font-semibold text-white mb-2 text-wrap">
                                        Se eliminará automáticamente el {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(db.autoDeleteAt))}
                                    </TooltipTitle>
                                    <p className="text-[13px] text-zinc-400 font-normal leading-relaxed">
                                        Esta rama no se puede proteger, establecer como predeterminada ni tener ramas secundarias. La expiración se restablece al restablecerse desde la rama principal.
                                    </p>
                                    <a href="https://neon.com/docs/guides/branch-expiration" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-medium text-[13px] mt-2 inline-block">
                                        Más información
                                    </a>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <div className="w-[8%] min-w-[125px] max-w-[150px] text-[13px] text-zinc-400 truncate pr-2 text-left">
                    {db.parentTimelineId ? project.branches?.find(b => b.timelineId === db.parentTimelineId)?.name || 'Producción' : 'Producción'}
                </div>
                <div className="w-[15%] min-w-[150px] text-[13px] text-zinc-400 text-left">{metrics?.computeCuHr || '0.00'} CU-hrs</div>
                <div className="w-[18%] min-w-[180px] flex items-center gap-2 text-[13px] text-zinc-500 opacity-50 cursor-not-allowed justify-start text-left">
                    <span className="font-medium">.25 ↔ 2 CU</span>
                    <span className="flex items-center gap-1.5 text-[11px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                        Inactivo
                    </span>
                </div>
                <div className="w-[12%] min-w-[120px] text-[13px] text-white text-left font-medium">
                    {db.logicalSize !== undefined ? formatBytes(db.logicalSize) : '234.57 kB'}
                </div>
                <div className="w-[12%] min-w-[125px] max-w-[225px] flex items-center justify-start gap-2 text-left">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-black font-bold border border-green-600">
                        {db.createdBy ? db.createdBy.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-[13px] text-zinc-300">{db.createdBy || 'Usuario'}</span>
                </div>
                <div className="w-[12%] min-w-[190px] text-[13px] text-zinc-400 text-left">
                    {new Intl.DateTimeFormat('es-ES', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(db.createdAt))}
                </div>
            </div>

            <div className="relative pl-4" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-all opacity-0 group-hover:opacity-100"
                >
                    <MoreVertical size={16} />
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 top-8 z-50 w-56 py-1.5 bg-[#1c1c1c] border border-zinc-800 rounded-lg shadow-2xl origin-top-right">
                        {db.autoDeleteAt ? (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-500 cursor-not-allowed justify-start cursor-help bg-transparent text-left">
                                            <span className="w-4 h-4 flex items-center justify-center opacity-50"><svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 17" role="img" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M4.67 3.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-3 1.5a3 3 0 1 1 5.18 2.06c.5.62 1.21 1.03 2 1.16a3 3 0 1 1-.15 1.5 4.7 4.7 0 0 1-3.12-1.85l-.16.04v2.2a3 3 0 1 1-1.5 0V7.6a3 3 0 0 1-2.25-2.9m1.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m7-3.74a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0" clipRule="evenodd"></path></svg></span> Crear rama secundaria
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent theme="Dark" supportingText={false} side="left" align="center">
                                        <TooltipTitle theme="Dark" className="max-w-[280px] text-wrap text-center font-normal">
                                            Las ramas con fecha de vencimiento no pueden tener ramas hijas
                                        </TooltipTitle>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <button onClick={() => handleMenuClick('create-child')} className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-left">
                                <span className="w-4 h-4 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 17" role="img" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M4.67 3.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-3 1.5a3 3 0 1 1 5.18 2.06c.5.62 1.21 1.03 2 1.16a3 3 0 1 1-.15 1.5 4.7 4.7 0 0 1-3.12-1.85l-.16.04v2.2a3 3 0 1 1-1.5 0V7.6a3 3 0 0 1-2.25-2.9m1.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m7-3.74a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0" clipRule="evenodd"></path></svg></span> Crear rama secundaria
                            </button>
                        )}
                        {isDefaultBranch ? (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-500 cursor-not-allowed justify-start cursor-help bg-transparent text-left">
                                            <span className="w-4 h-4 flex items-center justify-center opacity-50"><svg width="16px" height="16px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M1.7334 0.0666504H14.2667V1.26665H13.2667V3.19265C13.2666 3.83748 13.0757 4.46794 12.718 5.00445L10.7211 7.99998L12.7179 10.9955C13.0756 11.532 13.2666 12.1624 13.2667 12.8072V14.7333H14.2667V15.9333H1.7334V14.7333H2.7334V12.8073C2.7335 12.1625 2.92445 11.532 3.2822 10.9955L5.27898 7.99998L3.2822 5.00452C2.92445 4.468 2.7335 3.8376 2.7334 3.19274V1.26665H1.7334V0.0666504ZM3.9334 1.26665H12.0667V3.19256C12.0666 3.6005 11.9458 3.99945 11.7195 4.33885L9.27895 7.99998L11.7195 11.6612C11.9458 12.0006 12.0666 12.3995 12.0667 12.8074V14.7333H3.9334V12.8073C3.93348 12.3994 4.05433 12.0005 4.28064 11.6611L6.72115 7.99998L4.2806 4.33879C4.05428 3.99938 3.93348 3.6005 3.9334 3.19256V1.26665ZM10.7772 12.2904L8.00002 8.12504L5.22402 12.2888C5.1215 12.4422 5.06675 12.6228 5.0667 12.8073V13.6H10.9334L10.9334 12.8073L10.9334 12.8064C10.9331 12.6228 10.8788 12.4433 10.7772 12.2904ZM9.408 12.4H6.59216L8.00004 10.2883L9.408 12.4Z" fill="currentColor"></path></svg></span> Establecer vencimiento
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent theme="Dark" supportingText={false} side="left" align="center">
                                        <TooltipTitle theme="Dark" className="max-w-[280px] text-wrap text-center font-normal">
                                            La rama predeterminada no puede tener fecha de vencimiento
                                        </TooltipTitle>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <button onClick={() => handleMenuClick('set-expiration')} className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-left">
                                <span className="w-4 h-4 flex items-center justify-center"><svg width="16px" height="16px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M1.7334 0.0666504H14.2667V1.26665H13.2667V3.19265C13.2666 3.83748 13.0757 4.46794 12.718 5.00445L10.7211 7.99998L12.7179 10.9955C13.0756 11.532 13.2666 12.1624 13.2667 12.8072V14.7333H14.2667V15.9333H1.7334V14.7333H2.7334V12.8073C2.7335 12.1625 2.92445 11.532 3.2822 10.9955L5.27898 7.99998L3.2822 5.00452C2.92445 4.468 2.7335 3.8376 2.7334 3.19274V1.26665H1.7334V0.0666504ZM3.9334 1.26665H12.0667V3.19256C12.0666 3.6005 11.9458 3.99945 11.7195 4.33885L9.27895 7.99998L11.7195 11.6612C11.9458 12.0006 12.0666 12.3995 12.0667 12.8074V14.7333H3.9334V12.8073C3.93348 12.3994 4.05433 12.0005 4.28064 11.6611L6.72115 7.99998L4.2806 4.33879C4.05428 3.99938 3.93348 3.6005 3.9334 3.19256V1.26665ZM10.7772 12.2904L8.00002 8.12504L5.22402 12.2888C5.1215 12.4422 5.06675 12.6228 5.0667 12.8073V13.6H10.9334L10.9334 12.8073L10.9334 12.8064C10.9331 12.6228 10.8788 12.4433 10.7772 12.2904ZM9.408 12.4H6.59216L8.00004 10.2883L9.408 12.4Z" fill="currentColor"></path></svg></span> {db.autoDeleteAt ? 'Caducidad de la actualización' : 'Establecer vencimiento'}
                            </button>
                        )}
                        {isDefaultBranch ? (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-500 cursor-not-allowed justify-start cursor-help bg-transparent text-left">
                                            <span className="w-4 h-4 flex items-center justify-center opacity-50"><svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 16 16" role="img" aria-hidden="true"><path fill="currentColor" d="M12.75 1a2.25 2.25 0 0 1 .75 4.37v5.26a2.25 2.25 0 1 1-1.5 0V5.37A2.25 2.25 0 0 1 12.75 1M3.25.99A2.25 2.25 0 0 1 4 5.36v5.26a2.25 2.25 0 1 1-1.5 0V5.36A2.25 2.25 0 0 1 3.25.99M12.75 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5m-9.5-.01a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5M11.49 8l-3.35 3.35-1.06-1.06 1.54-1.54h-3.9v-1.5h3.9L7.08 5.71l1.06-1.06zm1.26-5.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5m-9.5-.01a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5"></path></svg></span> Restablecer desde el padre
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent theme="Dark" supportingText={false} side="left" align="center">
                                        <TooltipTitle theme="Dark" className="max-w-[280px] text-wrap text-center font-normal">
                                            No se puede restablecer la rama predeterminada. Establezca otra rama como predeterminada y vuelva a intentarlo.
                                        </TooltipTitle>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <button onClick={() => handleMenuClick('reset-from-parent')} className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-left">
                                <span className="w-4 h-4 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 16 16" role="img" aria-hidden="true"><path fill="currentColor" d="M12.75 1a2.25 2.25 0 0 1 .75 4.37v5.26a2.25 2.25 0 1 1-1.5 0V5.37A2.25 2.25 0 0 1 12.75 1M3.25.99A2.25 2.25 0 0 1 4 5.36v5.26a2.25 2.25 0 1 1-1.5 0V5.36A2.25 2.25 0 0 1 3.25.99M12.75 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5m-9.5-.01a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5M11.49 8l-3.35 3.35-1.06-1.06 1.54-1.54h-3.9v-1.5h3.9L7.08 5.71l1.06-1.06zm1.26-5.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5m-9.5-.01a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5"></path></svg></span> Restablecer desde el padre
                            </button>
                        )}
                        {isDefaultBranch ? (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-500 cursor-not-allowed justify-start cursor-help bg-transparent text-left">
                                            <span className="w-4 h-4 flex items-center justify-center opacity-50"><svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 17"><path fill="currentColor" fillRule="evenodd" d="M11 2h1.5A1.5 1.5 0 0 1 14 3.5v9A1.5 1.5 0 0 1 12.5 14H11V2Zm-1.5 0v12H4.5A1.5 1.5 0 0 1 3 12.5v-9A1.5 1.5 0 0 1 4.5 2h5ZM7 5h1v1.5H7V5ZM5.5 5H4v1.5h1.5V5Z" clipRule="evenodd"></path></svg></span> Comparar con el padre
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent theme="Dark" supportingText={false} side="left" align="center">
                                        <TooltipTitle theme="Dark" className="max-w-[280px] text-wrap text-center font-normal">
                                            La rama predeterminada no tiene un padre con el cual compararse.
                                        </TooltipTitle>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <button onClick={() => handleMenuClick('compare-parent')} className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-left">
                                <span className="w-4 h-4 flex items-center justify-center opacity-70"><svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 17"><path fill="currentColor" fillRule="evenodd" d="M11 2h1.5A1.5 1.5 0 0 1 14 3.5v9A1.5 1.5 0 0 1 12.5 14H11V2Zm-1.5 0v12H4.5A1.5 1.5 0 0 1 3 12.5v-9A1.5 1.5 0 0 1 4.5 2h5ZM7 5h1v1.5H7V5ZM5.5 5H4v1.5h1.5V5Z" clipRule="evenodd"></path></svg></span> Comparar con el padre
                            </button>
                        )}
                        {isDefaultBranch ? (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-500 cursor-not-allowed justify-start cursor-help bg-transparent text-left">
                                            <span className="w-4 h-4 flex items-center justify-center opacity-50"><svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 17" role="img" aria-hidden="true"><g clipPath="url(#72776f-a)"><path fill="currentColor" fillRule="evenodd" d="M2.33 2.62c0-.41.34-.75.75-.75h10.5c.42 0 .75.34.75.75v7.47c0 2-1.03 3.84-2.72 4.89l-2.88 1.78a.8.8 0 0 1-.8 0l-2.87-1.78a5.8 5.8 0 0 1-2.73-4.9zm1.5.75v6.72c0 1.47.76 2.84 2.02 3.61l2.48 1.54 2.49-1.54a4.3 4.3 0 0 0 2.01-3.61V3.37zm6.22 2.97 1.06 1.07-3.53 3.53L5.55 8.9l1.06-1.07.97.97z" clipRule="evenodd"></path></g><defs><clipPath id="72776f-a"><path d="M.33.87h16v16h-16z"></path></clipPath></defs></svg></span> Establecer como protegido
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent theme="Dark" supportingText={false} side="left" align="center">
                                        <TooltipTitle theme="Dark" className="max-w-[280px] text-wrap text-center font-normal">
                                            Plan de actualización para habilitar soporte para sucursales protegidas.
                                        </TooltipTitle>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : db.autoDeleteAt ? (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-500 cursor-not-allowed justify-start cursor-help bg-transparent text-left">
                                            <span className="w-4 h-4 flex items-center justify-center opacity-50"><svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 17" role="img" aria-hidden="true"><g clipPath="url(#72776f-a)"><path fill="currentColor" fillRule="evenodd" d="M2.33 2.62c0-.41.34-.75.75-.75h10.5c.42 0 .75.34.75.75v7.47c0 2-1.03 3.84-2.72 4.89l-2.88 1.78a.8.8 0 0 1-.8 0l-2.87-1.78a5.8 5.8 0 0 1-2.73-4.9zm1.5.75v6.72c0 1.47.76 2.84 2.02 3.61l2.48 1.54 2.49-1.54a4.3 4.3 0 0 0 2.01-3.61V3.37zm6.22 2.97 1.06 1.07-3.53 3.53L5.55 8.9l1.06-1.07.97.97z" clipRule="evenodd"></path></g><defs><clipPath id="72776f-a"><path d="M.33.87h16v16h-16z"></path></clipPath></defs></svg></span> Establecer como protegido
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent theme="Dark" supportingText={false} side="left" align="center">
                                        <TooltipTitle theme="Dark" className="max-w-[280px] text-wrap text-center font-normal">
                                            Las ramas con fecha de vencimiento no se pueden proteger
                                        </TooltipTitle>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <button onClick={() => handleMenuClick('set-protected')} className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-left">
                                <span className="w-4 h-4 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 17" role="img" aria-hidden="true"><g clipPath="url(#72776f-a)"><path fill="currentColor" fillRule="evenodd" d="M2.33 2.62c0-.41.34-.75.75-.75h10.5c.42 0 .75.34.75.75v7.47c0 2-1.03 3.84-2.72 4.89l-2.88 1.78a.8.8 0 0 1-.8 0l-2.87-1.78a5.8 5.8 0 0 1-2.73-4.9zm1.5.75v6.72c0 1.47.76 2.84 2.02 3.61l2.48 1.54 2.49-1.54a4.3 4.3 0 0 0 2.01-3.61V3.37zm6.22 2.97 1.06 1.07-3.53 3.53L5.55 8.9l1.06-1.07.97.97z" clipRule="evenodd"></path></g><defs><clipPath id="72776f-a"><path d="M.33.87h16v16h-16z"></path></clipPath></defs></svg></span> Establecer como protegido
                            </button>
                        )}
                        {isDefaultBranch ? (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-500 cursor-not-allowed justify-start cursor-help bg-transparent text-left">
                                            <span className="w-4 h-4 flex items-center justify-center opacity-50"><svg width="16px" height="16px" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M13.8353 4.05383L6.99993 0.107422L0.164551 4.05383V11.9467L6.99993 15.8931L13.8353 11.9467V4.05383ZM1.36455 11.2538V4.74665L6.99993 1.49306L12.6353 4.74665V11.2538L6.99993 14.5074L1.36455 11.2538ZM6.03993 11.2326L11.0483 6.41688L10.2166 5.55188L6.03993 9.56787L3.78329 7.39803L2.95156 8.26303L6.03993 11.2326Z" fill="currentColor"></path></svg></span> Establecer como predeterminado
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent theme="Dark" supportingText={false} side="left" align="center">
                                        <TooltipTitle theme="Dark" className="max-w-[280px] text-wrap text-center font-normal">
                                            No puedes establecer esta rama como predeterminada. Ya es una rama predeterminada.
                                        </TooltipTitle>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : db.autoDeleteAt ? (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-500 cursor-not-allowed justify-start cursor-help bg-transparent text-left">
                                            <span className="w-4 h-4 flex items-center justify-center opacity-50"><svg width="16px" height="16px" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M13.8353 4.05383L6.99993 0.107422L0.164551 4.05383V11.9467L6.99993 15.8931L13.8353 11.9467V4.05383ZM1.36455 11.2538V4.74665L6.99993 1.49306L12.6353 4.74665V11.2538L6.99993 14.5074L1.36455 11.2538ZM6.03993 11.2326L11.0483 6.41688L10.2166 5.55188L6.03993 9.56787L3.78329 7.39803L2.95156 8.26303L6.03993 11.2326Z" fill="currentColor"></path></svg></span> Establecer como predeterminado
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent theme="Dark" supportingText={false} side="left" align="center">
                                        <TooltipTitle theme="Dark" className="max-w-[280px] text-wrap text-center font-normal">
                                            Las ramas con fecha de vencimiento no se pueden establecer como predeterminadas
                                        </TooltipTitle>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <button onClick={() => handleMenuClick('set-default')} className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-left">
                                <span className="w-4 h-4 flex items-center justify-center"><svg width="16px" height="16px" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M13.8353 4.05383L6.99993 0.107422L0.164551 4.05383V11.9467L6.99993 15.8931L13.8353 11.9467V4.05383ZM1.36455 11.2538V4.74665L6.99993 1.49306L12.6353 4.74665V11.2538L6.99993 14.5074L1.36455 11.2538ZM6.03993 11.2326L11.0483 6.41688L10.2166 5.55188L6.03993 9.56787L3.78329 7.39803L2.95156 8.26303L6.03993 11.2326Z" fill="currentColor"></path></svg></span> Establecer como predeterminado
                            </button>
                        )}
                        <button onClick={() => handleMenuClick('rename')} className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-left mt-1 border-t border-zinc-800 pt-1.5">
                            <span className="w-4 h-4 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 17" role="img" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M12.74 2.95c.1-.1.26-.1.35 0l1.09 1.08c.1.1.1.26 0 .36L12.67 5.9l-1.44-1.44zm-2.57 2.57-7 7v1.44H4.6l7-7zm3.98-3.63a1.75 1.75 0 0 0-2.47 0l-9.8 9.8a.8.8 0 0 0-.21.52v2.5c0 .41.33.75.75.75h2.5q.31 0 .53-.22l9.79-9.8c.68-.68.68-1.78 0-2.47z" clipRule="evenodd"></path></svg></span> Renombrar
                        </button>
                        {isDefaultBranch ? (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-zinc-600 cursor-not-allowed justify-start cursor-help">
                                            <span className="w-4 h-4 flex items-center justify-center opacity-40"><svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 17" role="img" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M6.33.25c-.32 0-.6.2-.7.51l-.84 2.49H1.33v1.5h1.08l1.18 10.83c.04.38.36.67.74.67h8c.39 0 .7-.29.75-.67l1.18-10.83h1.07v-1.5h-3.45L11.03.76a.75.75 0 0 0-.7-.51zm3.96 3-.5-1.5H6.87l-.5 1.5zm-4.96 1.5H3.92l1.09 10h6.65l1.09-10z" clipRule="evenodd"></path></svg></span> Borrar
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent theme="Dark" supportingText={false} side="left" align="center">
                                        <TooltipTitle theme="Dark" className="max-w-[280px] text-wrap text-center font-normal">
                                            No se puede eliminar la rama predeterminada. Para eliminarla, establezca otra rama como predeterminada.
                                        </TooltipTitle>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <button onClick={() => handleMenuClick('delete')} className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-[#f87171] hover:bg-red-900/40 transition-colors text-left font-medium">
                                <span className="w-4 h-4 flex items-center justify-center opacity-80"><svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 17" role="img" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M6.33.25c-.32 0-.6.2-.7.51l-.84 2.49H1.33v1.5h1.08l1.18 10.83c.04.38.36.67.74.67h8c.39 0 .7-.29.75-.67l1.18-10.83h1.07v-1.5h-3.45L11.03.76a.75.75 0 0 0-.7-.51zm3.96 3-.5-1.5H6.87l-.5 1.5zm-4.96 1.5H3.92l1.09 10h6.65l1.09-10z" clipRule="evenodd"></path></svg></span> Borrar
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

interface ProjectDetail {
    id: string;
    name: string;
    region: string;
    status: string;
    createdAt: string;
    branches: Branch[];
}

export default function BranchesPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);
    const router = useRouter();

    const [modalOpen, setModalOpen] = useState(false);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [branchToRename, setBranchToRename] = useState<Branch | null>(null);

    const [setDefaultModalOpen, setSetDefaultModalOpen] = useState(false);
    const [branchToSetDefault, setBranchToSetDefault] = useState<Branch | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

    const fetchProject = async () => {
        try {
            const data = await ApiClient.get(`/projects/${slug}`);
            setProject(data.project);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const fetchMetrics = async () => {
        try {
            const data = await ApiClient.get(`/projects/${slug}/state`);
            setMetrics(data.metrics);
        } catch (e) {
            console.error('Failed to fetch metrics:', e);
        }
    }

    useEffect(() => {
        if (!slug) return;
        fetchProject();
        fetchMetrics();
        const interval = setInterval(fetchProject, 5000);
        return () => clearInterval(interval);
    }, [slug]);

    if (loading) return <div className="p-10 text-zinc-400">Loading branches...</div>;
    if (!project || !project.branches) return <div className="p-10 text-red-500">Project not found</div>;

    const getDataTypeDescription = (type: string) => {
        switch (type) {
            case 'current': return 'Include data from the parent branch up to this moment.';
            case 'past': return 'Include data from the parent branch up to a specific date and time.';
            case 'schema': return 'Copy the schema only — no data will be included. You have 3.22 GB remaining space.';
            case 'anonymized': return 'Protect sensitive data with configurable masking rules. Learn more';
            default: return '';
        }
    };

    const handleRenameBranch = async (newName: string) => {
        if (!branchToRename) return;
        try {
            await ApiClient.patch(`/projects/${slug}/branches/${branchToRename.id}`, { name: newName });
            await fetchProject();
        } catch (e: any) {
            console.error('Failed to rename branch:', e);
            alert(`Failed to rename branch: ${e.message || 'Internal server error'}`);
        } finally {
            setRenameModalOpen(false);
            setBranchToRename(null);
        }
    };

    const handleDeleteBranch = async (branchId: string) => {
        try {
            await ApiClient.delete(`/projects/${slug}/branches/${branchId}`);
            await fetchProject(); // Re-fetch project to update list
            // Automatically switch back to production if the active branch is deleted
        } catch (e: any) {
            console.error('Failed to delete branch:', e);
            alert(`Failed to delete branch: ${e.message || 'Internal server error'}`);
        }
    };

    const handleRowAction = async (action: string, db: Branch) => {
        if (action === 'create-child') {
            setModalOpen(true);
        } else if (action === 'rename') {
            setBranchToRename(db);
            setRenameModalOpen(true);
        } else if (action === 'set-default') {
            setBranchToSetDefault(db);
            setSetDefaultModalOpen(true);
        } else if (action === 'delete') {
            if (project.branches.length <= 1) {
                alert('Cannot delete the last branch of a project.');
                return;
            }
            setBranchToDelete(db);
            setDeleteModalOpen(true);
        } else {
            console.log(`Action ${action} clicked for branch ${db.name}`);
            // Other actions can be implemented here later
        }
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto p-10 relative overflow-visible min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <h1 className="text-[28px] font-bold text-white tracking-tight">{project.branches.length} Branch{project.branches.length !== 1 ? 'es' : ''}</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-[14px] font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors shadow-sm"
                    >
                        <GitBranch size={16} /> Nueva Branch
                    </button>
                </div>
            </div>

            <p className="text-[14px] text-zinc-400 mb-8">
                Ramifica tu base de datos al instante para acelerar el desarrollo, realizar pruebas seguras y tener flujos de CI/CD impecables. <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Más información.</a>
            </p>

            {/* Metrics Block */}
            <TooltipProvider delayDuration={200}>
                <div className="border border-zinc-800 rounded-xl flex flex-col mb-8 bg-[#0a0a0a]">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
                        <div className="p-5">
                            <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 mb-1">
                                Branches
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button className="text-[11px] border border-zinc-700 rounded-full w-3.5 h-3.5 flex items-center justify-center cursor-help hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">i</button>
                                    </TooltipTrigger>
                                    <TooltipContent theme="Dark" supportingText={true} arrowPosition="Bottom center">
                                        <TooltipTitle theme="Dark">Sucursales (Branches)</TooltipTitle>
                                        <TooltipDescription theme="Dark">Número de sucursales en este proyecto</TooltipDescription>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="text-[20px] font-semibold text-white">{project.branches?.length || 0} <span className="text-[16px] text-zinc-500 font-medium">/ 10</span></div>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 mb-1">
                                Computor
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button className="text-[11px] border border-zinc-700 rounded-full w-3.5 h-3.5 flex items-center justify-center cursor-help hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">i</button>
                                    </TooltipTrigger>
                                    <TooltipContent theme="Dark" supportingText={true} arrowPosition="Bottom center">
                                        <TooltipTitle theme="Dark">Cómputo</TooltipTitle>
                                        <TooltipDescription theme="Dark">Uso total del tiempo de cómputo para este proyecto</TooltipDescription>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="text-[20px] font-semibold text-white">{metrics?.computeCuHr || '0.00'} <span className="text-[16px] text-zinc-500 font-medium">/ 100 CU-hrs</span></div>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 mb-1">
                                Almacenamiento
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button className="text-[11px] border border-zinc-700 rounded-full w-3.5 h-3.5 flex items-center justify-center cursor-help hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">i</button>
                                    </TooltipTrigger>
                                    <TooltipContent theme="Dark" supportingText={true} arrowPosition="Bottom center">
                                        <TooltipTitle theme="Dark">Almacenamiento (Storage)</TooltipTitle>
                                        <TooltipDescription theme="Dark">Uso total de almacenamiento para este proyecto</TooltipDescription>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="text-[20px] font-semibold text-white">{metrics?.storageGb || '0.00'} <span className="text-[16px] text-zinc-500 font-medium">/ 0.5 GB</span></div>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 mb-1">
                                Transferencia de red
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button className="text-[11px] border border-zinc-700 rounded-full w-3.5 h-3.5 flex items-center justify-center cursor-help hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">i</button>
                                    </TooltipTrigger>
                                    <TooltipContent theme="Dark" supportingText={true} arrowPosition="Bottom right">
                                        <TooltipTitle theme="Dark">Transferencia (Egress)</TooltipTitle>
                                        <TooltipDescription theme="Dark">Transferencia total de datos de red para este proyecto</TooltipDescription>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="text-[20px] font-semibold text-white">{metrics?.networkTransferGb || '0.00'} <span className="text-[16px] text-zinc-500 font-medium">/ 5 GB</span></div>
                        </div>
                    </div>
                    <div className="px-5 py-3 border-t border-zinc-800 text-[12px] text-zinc-400 bg-transparent rounded-b-xl">
                        Uso desde {new Date(project.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}. Las métricas pueden tener un retraso de una hora y no se actualizan para proyectos inactivos. <a href="https://neon.tech/docs/manage/billing" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Más información.</a>
                    </div>
                </div>
            </TooltipProvider>

            <div className="w-full mb-6">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full px-4 py-[9px] pl-10 text-[14px] bg-transparent border border-zinc-800/80 rounded-md text-white focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                </div>
            </div>

            <div className="border-t border-zinc-800/80 mt-2 pb-10">
                <div className="flex items-center px-5 py-3.5 text-[13px] font-bold tracking-wide text-white border-b border-zinc-800/80 min-w-max text-left">
                    <div className="w-[18%] min-w-[250px] max-w-[300px] flex items-center justify-start gap-2 text-left">
                        Branch <span className="text-zinc-500">↑</span>
                    </div>
                    <div className="w-[8%] min-w-[125px] max-w-[150px] text-left">Rama padre</div>
                    <div className="w-[15%] min-w-[150px] text-left">Computor</div>
                    <div className="w-[18%] min-w-[180px] text-left">Computor Primario</div>
                    <div className="w-[12%] min-w-[120px] text-left">Almacenamiento</div>
                    <div className="w-[12%] min-w-[125px] max-w-[225px] text-left">Creado por</div>
                    <div className="w-[12%] min-w-[190px] text-left">Ultima Actividad</div>
                    <div className="pl-4 w-[62px] max-w-[62px]"></div> {/* Space for more icon */}
                </div>

                <div className="flex flex-col min-w-max">
                    {[...(project.branches || [])].sort((a, b) => {
                        const aDefault = a.isDefault || a.type === 'production';
                        const bDefault = b.isDefault || b.type === 'production';
                        if (aDefault && !bDefault) return -1;
                        if (!aDefault && bDefault) return 1;
                        return a.name.localeCompare(b.name);
                    }).map((db, idx) => (
                        <BranchRow key={db.id} db={db} project={project} slug={slug} metrics={metrics} onAction={handleRowAction} />
                    ))}
                </div>
            </div>

            <CreateBranchModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                projectSlug={slug}
                branches={project.branches || []}
                onSuccess={() => window.location.reload()}
            />

            <RenameBranchModal
                isOpen={renameModalOpen}
                onClose={() => {
                    setRenameModalOpen(false);
                    setBranchToRename(null);
                }}
                branch={branchToRename}
                onSuccess={handleRenameBranch}
            />

            <SetDefaultBranchModal
                isOpen={setDefaultModalOpen}
                onClose={() => {
                    setSetDefaultModalOpen(false);
                    setBranchToSetDefault(null);
                }}
                branch={branchToSetDefault}
                projectId={slug}
                onSuccess={() => window.location.reload()}
            />

            <DeleteBranchModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setBranchToDelete(null);
                }}
                branch={branchToDelete}
                onConfirm={async () => {
                    if (branchToDelete) {
                        await handleDeleteBranch(branchToDelete.id);
                    }
                }}
            />
        </div>
    );
}

function InfoIcon(props: any) {
    return <svg {...props} width="16" height="16" viewBox="0 0 16 17" fill="none" className={`shrink-0 text-zinc-400 ${props.className || ''}`}><path fill="currentColor" d="M8 .54a8 8 0 1 1 0 16 8 8 0 0 1 0-16m0 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13m.75 10.67h-1.5v-5h1.5zM8 5.07a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5"></path></svg>;
}

function SettingsIcon(props: any) {
    return <svg {...props} width="16" height="16" viewBox="0 0 17 16" fill="none" className={`shrink-0 text-zinc-400 ${props.className || ''}`}><g clipPath="url(#abb823-a)"><path fill="currentColor" fillRule="evenodd" d="m7.68 3.33.6-1.82h.7l.6 1.82q.13.35.47.47.52.18.97.47c.2.13.45.16.67.07l1.8-.66q.23.26.44.55l-1.05 1.6a.8.8 0 0 0-.08.67q.18.5.24 1.05.04.36.36.56l1.64 1q-.06.33-.16.68l-1.9.18a.8.8 0 0 0-.57.35q-.3.46-.68.84a.8.8 0 0 0-.22.64l.26 1.9q-.3.16-.64.3L9.8 12.62a.8.8 0 0 0-.63-.22 5 5 0 0 1-1.08 0 .8.8 0 0 0-.63.22L6.13 14q-.33-.14-.63-.3l.25-1.9a.8.8 0 0 0-.22-.64 5 5 0 0 1-.67-.84.8.8 0 0 0-.57-.35l-1.9-.18-.17-.69 1.65-.99q.3-.2.36-.56.05-.55.24-1.05a.8.8 0 0 0-.08-.67l-1.05-1.6q.2-.3.44-.55l1.8.66a.7.7 0 0 0 .66-.07q.45-.3.97-.47.35-.12.47-.47M8.63 0q-.5 0-1 .06A.8.8 0 0 0 7 .57l-.64 1.95-.61.3-1.92-.72a.8.8 0 0 0-.79.17q-.72.7-1.25 1.57a.8.8 0 0 0 .01.8l1.13 1.71-.15.66-1.76 1.06a.8.8 0 0 0-.36.71q.1 1.03.45 1.97c.1.27.34.46.63.49l2.04.19q.2.28.43.52L3.95 14c-.04.28.09.57.33.72q.85.55 1.81.88c.28.09.58.02.78-.2l1.42-1.47h.68l1.42 1.48c.2.2.5.28.78.19a8 8 0 0 0 1.81-.88.8.8 0 0 0 .34-.72l-.27-2.04q.22-.24.42-.52l2.04-.2a.8.8 0 0 0 .64-.48q.35-.94.44-1.97a.8.8 0 0 0-.36-.71L14.48 7l-.15-.66 1.12-1.71a.8.8 0 0 0 .01-.8 8 8 0 0 0-1.25-1.57.8.8 0 0 0-.78-.17l-1.92.71-.61-.3-.64-1.94a.8.8 0 0 0-.62-.5 8 8 0 0 0-1-.07M7.15 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m1.5-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6" clipRule="evenodd"></path></g><defs><clipPath id="abb823-a"><path fill="#fff" d="M.67 0h16v16h-16z"></path></clipPath></defs></svg>;
}

function GithubIcon(props: any) {
    return <svg {...props} width="14" height="14" viewBox="0 0 48 48" fill="none" className={`shrink-0 text-current ${props.className || ''}`}><path d="M28.48 34.8c1.3-.3 2.57-.52 3.8-.9 3.97-1.22 6.16-3.99 6.8-8.02.31-1.9.41-3.8-.09-5.7a8.65 8.65 0 0 0-1.83-3.48c-.22-.25-.25-.45-.15-.76a8.98 8.98 0 0 0-.22-5.58c-.12-.36-.33-.53-.67-.45-.96.21-1.95.36-2.85.73-1 .4-1.9 1.03-2.86 1.52-.24.13-.58.2-.83.14-3.7-.88-7.4-.9-11.08.01-.38.1-.64.03-.95-.17-1.55-1-3.16-1.89-5.03-2.19-1.02-.16-1.15-.1-1.42.85a9.13 9.13 0 0 0-.08 5.2.82.82 0 0 1-.15.65 10.03 10.03 0 0 0-2.14 7.5 15 15 0 0 0 .9 4.32c1.24 3.09 3.62 4.83 6.76 5.66 1 .26 2.04.42 3.13.64a5.7 5.7 0 0 0-1.4 3.02c-.01.11-.22.23-.37.3-2.68 1.12-5.04.36-6.6-2.1a4.95 4.95 0 0 0-3.38-2.48c-.34-.06-.72 0-1.07.07-.43.1-.47.41-.2.73.19.2.4.41.65.55a5.63 5.63 0 0 1 2.52 3.07c.99 2.89 3.85 3.94 6.62 3.66l1.67-.2.05.4.03 3.75c0 1.21-.72 1.72-1.88 1.32a23.46 23.46 0 0 1-7.4-4.17c-4.73-3.96-7.67-8.97-8.5-15.06C-.89 19.1 1.76 11.82 8.18 6A22.64 22.64 0 0 1 20.45.27c6.76-.96 12.9.63 18.29 4.82a23.27 23.27 0 0 1 8.87 14.64A24.1 24.1 0 0 1 31.8 46.87c-1.15.4-1.86-.13-1.86-1.35l.03-6.26c.01-1.65-.3-3.2-1.49-4.46Z" fill="currentColor"></path></svg>;
}

function VercelIcon(props: any) {
    return <svg {...props} width="14" height="14" viewBox="0 0 46 46" fill="currentColor" className={`shrink-0 ${props.className || ''}`}><path fillRule="evenodd" clipRule="evenodd" d="M46 23a23 23 0 1 1-46 0 23 23 0 0 1 46 0Zm-34.4 7.52h22.8L23 10.57l-1.42 2.5-9.98 17.45Z" fill="currentColor"></path></svg>;
}
