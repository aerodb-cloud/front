'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import Link from 'next/link';
import { useBranch } from '@/components/BranchContext';
import { CreateBranchModal } from '@/components/CreateBranchModal';
import { BranchRolesAndDatabases } from '@/components/BranchRolesAndDatabases';
import { Copy, Check, Trash2, Database, Terminal, Link as LinkIcon, Download, UserPlus, TerminalSquare, Code, Cpu, Info, RefreshCcw, GitBranch, Clock, Activity, Settings, Workflow, Play, FileCode, Plus, Search, ChevronRight, ChevronDown, Table2, ShieldAlert, Heart, BookText, X } from 'lucide-react';
import ImportProgressBanner from '@/components/ImportProgressBanner';

interface ProjectDetail {
    id: string;
    name: string;
    region: string;
    status: string;
    createdAt: string;
    databases: {
        id: string;
        name: string;
        pgVersion: number;
        createdAt: string;
    }[];
    branches?: {
        id: string;
        name: string;
        type: string;
        createdAt: string;
    }[];
    apiKeys?: {
        id: string;
        keyId: string;
        name: string;
    }[];
}

export default function BranchDetailPage({ params }: { params: Promise<{ slug: string, branchName: string }> }) {
    const { slug, branchName } = use(params);
    const branchId = branchName; // Use branchName as the identifier for backend calls that now support names
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [connectionString, setConnectionString] = useState('');
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab') as 'overview' | 'sql';
    const { activeBranch, branches, setActiveBranch } = useBranch();

    useEffect(() => {
        if (branches.length > 0 && branchId) {
            const currentRouteBranch = branches.find((b: any) => b.id === branchId || b.name === branchId);
            if (currentRouteBranch && (!activeBranch || (activeBranch.id !== branchId && activeBranch.name !== branchId))) {
                setActiveBranch(currentRouteBranch);
            }
        }
    }, [branches, branchId, activeBranch, setActiveBranch]);

    const [activeTab, setActiveTab] = useState<'overview' | 'sql'>(tabParam || 'overview');
    const [subTab, setSubTab] = useState<'computes' | 'roles' | 'children'>('computes');

    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

    const router = useRouter();

    useEffect(() => {
        async function fetchProject() {
            try {
                const data = await ApiClient.get(`/projects/${slug}`);
                setProject(data.project);

                setProject(data.project);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        async function fetchMetrics() {
            try {
                const data = await ApiClient.get(`/projects/${slug}/state`);
                setMetrics(data.metrics);
            } catch (e) {
                console.error('Failed to fetch metrics:', e);
            }
        }

        fetchProject();
        fetchMetrics();

        // Poll every 5 seconds
        const interval = setInterval(fetchProject, 5000);
        return () => clearInterval(interval);
    }, [slug]);

    // Update connection string dynamically when activeBranch or project changes
    useEffect(() => {
        if (!project || !activeBranch) return;
        const host = process.env.NODE_ENV === 'production' ? 'api.aero.local' : 'localhost';
        const dbName = activeBranch.name;

        // Find specific branch key if it exists, otherwise fallback to first available
        const branchKeyName = `Branch Key: ${activeBranch.name}`;
        let apiKey = project.apiKeys?.find((key: any) => key.name === branchKeyName);
        if (!apiKey) apiKey = project.apiKeys?.[0];

        const keyId = apiKey?.keyId || 'ep-xxxx';
        setConnectionString(`postgresql://${keyId}:[YOUR_SECRET]@${host}:5432/${dbName}?sslmode=disable`);
    }, [project, activeBranch]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(connectionString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        // Now handled in settings page
    };

    if (!project || !activeBranch) return <div className="p-10 text-red-500">Proyecto no encontrado</div>;

    const isDefaultBranch = activeBranch?.type === 'production';

    // Default layout for 'overview' and 'settings'
    return (
        <div className="w-full max-w-[1400px] mx-auto p-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-[28px] font-bold text-white tracking-tight mb-2">Resumen de rama</h1>
                    <div className="flex items-center gap-2">
                        {isDefaultBranch ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 17 17" role="img" aria-hidden="true" className="text-zinc-400"><path fill="currentColor" fillRule="evenodd" d="M4.67 3.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-3 1.5a3 3 0 1 1 5.18 2.06c.5.62 1.21 1.03 2 1.16a3 3 0 1 1-.15 1.5 4.7 4.7 0 0 1-3.12-1.85l-.16.04v2.2a3 3 0 1 1-1.5 0V7.6a3 3 0 0 1-2.25-2.9m1.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m7-3.74a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0" clipRule="evenodd"></path></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 17 16" fill="none" role="img" aria-hidden="true" className="text-zinc-400"><path fillRule="evenodd" clipRule="evenodd" d="M3.96875 6.4375C3.96875 7.11896 4.06412 7.73079 4.375 8.16504C4.64917 8.54792 5.19934 8.93749 6.46875 8.9375H8.61328C8.92431 7.61231 10.1112 6.625 11.5312 6.625C13.1881 6.625 14.5312 7.96815 14.5312 9.625C14.5312 11.2819 13.1881 12.625 11.5312 12.625C10.1563 12.625 9.00002 11.6992 8.64551 10.4375H6.46875C4.86341 10.4375 3.78835 9.92076 3.15625 9.03809C2.56096 8.20674 2.46875 7.19344 2.46875 6.4375V3.375H3.96875V6.4375ZM11.5312 8.125C10.7028 8.125 10.0312 8.79657 10.0312 9.625C10.0312 10.4534 10.7028 11.125 11.5312 11.125C12.3597 11.125 13.0312 10.4534 13.0312 9.625C13.0312 8.79657 12.3597 8.125 11.5312 8.125Z" fill="currentColor"></path></svg>
                        )}
                        <span className="text-[14px] text-white font-medium">{activeBranch?.name || 'Loading...'}</span>
                        {isDefaultBranch && (
                            <span className="px-2 py-0.5 text-[11px] font-medium bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700">Predeterminado</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsBranchModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors shadow-sm">
                        <GitBranch size={16} /> Crear rama hija
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white border border-zinc-700 bg-transparent rounded-md hover:bg-zinc-800 transition-colors">
                        <ShieldAlert size={14} className="opacity-70" /> Proteger
                    </button>
                    <button className="flex items-center px-3 py-2 text-sm font-semibold text-white border border-zinc-700 bg-transparent rounded-md hover:bg-zinc-800 transition-colors">
                        Más <span className="ml-2 text-[10px] text-zinc-500">▼</span>
                    </button>
                </div>
            </div>

            {/* Sidebar navigation is handling tab states natively via query parameters. */}

            {activeTab === 'overview' && (
                <div className="flex flex-col gap-6">

                    <ImportProgressBanner slug={slug} branchId={branchId} />

                    {/* Stats Row */}
                    <div className="border border-zinc-800 rounded-xl flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                            <div className="p-5">
                                <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 mb-2">
                                    Cómputo <Info size={12} className="opacity-70" />
                                </div>
                                <div className="text-[20px] font-semibold text-white">{metrics?.computeCuHr || '0.00'} CU-hrs</div>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 mb-2">
                                    Almacenamiento <Info size={12} className="opacity-70" />
                                </div>
                                <div className="text-[20px] font-semibold text-white">{metrics?.storageGb || '0.00'} GB</div>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 mb-2">
                                    Historial <Info size={12} className="opacity-70" />
                                </div>
                                <div className="text-[20px] font-semibold text-white">{metrics?.historyGb || '0.00'} GB</div>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 mb-2">
                                    Transf. de red <Info size={12} className="opacity-70" />
                                </div>
                                <div className="text-[20px] font-semibold text-white">{metrics?.networkTransferGb || '0.00'} GB</div>
                            </div>
                        </div>
                        <div className="px-5 py-4 border-t border-zinc-800 text-[13px] text-zinc-400 bg-transparent rounded-b-xl">
                            Uso desde el 5 de marzo de 2026. Las métricas pueden tener un retraso de una hora y no se actualizan en proyectos inactivos. <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Aprender más.</a>
                        </div>
                    </div>

                    {/* Branch Info Row */}
                    <div className="border border-zinc-800 rounded-xl flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                            <div className="p-5">
                                <div className="text-[13px] font-medium text-zinc-400 mb-2">ID</div>
                                <div className="text-[14px] text-zinc-200 flex items-center gap-2">
                                    {activeBranch?.id || 'br-patient-shadow-acz'}
                                    <Copy size={14} className="text-zinc-500 cursor-pointer hover:text-white transition-colors" />
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="text-[13px] font-medium text-zinc-400 mb-2">Creado el</div>
                                <div className="text-[14px] text-zinc-200">
                                    {activeBranch?.createdAt ? new Date(activeBranch.createdAt).toLocaleString() : 'Loading...'}
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="text-[13px] font-medium text-zinc-400 mb-2">Creado por</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-[#00e599]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sub-tabs area */}
                    <div className="mt-4">
                        <div className="flex items-center gap-8 border-b border-zinc-800 mb-6 px-1">
                            <button
                                onClick={() => setSubTab('computes')}
                                className={`pb-3 text-[14px] font-medium transition-colors ${subTab === 'computes' ? 'text-white border-b-2 border-white font-semibold' : 'text-zinc-400 hover:text-zinc-300'}`}
                            >
                                Cómputos
                            </button>
                            <button
                                onClick={() => setSubTab('roles')}
                                className={`pb-3 text-[14px] font-medium transition-colors ${subTab === 'roles' ? 'text-white border-b-2 border-white font-semibold' : 'text-zinc-400 hover:text-zinc-300'}`}
                            >
                                Roles y Bases de Datos
                            </button>
                            <button
                                onClick={() => setSubTab('children')}
                                className={`pb-3 text-[14px] font-medium transition-colors ${subTab === 'children' ? 'text-white border-b-2 border-white font-semibold' : 'text-zinc-400 hover:text-zinc-300'}`}
                            >
                                Ramas hijas
                            </button>
                        </div>

                        {subTab === 'computes' && (
                            <div className="space-y-4">
                                {/* Primary Compute */}
                                <div className="border border-zinc-800 rounded-xl p-6 bg-transparent flex flex-col md:flex-row justify-between gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1.5fr] gap-8 flex-1 md:items-center">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-[15px] text-white font-medium">Principal</h3>
                                                <div className="w-2 h-2 rounded-full border border-zinc-500 relative ml-1">
                                                    <div className="absolute top-[3px] -left-[1px] w-[8px] h-[1px] bg-zinc-500 rotate-45"></div>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-zinc-700 bg-zinc-900/50">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                                                    <span className="text-[10px] font-bold tracking-wider text-zinc-300 uppercase">Suspendido</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[13px] text-zinc-400 font-mono">
                                                ep-autumn-pond-ac35cuku <Copy size={12} className="cursor-pointer hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-medium text-zinc-400 mb-1">Suspendido</div>
                                            <div className="text-[14px] text-zinc-200">Mar 7, 2026 7:14 am</div>
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-medium text-zinc-400 mb-1">Tamaño</div>
                                            <div className="text-[14px] text-zinc-200 font-medium">.25 ↔ 2 CU</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <button className="px-4 py-2 text-sm font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors">
                                            Conectar
                                        </button>
                                        <button className="px-4 py-2 text-sm font-semibold text-white border border-zinc-700 bg-transparent rounded-md hover:bg-zinc-800 transition-colors">
                                            Editar
                                        </button>
                                        <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                                            <span className="flex flex-col gap-1 items-center justify-center">
                                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Read Replicas */}
                                <div className="border border-zinc-800 rounded-xl p-5 bg-[#161616] flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <Cpu size={20} className="text-[#00e599] mt-0.5 shrink-0" />
                                        <p className="text-[14px] text-zinc-300 leading-relaxed max-w-2xl">
                                            <span className="text-white font-medium">Réplicas de lectura:</span> Escale su aplicación delegando la carga de lectura a una instancia de base de datos de solo lectura.
                                        </p>
                                    </div>
                                    <button className="px-4 py-2 text-sm font-semibold text-white border border-zinc-700 bg-transparent rounded-md hover:bg-zinc-800 transition-colors shrink-0 whitespace-nowrap self-start md:self-center">
                                        Añadir Réplica de Lectura
                                    </button>
                                </div>
                            </div>
                        )}

                        {subTab === 'roles' && (
                            <BranchRolesAndDatabases projectSlug={slug} branchId={branchId as string} />
                        )}

                        {subTab === 'children' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-medium text-white">Ramas Hijas</h2>
                                    <button onClick={() => setIsBranchModalOpen(true)} className="px-4 py-2 text-sm font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors shadow-sm flex items-center gap-2">
                                        <GitBranch size={16} /> Crear rama hija
                                    </button>
                                </div>
                                {(!project.branches || project.branches.length <= 1) ? (
                                    <div className="border border-zinc-800 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
                                        <GitBranch size={48} className="text-zinc-600 mb-4" />
                                        <h3 className="text-lg font-medium text-zinc-200 mb-2">No hay ramas hijas</h3>
                                        <p className="text-sm text-zinc-400 max-w-sm mb-6">Crea una rama hija para aislar tus cambios y experimentar de forma segura con el esquema de tu base de datos mediante Copy-on-Write instantáneo.</p>
                                    </div>
                                ) : (
                                    <div className="border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800">
                                        {project.branches.filter(b => b.type !== 'production').map(branch => (
                                            <div key={branch.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
                                                        {branch.type === 'production' ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 17 17" role="img" aria-hidden="true" className="text-zinc-400"><path fill="currentColor" fillRule="evenodd" d="M4.67 3.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-3 1.5a3 3 0 1 1 5.18 2.06c.5.62 1.21 1.03 2 1.16a3 3 0 1 1-.15 1.5 4.7 4.7 0 0 1-3.12-1.85l-.16.04v2.2a3 3 0 1 1-1.5 0V7.6a3 3 0 0 1-2.25-2.9m1.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m7-3.74a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0" clipRule="evenodd"></path></svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 17 16" fill="none" role="img" aria-hidden="true" className="text-zinc-400"><path fillRule="evenodd" clipRule="evenodd" d="M3.96875 6.4375C3.96875 7.11896 4.06412 7.73079 4.375 8.16504C4.64917 8.54792 5.19934 8.93749 6.46875 8.9375H8.61328C8.92431 7.61231 10.1112 6.625 11.5312 6.625C13.1881 6.625 14.5312 7.96815 14.5312 9.625C14.5312 11.2819 13.1881 12.625 11.5312 12.625C10.1563 12.625 9.00002 11.6992 8.64551 10.4375H6.46875C4.86341 10.4375 3.78835 9.92076 3.15625 9.03809C2.56096 8.20674 2.46875 7.19344 2.46875 6.4375V3.375H3.96875V6.4375ZM11.5312 8.125C10.7028 8.125 10.0312 8.79657 10.0312 9.625C10.0312 10.4534 10.7028 11.125 11.5312 11.125C12.3597 11.125 13.0312 10.4534 13.0312 9.625C13.0312 8.79657 12.3597 8.125 11.5312 8.125Z" fill="currentColor"></path></svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="text-sm font-medium text-zinc-200">{branch.name}</div>
                                                            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#3fc0f0] uppercase bg-[#3fc0f0]/10 rounded-full border border-[#3fc0f0]/20">Vista previa</span>
                                                        </div>
                                                        <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
                                                            {branch.id} <Copy size={12} className="cursor-pointer hover:text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="text-right">
                                                        <div className="text-[13px] font-medium text-zinc-400 mb-1">Creado el</div>
                                                        <div className="text-[13px] text-zinc-200">{new Date(branch.createdAt).toLocaleString()}</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button className="px-3 py-1.5 text-xs font-semibold text-white border border-zinc-700 bg-transparent rounded-md hover:bg-zinc-800 transition-colors">
                                                            Conectar
                                                        </button>
                                                        <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                                                            <Settings size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <CreateBranchModal
                isOpen={isBranchModalOpen}
                onClose={() => setIsBranchModalOpen(false)}
                projectSlug={slug}
                branches={project.branches || []}
                onSuccess={() => window.location.reload()}
            />
        </div>
    );
}
