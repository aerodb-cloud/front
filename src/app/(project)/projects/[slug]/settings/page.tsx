'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import { Copy, Check, Info, AlertTriangle, Users, ExternalLink } from 'lucide-react';

const Panel = ({ title, children, id }: { title: string, children: React.ReactNode, id?: string }) => (
    <section id={id} className="p-6 border rounded-xl border-zinc-800/80 bg-[#0e0e0e] shadow-sm mb-6">
        {title && <h2 className="text-xl font-medium text-white mb-6">{title}</h2>}
        {children}
    </section>
);

export default function ProjectSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmails, setInviteEmails] = useState('');
    const [inviting, setInviting] = useState(false);
    const [collaborators, setCollaborators] = useState<string[]>([]);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchProject() {
            try {
                const data = await ApiClient.get(`/projects/${slug}`);
                setProject(data.project);
                setProjectName(data.project.name);

                // Fetch collaborators
                const collabsRes = await ApiClient.get(`/projects/${slug}/collaborators`);
                if (collabsRes && collabsRes.collaborators) {
                    setCollaborators(collabsRes.collaborators);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchProject();
    }, [slug]);

    const handleCopyId = () => {
        if (project?.slug) {
            navigator.clipboard.writeText(project.slug);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const [savingName, setSavingName] = useState(false);

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectName.trim() || projectName === project.name) return;

        setSavingName(true);
        try {
            const data = await ApiClient.request(`/projects/${slug}`, {
                method: 'PATCH',
                body: JSON.stringify({ name: projectName }),
            });

            // If the slug changed, we need to redirect to the new URL
            if (data.project.slug !== slug) {
                router.push(`/projects/${data.project.slug}/settings`);
            } else {
                setProject(data.project);
                alert('Proyecto actualizado exitosamente');
            }
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Error al actualizar el nombre del proyecto');
        } finally {
            setSavingName(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await ApiClient.delete(`/projects/${slug}`);
            router.push('/projects');
        } catch (e: any) {
            console.error(e);
            setDeleting(false);
            alert(e.message || 'Error al eliminar el proyecto');
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        const emails = inviteEmails.split(',').map(email => email.trim()).filter(email => email.length > 0);
        if (emails.length === 0) return;

        setInviting(true);
        try {
            await ApiClient.request(`/projects/${slug}/invite`, {
                method: 'POST',
                body: JSON.stringify({ emails }),
            });
            setShowInviteModal(false);
            setInviteEmails('');
            // Add emails locally to simulate sending invites
            setCollaborators(prev => {
                const newCollabs = [...prev];
                emails.forEach(e => {
                    if (!newCollabs.includes(e)) newCollabs.push(e);
                });
                return newCollabs;
            });
            alert('¡Invitaciones enviadas exitosamente!');
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Error al enviar las invitaciones');
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveCollaborator = async (emailToRemove: string) => {
        try {
            await ApiClient.request(`/projects/${slug}/collaborators?email=${encodeURIComponent(emailToRemove)}`, {
                method: 'DELETE'
            });
            setCollaborators(prev => prev.filter(email => email !== emailToRemove));
            setOpenDropdown(null);
        } catch (err: any) {
            console.error('Error removing collaborator:', err);
            alert(err.message || 'Error al eliminar el colaborador');
        }
    };

    if (loading) return <div className="p-10 text-zinc-400">Cargando configuración...</div>;
    if (!project) return <div className="p-10 text-red-500">Proyecto no encontrado</div>;

    return (
        <div className="w-full max-w-[800px] mx-auto p-12">
            <div className="mb-10">
                <h1 className="text-[32px] font-bold text-white tracking-tight">Configuración del proyecto</h1>
            </div>

            <Panel title="General" id="general">
                <form onSubmit={handleUpdateName} className="space-y-6 max-w-[620px]">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="text-[14px] font-medium text-zinc-300 sm:w-[160px] shrink-0">ID del proyecto</label>
                        <div className="flex bg-[#0c0d0d] border border-zinc-800 rounded-lg overflow-hidden w-full">
                            <div className="px-3 py-2.5 text-[13px] text-zinc-200 font-mono flex-1 bg-transparent border-none focus:outline-none flex items-center">
                                {project.slug}
                            </div>
                            <button
                                type="button"
                                onClick={handleCopyId}
                                className="px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border-l border-zinc-800 flex items-center justify-center shrink-0"
                            >
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="text-[14px] font-medium text-zinc-300 sm:w-[160px] shrink-0" htmlFor="projectName">Nombre del proyecto</label>
                        <input
                            id="projectName"
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full px-3 py-2.5 text-[14px] bg-[#0c0d0d] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-shadow"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={projectName === project.name || !projectName.trim() || deleting}
                            className="px-5 py-2 mt-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-300"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </Panel>

            <Panel title="" id="sharing">
                <div className="flex items-center justify-between mb-4 -mt-2">
                    <h2 className="text-[22px] font-semibold text-white">Colaboradores</h2>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        type="button"
                        className="px-4 py-1.5 text-sm font-medium text-white bg-transparent border border-zinc-700 rounded-md hover:bg-zinc-800/50 transition-colors"
                    >
                        Invitar
                    </button>
                </div>
                <p className="text-[14px] text-zinc-200 mb-6">
                    Invita a colaboradores externos a unirse a este proyecto. Los colaboradores existentes se enumeran a continuación.
                </p>

                {collaborators.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 border border-zinc-800 rounded-xl bg-[#131313] mb-6">
                        <div className="text-zinc-400 mb-5 scale-110">
                            <svg width="56px" height="56px" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M8 5.75C6.20507 5.75 4.75 7.20507 4.75 9V47C4.75 48.7949 6.20508 50.25 8 50.25H39.75V51.75H8C5.37664 51.75 3.25 49.6233 3.25 47V9C3.25 6.37665 5.37665 4.25 8 4.25H37C39.6233 4.25 41.75 6.37664 41.75 9V21.75H40.25V9C40.25 7.20508 38.7949 5.75 37 5.75H8Z" fill="currentColor"></path><path d="M34 11H10V12.5H34V11Z" fill="currentColor"></path><path d="M34 19H10V20.5H34V19Z" fill="currentColor"></path><path d="M28 43H10V44.5H28V43Z" fill="currentColor"></path><path d="M29 27H10V28.5H29V27Z" fill="currentColor"></path><path d="M24 35H10V36.5H24V35Z" fill="currentColor"></path><path fillRule="evenodd" clipRule="evenodd" d="M40 27.5C34.7533 27.5 30.5 31.7533 30.5 37C30.5 42.2467 34.7533 46.5 40 46.5C45.2467 46.5 49.5 42.2467 49.5 37C49.5 31.7533 45.2467 27.5 40 27.5ZM29 37C29 30.9249 33.9249 26 40 26C46.0751 26 51 30.9249 51 37C51 43.0751 46.0751 48 40 48C33.9249 48 29 43.0751 29 37Z" fill="currentColor"></path><path d="M48.0607 42.9393L47 44L54.2873 50.848L55.3479 49.7874L48.0607 42.9393Z" fill="currentColor"></path></svg>
                        </div>
                        <p className="text-zinc-300 font-medium text-[15px]">Todavía no has compartido tu proyecto con nadie</p>
                    </div>
                ) : (
                    <div className="border border-zinc-800 flex flex-col rounded-xl mb-6 bg-[#0c0c0c]">
                        <table className="w-full text-left">
                            <thead className="bg-[#111111] border-b border-zinc-800 [&>tr>th:first-child]:rounded-tl-xl [&>tr>th:last-child]:rounded-tr-xl">
                                <tr>
                                    <th className="px-5 py-3 text-[12px] font-medium text-zinc-400">Correo electrónico</th>
                                    <th className="px-5 py-3 w-[60px]"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {collaborators.map((email) => (
                                    <tr key={email} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/40 transition-colors">
                                        <td className="px-5 py-3 text-[14px] text-zinc-200">{email}</td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="relative flex justify-end">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === email ? null : email)}
                                                    className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors focus:ring-2 focus:ring-zinc-600 focus:outline-none"
                                                    aria-label={`Acciones para el colaborador ${email}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 17"><path fill="currentColor" d="M8.67 1.87a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5m0 5.25a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5m0 5.25a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5" clipRule="evenodd"></path></svg>
                                                </button>
                                                {openDropdown === email && (
                                                    <div className="absolute right-0 top-full mt-1 w-[280px] bg-[#1a1a1a] border border-zinc-700 rounded-lg shadow-xl overflow-hidden py-1" style={{ zIndex: 9999 }}>
                                                        <div className="fixed inset-0 z-[-1]" onClick={() => setOpenDropdown(null)}></div>
                                                        <button
                                                            onClick={() => handleRemoveCollaborator(email)}
                                                            className="w-full text-left px-4 py-2 text-[14px] text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                                        >
                                                            Revocar el uso compartido del proyecto
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <p className="text-[13px] text-zinc-300/90">
                    * Este proyecto es propiedad de <strong className="text-zinc-200">ceo_oa+swaplyar4@swaplyar.com</strong>. Gestiona los permisos de los miembros en la{' '}
                    <a href="#" className="text-[#00e5bf] hover:text-[#00c2a2] hover:underline font-medium">página Personas</a>.
                </p>
            </Panel>

            <Panel title="Eliminar proyecto" id="delete">
                <div className="space-y-6">
                    <div className="p-[16px] bg-[#3f0f14] border border-[#7f1d1d] rounded-lg flex items-start gap-4">
                        <AlertTriangle size={18} className="text-[#f87171] shrink-0 mt-[1px]" />
                        <div className="text-[14.5px] font-medium text-white leading-relaxed">
                            Eliminar de forma permanente el proyecto <b className="text-white font-bold">{project.name}</b>. Esta acción no es reversible. Procede con precaución.
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={() => {
                                setShowDeleteModal(true);
                                setDeleteConfirmationText('');
                            }}
                            type="button"
                            className="px-4 py-1.5 text-sm font-medium text-white bg-[#dc2626] border border-transparent rounded-md hover:bg-[#b91c1c] transition-colors"
                        >
                            Eliminar proyecto
                        </button>
                    </div>
                </div>
            </Panel>

            <Panel title="Valores predeterminados de cómputo" id="compute">
                <div className="space-y-4 opacity-50 pointer-events-none select-none">
                    <p className="text-[14px] text-zinc-300 leading-relaxed">
                        Estos valores predeterminados se utilizarán como configuración inicial para cualquier nodo de cómputo principal o réplica de lectura que crees. Modificar estos valores no altera la configuración de los nodos de cómputo existentes.
                    </p>
                    <ul className="text-[14px] text-zinc-300 space-y-2.5 py-2 pl-4 list-disc marker:text-zinc-600">
                        <li><span className="font-semibold text-white">Tamaño de cómputo:</span> .25 ↔ 2 CU</li>
                        <li><span className="font-semibold text-white">Escalar a cero:</span> 5 minutos (predeterminado)</li>
                    </ul>
                    <div>
                        <button type="button" className="px-4 py-1.5 text-sm font-medium text-white bg-transparent border border-zinc-700/80 rounded-md hover:bg-zinc-800/50 transition-colors">
                            Modificar valores por defecto
                        </button>
                    </div>
                </div>
            </Panel>

            <Panel title="Restauración instantánea" id="storage">
                <div className="space-y-6 opacity-50 pointer-events-none select-none">
                    <p className="text-[14px] text-zinc-300 leading-relaxed max-w-[90%]">
                        Elige la duración de tu ventana de restauración. Esta configuración habilita la <strong className="font-semibold text-white">restauración instantánea</strong> para la recuperación en un punto en el tiempo (PITR), consultas de viaje en el tiempo y ramificación desde estados pasados.
                    </p>

                    <div className="relative py-6 max-w-xl">
                        <div className="h-1 w-full bg-[#202020] rounded-full overflow-hidden border border-zinc-800/50">
                            <div className="h-full bg-zinc-500 w-[50%]"></div>
                        </div>
                        <div className="absolute top-1/2 left-[50%] -translate-x-1/2 -translate-y-[calc(50%+2px)] w-[12px] h-[12px] bg-white rounded-full shadow border-2 border-zinc-800 cursor-grab active:cursor-grabbing"></div>

                        <div className="flex justify-between text-[11px] text-zinc-500 mt-2 font-mono">
                            <span>0h</span>
                            <span>1h</span>
                            <span>2h</span>
                            <span className="text-white font-medium">6h</span>
                            <span>12h</span>
                            <span>1d</span>
                            <span>2d</span>
                            <span>7d</span>
                        </div>
                    </div>

                    <div>
                        <button type="button" disabled className="px-4 py-1.5 text-sm font-medium text-zinc-500 bg-transparent border border-zinc-800 rounded-md cursor-not-allowed">
                            Guardar
                        </button>
                    </div>
                </div>
            </Panel>

            <Panel title="Actualizaciones" id="update-schedule">
                <div className="space-y-8 opacity-50 pointer-events-none select-none">
                    <p className="text-[14px] text-zinc-300 leading-relaxed max-w-[90%]">
                        Mantén tus nodos de cómputo al día con las últimas actualizaciones de la versión de Postgres, parches de seguridad y características de Neon. Las actualizaciones requieren un breve reinicio de los nodos de cómputo de tu proyecto.{' '}
                        <a href="#" className="inline-flex items-center gap-1 text-[#00e5bf] hover:text-[#00c2a2] hover:underline font-medium">
                            Aprender más <ExternalLink size={12} className="opacity-80" />
                        </a>
                    </p>

                    <div>
                        <h3 className="text-[17px] font-semibold text-white mb-2">Programación</h3>
                        <p className="text-[14px] text-zinc-300 mb-4">
                            Selecciona tu ventana de tiempo preferida para las actualizaciones. Los reinicios de cómputo suelen tardar solo unos segundos.
                        </p>

                        <div className="flex flex-wrap gap-0 mb-6 w-full max-w-[620px] rounded-lg overflow-hidden border border-zinc-800">
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => (
                                <button
                                    key={day}
                                    className={`px-4 py-2 text-[13px] flex-1 transition-colors border-r border-zinc-800 last:border-r-0 ${day === 'Jueves'
                                        ? 'bg-zinc-700 text-white font-medium shadow-inner'
                                        : 'bg-[#111] text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800'
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2 mb-6">
                            <label className="text-sm font-medium text-zinc-300">Hora</label>
                            <div className="relative max-w-[260px]">
                                <select className="w-full px-3 py-2 text-[14px] bg-[#0c0d0d] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-zinc-600 appearance-none">
                                    <option>7:00 AM - 8:00 AM UTC</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7.41 8L12 12.58L16.59 8L18 9.41L12 15.41L6 9.41L7.41 8Z" fill="currentColor"></path></svg>
                                </div>
                            </div>
                            <p className="text-[12.5px] text-zinc-500 flex items-center gap-1.5 mt-2">
                                <span className="opacity-70 text-[14px]">🌐</span> La hora UTC seleccionada corresponde a las 04:00 a. m. en tu zona horaria (America/Buenos_Aires)
                            </p>
                        </div>

                        <div>
                            <button type="button" className="px-4 py-1.5 text-sm font-medium text-white bg-transparent border border-zinc-700/80 rounded-md hover:bg-zinc-800/50 transition-colors mb-6">
                                Guardar
                            </button>
                        </div>

                        <div className="flex items-start gap-3 mt-4">
                            <Info size={16} className="text-zinc-500 shrink-0 mt-0.5" />
                            <p className="text-[13px] text-zinc-400">
                                Neon puede reiniciar ocasionalmente los nodos de cómputo fuera de la ventana de actualización seleccionada para solucionar problemas de seguridad críticos o realizar el mantenimiento esencial.
                            </p>
                        </div>
                    </div>
                </div>
            </Panel>

            <Panel title="Cumplimiento HIPAA" id="hipaa-support">
                <div className="space-y-4 opacity-50 pointer-events-none select-none">
                    <p className="text-[14px] text-zinc-300 leading-relaxed max-w-[95%]">
                        Habilita el cumplimiento HIPAA en este proyecto para garantizar que toda la información de salud protegida (PHI) esté protegida de acuerdo con la Ley de Portabilidad y Responsabilidad de Seguros Médicos (HIPAA). Para más detalles sobre cómo apoyamos el cumplimiento HIPAA, consulta nuestra{' '}
                        <a href="#" className="inline-flex items-center gap-1 text-[#00e5bf] hover:text-[#00c2a2] hover:underline font-medium">
                            Guía de Cumplimiento HIPAA <ExternalLink size={12} className="opacity-80" />
                        </a>
                    </p>

                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[13px] text-zinc-300 mb-2">
                        <div className="w-[8px] h-[8px] rounded-full bg-zinc-500"></div>
                        Cumplimiento HIPAA deshabilitado
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-1">
                        <button type="button" disabled className="px-4 py-1.5 text-sm font-medium text-zinc-500 bg-transparent border border-zinc-800 rounded-md cursor-not-allowed">
                            Habilitar
                        </button>
                        <span className="text-[14px] text-zinc-300">
                            Tu plan actual no admite el cumplimiento HIPAA.{' '}
                            <a href="#" className="text-[#00e5bf] hover:text-[#00c2a2] hover:underline font-medium">Cambiar mi plan.</a>
                        </span>
                    </div>
                </div>
            </Panel>

            <Panel title="Red (Networking)" id="network-security">
                <div className="space-y-5 opacity-50 pointer-events-none select-none">
                    <div className="p-4 border border-zinc-800 rounded-xl bg-transparent flex flex-col gap-[6px] opacity-50 pointer-events-none select-none">
                        <label className="flex items-center gap-3 cursor-not-allowed select-none">
                            <div className="relative">
                                <input type="checkbox" className="sr-only peer" checked readOnly />
                                <div className="w-[36px] h-[20px] bg-[#00e5bf] rounded-full peer"></div>
                                <div className="absolute left-[2px] top-[2px] bg-white w-[16px] h-[16px] rounded-full transition-transform translate-x-[16px]"></div>
                            </div>
                            <span className="text-[15px] font-semibold text-white">Permitir tráfico a través de internet público</span>
                        </label>
                        <p className="text-[13.5px] text-zinc-300 pl-[48px]">
                            <a href="#" className="text-[#00e5bf] hover:text-[#00c2a2] hover:underline font-medium">Actualiza tu plan</a> para limitar el acceso a la base de datos a direcciones IP de confianza.
                        </p>
                    </div>

                    <div className="p-4 border border-zinc-800 rounded-xl bg-transparent flex flex-col gap-[6px] opacity-50 pointer-events-none select-none">
                        <label className="flex items-center gap-3 cursor-not-allowed select-none">
                            <div className="relative opacity-60">
                                <input type="checkbox" className="sr-only peer" disabled />
                                <div className="w-[36px] h-[20px] bg-zinc-700/80 rounded-full peer"></div>
                                <div className="absolute left-[2px] top-[2px] bg-zinc-400 w-[16px] h-[16px] rounded-full transition-transform"></div>
                            </div>
                            <span className="text-[15px] font-semibold text-white">Permitir tráfico a través de una Red Privada Virtual (VPC)</span>
                        </label>
                        <p className="text-[13.5px] text-zinc-300 pl-[48px]">
                            <a href="#" className="text-[#00e5bf] hover:text-[#00c2a2] hover:underline font-medium">Actualiza tu plan</a> para limitar el acceso a la base de datos usando VPC.
                        </p>
                    </div>
                </div>
            </Panel>

            <Panel title="Replicación Lógica" id="out-replication">
                <div className="space-y-6 opacity-50 pointer-events-none select-none">
                    <p className="text-[14px] text-zinc-300 leading-relaxed">
                        La replicación lógica te permite replicar los cambios de datos de Neon a servicios de datos externos y plataformas.
                    </p>

                    <div className="p-[16px] bg-[#2a1a08] border border-[#523214] rounded-lg flex items-start gap-4">
                        <AlertTriangle size={18} className="text-[#f59e0b] shrink-0 mt-[2px]" />
                        <div className="text-[14px] text-[#fde68a]/90 leading-relaxed font-medium">
                            <p className="mb-2 hover:text-[#fde68a] transition-colors">Habilitar la replicación lógica:</p>
                            <ul className="list-disc pl-5 space-y-1.5 text-[13.5px] font-normal">
                                <li>Reinicia todos los nodos de cómputo en tu proyecto, eliminando cualquier conexión activa</li>
                                <li className="font-normal leading-6">Cambia tu configuración de Postgres <code className="bg-[#45270f] border border-[#78350f] px-1.5 py-0.5 rounded text-[#fde68a] text-[13px] font-mono mx-0.5">wal_level</code> a <code className="bg-[#45270f] border border-[#78350f] px-1.5 py-0.5 rounded text-[#fde68a] text-[13px] font-mono mx-0.5">logical</code></li>
                                <li>No se puede desactivar una vez habilitado</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <button type="button" className="px-4 py-1.5 text-sm font-medium text-white bg-transparent border border-zinc-700/80 rounded-md hover:bg-zinc-800/50 transition-colors">
                            Habilitar
                        </button>
                    </div>
                </div>
            </Panel>

            <Panel title="Transferir proyecto" id="transfer">
                <div className="space-y-5 opacity-50 pointer-events-none select-none">
                    <p className="text-[14px] text-zinc-300 leading-relaxed">
                        Mueve este proyecto a otra organización a la que pertenezcas. Las transferencias son instantáneas, sin tiempo de inactividad.
                        <br /><br />
                        O crea un <strong className="text-white font-semibold">enlace de reclamo</strong> para que otra cuenta de Neon pueda tomar la propiedad.
                    </p>

                    <div>
                        <button type="button" disabled className="px-4 py-1.5 text-sm font-medium text-zinc-500 bg-transparent border border-zinc-800 rounded-md cursor-not-allowed">
                            Transferir proyecto
                        </button>
                    </div>
                </div>
            </Panel>

            <div className="h-16"></div>

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <section className="bg-[#111111] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-[440px] overflow-hidden" role="dialog" aria-modal="true">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#161616]">
                            <h2 className="text-[17px] font-semibold text-white">¿Quieres eliminar este proyecto?</h2>
                            <button onClick={() => setShowDeleteModal(false)} type="button" className="text-zinc-500 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 16"><path fill="currentColor" fillRule="evenodd" d="M7.64 8.03 2.67 3.06 3.73 2 8.7 6.97 13.67 2l1.06 1.06-4.97 4.97L14.73 13l-1.06 1.06L8.7 9.1l-4.97 4.97L2.67 13z" clipRule="evenodd"></path></svg>
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="flex flex-col gap-5">
                                <div className="p-4 bg-[#3f0f14] border border-[#7f1d1d] rounded-lg flex items-start gap-4" role="alert">
                                    <div className="text-[#f87171] shrink-0 mt-[1px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="none" viewBox="0 0 16 17"><path fill="currentColor" d="M8 1.25q.42.01.65.37l7.25 12.5a.75.75 0 0 1-.65 1.13H.75a.75.75 0 0 1-.65-1.13l7.25-12.5A.8.8 0 0 1 8 1.25m0 2.24L2.05 13.75h11.9zm-.75 6.76v-3.5h1.5v3.5zm.75 2.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" clipRule="evenodd"></path></svg>
                                    </div>
                                    <div className="text-[14px] text-[#fca5a5] leading-relaxed">Esta acción no se puede deshacer. Esto eliminará permanentemente el proyecto <code className="font-mono bg-[#54141b] text-white px-1 py-0.5 rounded">{project.name}</code>. Procede con precaución.</div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-medium text-zinc-300">
                                        <span>Para confirmar, escribe "<b>{project.name}</b>" en el cuadro inferior.</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteConfirmationText}
                                        onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                        className="w-full px-3 py-2.5 text-[14px] bg-[#0c0d0d] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-shadow"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-zinc-800 bg-[#161616]">
                            <button onClick={() => setShowDeleteModal(false)} type="button" className="px-5 py-2 text-sm font-medium text-white bg-transparent border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteConfirmationText !== project.name || deleting}
                                type="button"
                                className="px-5 py-2 text-sm font-medium text-white bg-[#dc2626] border border-transparent rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#dc2626]/50"
                            >
                                {deleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <section className="bg-[#111111] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-[480px] overflow-hidden" role="dialog" aria-modal="true">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#161616]">
                            <h2 className="text-[17px] font-semibold text-white">Invitar a colaboradores</h2>
                            <button onClick={() => setShowInviteModal(false)} type="button" className="text-zinc-500 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 16"><path fill="currentColor" fillRule="evenodd" d="M7.64 8.03 2.67 3.06 3.73 2 8.7 6.97 13.67 2l1.06 1.06-4.97 4.97L14.73 13l-1.06 1.06L8.7 9.1l-4.97 4.97L2.67 13z" clipRule="evenodd"></path></svg>
                            </button>
                        </div>
                        <form onSubmit={handleInvite}>
                            <div className="p-5 space-y-5">
                                <div className="text-[14px] text-zinc-400 leading-relaxed">
                                    Los colaboradores pueden acceder a este proyecto visitando{' '}
                                    <a href={`http://localhost:3000/projects/${project.slug}`} target="_blank" rel="noreferrer" className="inline-block px-1.5 py-0.5 bg-[#00e5bf]/10 text-[#00e5bf] border border-[#00e5bf]/20 rounded hover:bg-[#00e5bf]/20 transition-colors font-medium">
                                        este enlace
                                    </a>.
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[14px] font-medium text-zinc-300">
                                        Dirección de correo electrónico
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="nombre@ejemplo.com, otro@ejemplo.com"
                                        value={inviteEmails}
                                        onChange={(e) => setInviteEmails(e.target.value)}
                                        className="w-full px-3 py-2.5 text-[14px] bg-[#0c0d0d] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-shadow"
                                    />
                                    <div className="text-[12px] text-zinc-500 mt-1.5">
                                        Correos electrónicos separados por comas
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-zinc-800 bg-[#161616]">
                                <button onClick={() => setShowInviteModal(false)} type="button" className="px-5 py-2 text-sm font-medium text-white bg-transparent border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviting || !inviteEmails.trim()}
                                    className="px-5 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-300"
                                >
                                    {inviting ? 'Enviando...' : 'Invitar'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}
