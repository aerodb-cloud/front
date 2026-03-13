'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { MoreVertical, LayoutDashboard, Terminal, Settings, Download, X, Copy, Check, AlertTriangle } from 'lucide-react';

interface Project {
    id: string;
    slug: string;
    name: string;
    region: string;
    status: string;
    createdAt: string;
    databases?: any[];
    metrics?: {
        computeState: string;
        activeTime: string;
        cpuUsage: string;
        lastActive: string;
    };
}

// Separate component for the row to isolate dropdown state
function ProjectRow({ project, onBranchSelect }: { project: Project, onBranchSelect: (id: string) => void }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (e: React.MouseEvent, action: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDropdownOpen(false);

        if (action === 'dashboard') router.push(`/projects/${project.slug}`);
        if (action === 'sql') router.push(`/projects/${project.slug}/sql-editor`);
        if (action === 'settings') router.push(`/projects/${project.slug}/settings`);
    };

    return (
        <div className="flex items-center justify-between p-4 transition-colors border-b border-zinc-800/50 hover:bg-zinc-800/30 group">
            <Link href={`/projects/${project.slug}`} className="flex-1 grid grid-cols-7 gap-4 items-center">
                <div className="col-span-2 flex flex-col">
                    <span className="font-medium text-white group-hover:text-indigo-400 transition-colors">✦ {project.name}</span>
                </div>
                <div className="col-span-1 text-sm text-zinc-400">{project.region}</div>
                <div className="col-span-1 text-sm text-zinc-400">{new Date(project.createdAt).toLocaleDateString()}</div>
                <div className="col-span-1 text-sm text-zinc-400">14.2 MB</div>
                <div className="col-span-1 flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'active' ? 'bg-green-500' : project.status === 'waking_up' ? 'bg-yellow-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                    <span className="text-sm text-zinc-400">
                        {project.status === 'active' ? 'Active' : project.status === 'waking_up' ? 'Waking Up' : 'Suspended'}
                    </span>
                </div>
                <div className="col-span-1 text-sm text-zinc-400">{project.databases?.length || 1}</div>
            </Link>

            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                    Add ⊕
                </button>
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-all"
                >
                    <MoreVertical size={18} />
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 top-8 z-50 w-48 py-1 bg-[#1c1c1c] border border-zinc-800 rounded-lg shadow-2xl origin-top-right">
                        <button onClick={(e) => handleAction(e, 'dashboard')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-left">
                            <LayoutDashboard size={14} /> Dashboard
                        </button>
                        <button onClick={(e) => handleAction(e, 'sql')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-left">
                            <Terminal size={14} /> SQL Editor
                        </button>
                        <button onClick={(e) => handleAction(e, 'settings')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-left">
                            <Settings size={14} /> Settings
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [importModalOpen, setImportModalOpen] = useState(false);

    // Create Project Modal States
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [pgVersion, setPgVersion] = useState('17');
    const [provider, setProvider] = useState('Bare Metal');
    const [region, setRegion] = useState('');
    const [regionsList, setRegionsList] = useState<{id: string, name: string}[]>([]);

    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createdData, setCreatedData] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const router = useRouter();

    useEffect(() => {
        async function fetchRegions() {
            try {
                const data = await ApiClient.get('/regions');
                setRegionsList(data);
                if (data.length > 0) {
                    setRegion(data[0].id);
                }
            } catch (e) {
                console.error('Failed to load regions', e);
            }
        }
        fetchRegions();
    }, []);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const data = await ApiClient.get('/projects');

                // Fetch metrics right away
                const projectsWithMetrics = await Promise.all(
                    data.projects.map(async (p: Project) => {
                        try {
                            const mData = await ApiClient.get(`/projects/${p.slug}/metrics`);
                            return { ...p, metrics: mData.metrics };
                        } catch (e) {
                            return p;
                        }
                    })
                );

                setProjects(projectsWithMetrics);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();

        const interval = setInterval(fetchProjects, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="p-10 text-zinc-400">Cargando proyectos...</div>;

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setCreateError('');

        try {
            const data = await ApiClient.post('/projects', { 
                name: projectName || 'my-app', 
                region: region, 
                pgVersion: parseInt(pgVersion, 10) 
            });
            setCreatedData(data); // Shows success state
        } catch (err: any) {
            setCreateError(err.message || 'Failed to create project');
        } finally {
            setIsCreating(false);
        }
    };

    const copyToClipboard = () => {
        if (!createdData) return;
        navigator.clipboard.writeText(createdData.connectionString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const resetCreateModal = () => {
        setCreateModalOpen(false);
        setCreatedData(null);
        setProjectName('');
        setCreateError('');
    };

    return (
        <div className="max-w-6xl p-10 mx-auto relative overflow-hidden min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-xl font-semibold text-white">Tus proyectos</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setProjectName('');
                            setCreatedData(null);
                            setCreateModalOpen(true);
                        }}
                        className="px-4 py-1.5 text-sm font-semibold text-zinc-900 bg-white rounded-md hover:bg-zinc-200 transition-colors"
                    >
                        Nuevo proyecto
                    </button>
                    <button
                        onClick={() => setImportModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-zinc-900 border border-zinc-700 rounded-md hover:bg-zinc-800 transition-colors"
                    >
                        Importar datos
                    </button>
                </div>
            </div>

            {/* Metrics Header Summary (Mock styling based on Neon) */}
            <div className="grid grid-cols-4 gap-6 p-6 mb-8 border border-zinc-800 rounded-xl bg-[#0a0a0a]">
                <div>
                    <p className="text-xs text-zinc-500 mb-1">Cómputo ⓘ</p>
                    <p className="text-xl font-medium text-white">0.97 CU-hrs</p>
                </div>
                <div>
                    <p className="text-xs text-zinc-500 mb-1">Almacenamiento ⓘ</p>
                    <p className="text-xl font-medium text-white">0.06 GB</p>
                </div>
                <div>
                    <p className="text-xs text-zinc-500 mb-1">Historial ⓘ</p>
                    <p className="text-xl font-medium text-white">0.01 GB</p>
                </div>
                <div>
                    <p className="text-xs text-zinc-500 mb-1">Transf. de red ⓘ</p>
                    <p className="text-xl font-medium text-white">15.68 GB</p>
                </div>
            </div>

            <div className="mb-4 text-sm font-medium text-white">{projects.length} Proyecto{projects.length !== 1 ? 's' : ''}</div>

            <div className="w-full mb-6">
                <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full px-4 py-2 text-sm bg-transparent border border-zinc-800 rounded-md text-white focus:outline-none focus:border-zinc-600"
                />
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-zinc-800 bg-zinc-900/30">
                    <h3 className="text-lg font-medium text-white">Aún no hay proyectos</h3>
                    <p className="mt-1 text-sm text-zinc-400">Comienza creando un nuevo clúster de base de datos.</p>
                </div>
            ) : (
                <div className="border-t border-zinc-800">
                    <div className="grid grid-cols-7 gap-4 px-4 py-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase border-b border-zinc-800 w-[calc(100%-80px)]">
                        <div className="col-span-2">Nombre</div>
                        <div className="col-span-1">Región</div>
                        <div className="col-span-1">Creado el</div>
                        <div className="col-span-1">Almacenamiento</div>
                        <div className="col-span-1">Estado</div>
                        <div className="col-span-1">Ramas</div>
                    </div>
                    <div>
                        {projects.map((p) => (
                            <ProjectRow key={p.id} project={p} onBranchSelect={() => { }} />
                        ))}
                    </div>
                </div>
            )}

            {/* Import Data Modal (Slide-Over) */}
            {importModalOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setImportModalOpen(false)}
                    />

                    {/* Slide-over panel */}
                    <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md px-6 py-6 bg-[#161616] border-l border-zinc-800 shadow-2xl transform transition-transform duration-300 translate-x-0 overflow-y-auto`}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                Import Data Assistant
                                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider text-purple-300 bg-purple-500/20 rounded-full uppercase">Beta</span>
                            </h2>
                            <button
                                onClick={() => setImportModalOpen(false)}
                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="mb-8 text-sm text-zinc-400">
                            Quickly import your existing Postgres database to Neon. Follow these steps to check compatibility, and import your data. <a href="#" className="text-indigo-400 hover:underline">Learn more ↗</a>
                        </p>

                        <div className="space-y-4">
                            {/* Step 1 */}
                            <div className="p-6 bg-[#1c1c1c] border border-zinc-800 rounded-xl">
                                <h3 className="flex items-center gap-3 text-base font-medium text-white mb-4">
                                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-zinc-400 bg-zinc-800 rounded-full">1</span>
                                    Check compatibility
                                </h3>
                                <p className="mb-4 text-sm text-zinc-400">
                                    We'll analyze your database and provide recommendations for a successful data import. No changes will be made to your source database.
                                </p>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Current database connection string</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="postgresql://"
                                            className="flex-1 px-3 py-2 text-sm bg-black border border-zinc-800 rounded-md text-white focus:outline-none focus:border-zinc-600"
                                        />
                                        <button className="px-4 py-2 text-sm font-medium text-zinc-400 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors">
                                            Run Checks
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="p-6 bg-[#1c1c1c] border border-zinc-800 rounded-xl">
                                <h3 className="flex items-center gap-3 text-base font-medium text-white mb-4">
                                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-zinc-400 bg-zinc-800 rounded-full">2</span>
                                    Create a Neon project
                                </h3>
                                <p className="mb-4 text-sm text-zinc-400">
                                    Create a project to host your database. We've tried to match defaults to your source database (region, Postgres version).
                                </p>
                                <button className="px-4 py-2 text-sm font-medium text-zinc-400 bg-zinc-800/50 rounded-md cursor-not-allowed">
                                    Create new project
                                </button>
                            </div>

                            {/* Step 3 */}
                            <div className="p-6 bg-[#1c1c1c] border border-zinc-800 rounded-xl">
                                <h3 className="flex items-center gap-3 text-base font-medium text-white mb-4">
                                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-zinc-400 bg-zinc-800 rounded-full">3</span>
                                    Start import process
                                </h3>
                                <p className="mb-4 text-sm text-zinc-400">
                                    Click the button below to start the import process.
                                </p>
                                <div className="p-4 mb-4 text-sm text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                                    <span className="mt-0.5">ⓘ</span>
                                    <p>This data import feature is currently in beta and may not be fully stable. Users should expect that some imports may fail. We're actively improving the stability and will update as the feature matures.</p>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-500 bg-zinc-800/30 border border-zinc-800 rounded-md cursor-not-allowed">
                                    <Download size={14} /> Start import
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Create Project Modal */}
            {createModalOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={resetCreateModal} />

                    {/* Centered Desktop Modal */}
                    <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-[1200px] h-[680px] -translate-x-1/2 -translate-y-1/2 rounded-[14px] bg-[#0c0d0d] border border-zinc-800 shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-7 pb-4">
                            <h3 className="text-[20px] font-semibold text-white">
                                {createdData ? '¡Proyecto Creado!' : 'Crear proyecto'}
                            </h3>
                            <button onClick={resetCreateModal} className="text-zinc-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {createdData ? (
                            /* Success State styled with AERO Premium Aesthetics */
                            <div className="p-8 flex flex-col items-center justify-center bg-[#0c0d0d] flex-1 rounded-b-[14px]">
                                <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                                    <div className="absolute inset-0 bg-[#00e599] rounded-full blur-[35px] opacity-20 animate-pulse"></div>
                                    <div className="relative flex items-center justify-center w-20 h-20 bg-[#00e599]/10 border border-[#00e599]/30 rounded-full shadow-[inset_0_0_15px_rgba(0,229,153,0.1)] text-[#00e599]">
                                        <Check size={36} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <h1 className="text-[28px] font-bold text-white mb-3 tracking-tight">¡Casi listo!</h1>
                                <p className="text-[15px] text-zinc-400 mb-10 max-w-[460px] text-center leading-relaxed">
                                    Tu clúster de Postgres ha sido aprovisionado exitosamente. Copia y guarda esta cadena de conexión de forma segura en tus variables de entorno.
                                </p>

                                <div className="w-full max-w-[540px] text-left bg-[#111111] border border-zinc-800/80 p-6 rounded-xl shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00e599]/40 to-transparent"></div>
                                    <label className="flex items-center gap-2 text-[15px] font-medium text-white mb-4">
                                        <Terminal size={18} className="text-[#00e599]" /> Cadena de Conexión
                                    </label>
                                    <div className="flex gap-3">
                                        <textarea
                                            readOnly
                                            className="flex-1 h-28 p-4 font-mono text-[13px] md:text-[14px] text-[#00e599] bg-[#050505] border border-zinc-800 rounded-lg outline-none resize-none leading-relaxed transition-colors hover:border-zinc-700 focus:border-[#00e599]/50"
                                            value={createdData.connectionString}
                                            onClick={e => (e.target as HTMLTextAreaElement).select()}
                                            style={{ wordBreak: 'break-all' }}
                                        />
                                        <button
                                            onClick={copyToClipboard}
                                            className="text-white bg-[#1a1a1a] hover:bg-[#252525] rounded-lg border border-zinc-800 transition-colors h-28 w-16 flex items-center justify-center shrink-0 group relative overflow-hidden"
                                            title="Copiar cadena de conexión"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            {copied ? <Check size={22} className="text-[#00e599] scale-110 transition-transform" /> : <Copy size={22} className="text-zinc-400 group-hover:text-white transition-all scale-100 group-hover:scale-110" />}
                                        </button>
                                    </div>
                                    <div className="mt-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-3">
                                        <div className="text-rose-400 mt-[2px]"><AlertTriangle size={16} strokeWidth={2.5} /></div>
                                        <p className="text-[13.5px] text-rose-300/90 leading-relaxed font-medium">
                                            Por razones de seguridad, <strong>esta es la única vez</strong> que verás la contraseña o clave API completa.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-10 flex gap-4 w-full max-w-[540px]">
                                    <button
                                        onClick={() => router.push(`/projects/${createdData.project.slug}`)}
                                        className="w-full px-6 py-3.5 text-[15px] font-semibold text-black bg-[#00e599] rounded-lg hover:bg-[#00c985] transition-all shadow-[0_0_20px_rgba(0,229,153,0.3)] hover:shadow-[0_0_30px_rgba(0,229,153,0.4)] flex items-center justify-center gap-2 group"
                                    >
                                        Ir al Dashboard del Proyecto
                                        <span className="transition-transform group-hover:translate-x-1">→</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Create Form State matching Neon Design */
                            <form id="create_project_form" onSubmit={handleCreateSubmit} className="flex flex-col flex-1 min-h-0">
                                <div className="flex flex-1 min-h-0">
                                    {/* Left pane: Form */}
                                    <div className="w-[45%] p-7 pt-2 flex flex-col gap-[18px]">
                                        {createError && (
                                            <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md">
                                                {createError}
                                            </div>
                                        )}

                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-[14px] font-medium text-zinc-300 mb-2 mt-2">Nombre del proyecto</label>
                                                <input
                                                    type="text"
                                                    value={projectName}
                                                    onChange={(e) => setProjectName(e.target.value)}
                                                    placeholder="ej. nombre de app o cliente"
                                                    className="w-full px-3 py-[9px] text-[14px] text-white bg-transparent border border-[#3e3e3e] rounded-md focus:border-zinc-500 outline-none hover:border-[#4e4e4e] transition-colors"
                                                    required
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="w-[140px]">
                                                <label className="block text-[14px] font-medium text-zinc-300 mb-2 mt-2">Versión de Postgres</label>
                                                <div className="relative">
                                                    <select
                                                        value={pgVersion}
                                                        onChange={(e) => setPgVersion(e.target.value)}
                                                        className="w-full px-3 py-[9px] text-[14px] font-medium text-white bg-transparent border border-[#3e3e3e] rounded-md appearance-none outline-none hover:border-[#4e4e4e] transition-colors cursor-pointer"
                                                    >
                                                        <option value="14" className="bg-[#1c1c1c]">14</option>
                                                        <option value="15" className="bg-[#1c1c1c]">15</option>
                                                        <option value="16" className="bg-[#1c1c1c]">16</option>
                                                        <option value="17" className="bg-[#1c1c1c]">17</option>
                                                    </select>
                                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 8L12 12.58L16.59 8L18 9.41L12 15.41L6 9.41L7.41 8Z" fill="currentColor"></path></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-2">
                                            <label className="block text-[14px] font-medium text-zinc-300 mb-[14px]">Infraestructura</label>
                                            <div className="flex gap-6 text-[14px] font-medium text-white">
                                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${provider === 'Bare Metal' ? 'border-[#00e599]' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                                                        {provider === 'Bare Metal' && <div className="w-2 h-2 rounded-full bg-[#00e599]"></div>}
                                                    </div>
                                                    <input type="radio" name="provider" value="Bare Metal" className="hidden" checked={provider === 'Bare Metal'} onChange={() => setProvider('Bare Metal')} />
                                                    Bare Metal
                                                </label>
                                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${provider === 'AERO Cluster' ? 'border-[#00e599]' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                                                        {provider === 'AERO Cluster' && <div className="w-2 h-2 rounded-full bg-[#00e599]"></div>}
                                                    </div>
                                                    <input type="radio" name="provider" value="AERO Cluster" className="hidden" checked={provider === 'AERO Cluster'} onChange={() => setProvider('AERO Cluster')} />
                                                    AERO Cluster
                                                </label>
                                            </div>
                                        </div>

                                        <div className="mt-2 text-[14px]">
                                            <label className="block text-[14px] font-medium text-zinc-300 mb-2">Region</label>
                                            <div className="relative">
                                                <select
                                                    value={region}
                                                    onChange={(e) => setRegion(e.target.value)}
                                                    className="w-full px-3 py-[9px] font-medium text-white bg-transparent border border-[#3e3e3e] rounded-md appearance-none outline-none hover:border-[#4e4e4e] transition-colors cursor-pointer"
                                                    disabled={regionsList.length <= 1}
                                                >
                                                    {regionsList.map(r => (
                                                        <option key={r.id} value={r.id} className="bg-[#1c1c1c]">{r.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 8L12 12.58L16.59 8L18 9.41L12 15.41L6 9.41L7.41 8Z" fill="currentColor"></path></svg>
                                                </div>
                                            </div>
                                            <p className="mt-1.5 text-[13px] text-zinc-400">Selecciona el nodo más cercano a tu ubicación.</p>
                                        </div>
                                    </div>

                                    {/* Right pane: Globe / Visualizer */}
                                    <div className="flex-1 hidden md:flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-radial from-[#151616]/50 to-transparent"></div>
                                        <div className="w-[537px] h-[537px] rounded-full relative flex items-center justify-center translate-x-12"
                                            style={{
                                                backgroundImage: 'radial-gradient(circle, #555 1px, transparent 1px)',
                                                backgroundSize: '8px 8px',
                                                maskImage: 'radial-gradient(circle, black 35%, transparent 63%)'
                                            }}>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                                <div className="w-1.5 h-1.5 bg-[#00e599] rounded-full shadow-[0_0_12px_#00e599,0_0_20px_#00e599]"></div>
                                                <div className="mt-[18px] bg-[#0c0d0d] border border-[#00e599] text-white px-4 py-[14px] rounded-lg text-sm whitespace-nowrap shadow-xl flex gap-3.5 items-center">
                                                    <div className="text-zinc-400 mt-1">
                                                        <svg width="24" height="24" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M5.33711 1.44376V0.131256H4.28711V1.44376H3.06211C2.1681 1.44376 1.44336 2.1685 1.44336 3.06251V4.28751H0.130859V5.33751H1.44336V6.47501H0.130859V7.52501H1.44336V8.66251H0.130859V9.71251H1.44336V10.9375C1.44336 11.8315 2.1681 12.5563 3.06211 12.5563H4.28711V13.8688H5.33711V12.5563H6.47461V13.8688H7.52461V12.5563H8.66211V13.8688H9.71211V12.5563H10.9371C11.8311 12.5563 12.5559 11.8315 12.5559 10.9375V9.71251H13.8684V8.66251H12.5559V7.52501H13.8684V6.47501H12.5559V5.33751H13.8684V4.28751H12.5559V3.06251C12.5559 2.1685 11.8311 1.44376 10.9371 1.44376H9.71211V0.131256H8.66211V1.44376H7.52461V0.131256H6.47461V1.44376H5.33711ZM2.49336 6.47501V5.33751V4.28751L2.49336 3.06251C2.49336 2.74839 2.748 2.49376 3.06211 2.49376L4.28711 2.49376H5.33711H6.47461H7.52461H8.66211H9.71211L10.9371 2.49376C11.2512 2.49376 11.5059 2.74839 11.5059 3.06251L11.5059 4.28751V5.33751V6.47501V7.52501V8.66251V9.71251L11.5059 10.9375C11.5059 11.2516 11.2512 11.5063 10.9371 11.5063L9.71211 11.5063H8.66211H7.52461H6.47461H5.33711H4.28711L3.06211 11.5063C2.748 11.5063 2.49336 11.2516 2.49336 10.9375L2.49336 9.71251V8.66251V7.52501V6.47501ZM5.59961 3.67501C4.53646 3.67501 3.67461 4.53686 3.67461 5.60001V8.40001C3.67461 9.46315 4.53646 10.325 5.59961 10.325H8.39961C9.46276 10.325 10.3246 9.46315 10.3246 8.40001V5.60001C10.3246 4.53686 9.46276 3.67501 8.39961 3.67501H5.59961ZM4.72461 5.60001C4.72461 5.11676 5.11636 4.72501 5.59961 4.72501H8.39961C8.88286 4.72501 9.27461 5.11676 9.27461 5.60001V8.40001C9.27461 8.88326 8.88286 9.27501 8.39961 9.27501H5.59961C5.11636 9.27501 4.72461 8.88326 4.72461 8.40001V5.60001Z"></path></g></svg>
                                                    </div>
                                                    <div>
                                                        <span className="block text-zinc-400 text-[12px] mb-0.5 leading-none">Region</span>
                                                        <span className="font-semibold inline-block leading-none text-[14px]">{regionsList.find(r => r.id === region)?.name || region}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-6 px-7 flex justify-end gap-[18px] shrink-0 border-t border-zinc-800/50">
                                    <button
                                        type="button"
                                        onClick={resetCreateModal}
                                        className="px-4 py-[9px] text-[14px] font-semibold text-white bg-transparent rounded-md hover:bg-zinc-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        form="create_project_form"
                                        disabled={isCreating}
                                        className="px-4 py-[9px] text-[14px] font-semibold text-black bg-white rounded-md hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                                    >
                                        {isCreating ? 'Aprovisionando...' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
