'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import Link from 'next/link';
import { useBranch } from '@/components/BranchContext';
import ConnectModal from '@/components/ConnectModal';
import { Copy, Check, Link as LinkIcon, Download, Share2, TerminalSquare, Code, Blocks, Activity, GitBranch, Settings, Info, RefreshCcw, ChevronDown, ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTitle, TooltipDescription, TooltipTrigger } from '@/components/ui/tooltip';
import MonitoringChart from './components/MonitoringChart';

interface ProjectDetail {
    id: string;
    slug: string;
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
        isDefault?: boolean;
        isSchemaOnly?: boolean;
    }[];
    apiKeys?: {
        id: string;
        keyId: string;
        name: string;
    }[];
}

function ProgressBar({ value, max }: { value: number; max: number }) {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));
    let color = 'bg-[#00e599]';
    if (percent >= 100) color = 'bg-red-500';
    else if (percent >= 80) color = 'bg-yellow-500';

    return (
        <div className="w-full bg-zinc-800 rounded-full h-1 mt-4 overflow-hidden">
            <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }}></div>
        </div>
    );
}

export default function ProjectDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [connectionString, setConnectionString] = useState('');
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);
    const [plan, setPlan] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(true);
    const { activeBranch } = useBranch();
    const router = useRouter();

    useEffect(() => {
        // Check if quick actions should be hidden based on 24hr local storage timer
        const hiddenUntil = localStorage.getItem(`hide_quick_actions_${slug}`);
        if (hiddenUntil && new Date().getTime() < parseInt(hiddenUntil, 10)) {
            setShowQuickActions(false);
        } else {
            // Unhide and clean up if expired
            localStorage.removeItem(`hide_quick_actions_${slug}`);
            setShowQuickActions(true);
        }

        async function fetchProject() {
            try {
                const data = await ApiClient.get(`/projects/${slug}`);
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
                setPlan(data.plan);
            } catch (e) {
                console.error('Failed to fetch metrics:', e);
            }
        }

        fetchProject();
        fetchMetrics();

        // Poll every 5 seconds
        const interval = setInterval(() => {
            fetchProject();
            fetchMetrics();
        }, 5000);
        return () => clearInterval(interval);
    }, [slug]);

    useEffect(() => {
        if (!project || !activeBranch) return;
        const host = process.env.NODE_ENV === 'production' ? 'api.aero.local' : 'localhost-pooler';
        const port = '6432';
        const dbName = activeBranch.name;

        // Base connection string user is simply the project slug for master passwords.
        // The Connect Modal will handle appending $slug when pooling is enabled.
        const keyId = project.slug;
        setConnectionString(`postgresql://${keyId}:[YOUR_SECRET]@${host}:${port}/${dbName}?sslmode=disable`);
    }, [project, activeBranch]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(connectionString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleHideQuickActions = () => {
        const hideUntil = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours from now
        localStorage.setItem(`hide_quick_actions_${slug}`, hideUntil.toString());
        setShowQuickActions(false);
    };

    if (loading) return <div className="p-10 text-zinc-400">Loading dashboard...</div>;
    if (!project) return <div className="p-10 text-red-500">Project not found</div>;

    const defaultBranch = project.branches?.find(b => b.type === 'production') || project.branches?.[0];

    return (
        <div className="w-full max-w-[1400px] mx-auto p-8 relative overflow-hidden min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-[28px] font-bold text-white tracking-tight">Panel del proyecto</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowConnectModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors shadow-sm"
                    >
                        <LinkIcon size={16} /> Conectar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white border border-zinc-700 bg-transparent rounded-md hover:bg-zinc-800 transition-colors">
                        <Download size={14} /> Importar datos
                    </button>
                    <Link
                        href={`/projects/${slug}/settings?tab=collaborators`}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white border border-zinc-700 bg-transparent rounded-md hover:bg-zinc-800 transition-colors"
                    >
                        <Share2 size={14} /> Compartir
                    </Link>
                </div>
            </div>

            {/* Quick Actions / Get Connected */}
            {showQuickActions && (
                <div className="border border-zinc-800 rounded-xl p-5 mb-6 bg-[#0a0a0a]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-medium text-zinc-300">Conéctate a tu nueva base de datos</h2>
                        <button
                            onClick={handleHideQuickActions}
                            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Ocultar
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Active Action */}
                        <div
                            onClick={() => setShowConnectModal(true)}
                            className="border border-zinc-700 bg-[#161616] rounded-xl p-4 hover:border-zinc-500 transition-colors cursor-pointer relative overflow-hidden group"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <LinkIcon size={16} className="text-zinc-300" />
                                <h3 className="text-[13px] font-bold text-white">Cadena de conexión</h3>
                            </div>
                            <p className="text-[12px] text-zinc-400 pr-4 leading-relaxed">
                                Copia la cadena de conexión de tu proyecto y añádela a la configuración de tu aplicación.
                            </p>
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight size={16} className="text-zinc-400" />
                            </div>
                        </div>

                        {/* Inactive Actions */}
                        <div className="border border-zinc-800/50 rounded-xl p-4 bg-transparent cursor-default opacity-50">
                            <div className="flex items-center gap-2 mb-3">
                                <TerminalSquare size={16} className="text-zinc-500" />
                                <h3 className="text-[13px] font-bold text-zinc-400">Aero init</h3>
                            </div>
                            <p className="text-[12px] text-zinc-500 leading-relaxed">
                                Configura tu entorno de desarrollo local con un solo comando.
                            </p>
                        </div>

                        <div className="border border-zinc-800/50 rounded-xl p-4 bg-transparent cursor-default opacity-50">
                            <div className="flex items-center gap-2 mb-3">
                                <Code size={16} className="text-zinc-500" />
                                <h3 className="text-[13px] font-bold text-zinc-400">Extensión en el IDE</h3>
                            </div>
                            <p className="text-[12px] text-zinc-500 leading-relaxed">
                                Configura tu aplicación con la extensión en VS Code o Cursor.
                            </p>
                        </div>

                        <div className="border border-zinc-800/50 rounded-xl p-4 bg-transparent cursor-default opacity-50">
                            <div className="flex items-center gap-2 mb-3">
                                <Blocks size={16} className="text-zinc-500" />
                                <h3 className="text-[13px] font-bold text-zinc-400">Servidor MCP</h3>
                            </div>
                            <p className="text-[12px] text-zinc-500 leading-relaxed">
                                Conecta tu aplicación al servidor MCP con las herramientas soportadas por IA.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Metrics Row */}
            <TooltipProvider delayDuration={200}>
            <div className="border border-zinc-800 rounded-xl flex flex-col mb-6 bg-[#0a0a0a]">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                    <div className="flex flex-col justify-between p-5">
                        <div>
                            <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 mb-2">
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
                            <div className="text-[20px] font-semibold text-white">{project?.branches?.length || 1} <span className="text-[16px] text-zinc-500 font-medium">/ 10</span></div>
                        </div>
                        <ProgressBar value={project?.branches?.length || 1} max={plan?.maxBranches || 10} />
                    </div>
                    <div className="flex flex-col justify-between p-5">
                        <div>
                            <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 mb-2">
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
                        <ProgressBar value={parseFloat(metrics?.computeCuHr || '0')} max={plan?.maxComputeHours || 100} />
                    </div>
                    <div className="flex flex-col justify-between p-5">
                        <div>
                            <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 mb-2">
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
                        <ProgressBar value={parseFloat(metrics?.storageGb || '0')} max={plan?.maxStorageGb || 0.5} />
                    </div>
                    <div className="flex flex-col justify-between p-5">
                        <div>
                            <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 mb-2">
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
                        <ProgressBar value={parseFloat(metrics?.networkTransferGb || '0')} max={plan?.maxNetworkTransferGb || 5} />
                    </div>
                </div>
                <div className="px-5 py-4 border-t border-zinc-800 text-[12px] text-zinc-500 bg-transparent rounded-b-xl">
                    Uso desde {project?.createdAt ? new Date(project.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Mar 5, 2026'}. Las métricas pueden tener un retraso de una hora y no se actualizan para proyectos inactivos. <a href="https://neon.tech/docs/manage/billing" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Más información.</a>
                </div>
            </div>
            </TooltipProvider>

            {/* Split Content: Monitoring (Left) | Branches & Settings (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column - Monitoring */}
                <MonitoringChart projectSlug={slug} branches={project.branches || []} />

                {/* Right Column - Branches & Settings */}
                <div className="flex flex-col gap-6">
                    {/* Branches List Summary */}
                    <div className="border border-zinc-800 rounded-xl bg-[#0a0a0a] overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                            <h2 className="text-[16px] font-bold text-white">{project.branches?.length || 0} Branches</h2>
                            <Link href={`/projects/${slug}/branches`} className="text-[13px] font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                Ver todo
                            </Link>
                        </div>
                        <div className="divide-y divide-zinc-800/50">
                            {project.branches?.slice(0, 3).map((branch) => (
                                <div key={branch.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/20 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center">
                                            {branch.isDefault ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 17 17" role="img" aria-hidden="true" className="text-zinc-400"><path fill="currentColor" fillRule="evenodd" d="M4.67 3.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-3 1.5a3 3 0 1 1 5.18 2.06c.5.62 1.21 1.03 2 1.16a3 3 0 1 1-.15 1.5 4.7 4.7 0 0 1-3.12-1.85l-.16.04v2.2a3 3 0 1 1-1.5 0V7.6a3 3 0 0 1-2.25-2.9m1.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m7-3.74a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0" clipRule="evenodd"></path></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 17 16" fill="none" role="img" aria-hidden="true" className="text-zinc-400"><path fillRule="evenodd" clipRule="evenodd" d="M3.96875 6.4375C3.96875 7.11896 4.06412 7.73079 4.375 8.16504C4.64917 8.54792 5.19934 8.93749 6.46875 8.9375H8.61328C8.92431 7.61231 10.1112 6.625 11.5312 6.625C13.1881 6.625 14.5312 7.96815 14.5312 9.625C14.5312 11.2819 13.1881 12.625 11.5312 12.625C10.1563 12.625 9.00002 11.6992 8.64551 10.4375H6.46875C4.86341 10.4375 3.78835 9.92076 3.15625 9.03809C2.56096 8.20674 2.46875 7.19344 2.46875 6.4375V3.375H3.96875V6.4375ZM11.5312 8.125C10.7028 8.125 10.0312 8.79657 10.0312 9.625C10.0312 10.4534 10.7028 11.125 11.5312 11.125C12.3597 11.125 13.0312 10.4534 13.0312 9.625C13.0312 8.79657 12.3597 8.125 11.5312 8.125Z" fill="currentColor"></path></svg>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[14px] font-semibold text-white group-hover:text-blue-400 transition-colors">{branch.name}</span>
                                                {branch.isDefault && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded border border-zinc-700">Default</span>}
                                                {branch.isSchemaOnly && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#0dc38e]/10 text-[#0dc38e] rounded border border-[#0dc38e]/20">Schema Only</span>}
                                            </div>
                                            <div className="text-[12px] text-zinc-500 mt-0.5">
                                                Hace un momento
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-[#00e599] flex items-center justify-center text-[10px] text-black font-bold">U</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Project Settings Summary */}
                    <div className="border border-zinc-800 flex-1 rounded-xl bg-[#0a0a0a] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-zinc-800 pb-4">
                            <h2 className="text-[16px] font-bold text-white">Configuración del proyecto</h2>
                            <Link href={`/projects/${slug}/settings`} className="text-[13px] font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                Administrar
                            </Link>
                        </div>
                        <div className="flex flex-col flex-1">
                            <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
                                <span className="text-[13px] font-medium text-zinc-300 text-shadow-sm">Región</span>
                                <span className="text-[13px] font-medium text-white">{project.region}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
                                <span className="text-[13px] font-medium text-zinc-300">Tamaño de cómputo predeterminado</span>
                                <span className="text-[13px] font-medium text-white">.25 ↔ 2 CU</span>
                            </div>
                            <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
                                <span className="text-[13px] font-medium text-zinc-300">Retención de historial</span>
                                <span className="text-[13px] font-medium text-white">6 horas</span>
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <span className="text-[13px] font-medium text-zinc-300">Versión de Postgres</span>
                                <span className="text-[13px] font-medium text-white">{project.databases?.[0]?.pgVersion || '16'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Styles for the diagonal stripes in the graph */}
            <style jsx>{`
                .diagonal-stripes {
                    background-image: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255, 255, 255, 0.03) 4px, rgba(255, 255, 255, 0.03) 8px);
                }
            `}</style>

            <ConnectModal
                isOpen={showConnectModal}
                onClose={() => setShowConnectModal(false)}
                project={project}
                activeBranch={activeBranch}
                connectionString={connectionString}
            />
        </div>
    );
}
