'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api';
import { Database, UserPlus, Settings, Copy, Check, Trash2, KeyRound, MoreVertical, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';
import { CreateRoleModal } from './CreateRoleModal';
import { CreateDatabaseModal } from './CreateDatabaseModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import Link from 'next/link';

interface BranchRolesAndDatabasesProps {
    projectSlug: string;
    branchId: string;
    metricsTime?: string;
}

export function BranchRolesAndDatabases({ projectSlug, branchId }: BranchRolesAndDatabasesProps) {
    const [roles, setRoles] = useState<any[]>([]);
    const [databases, setDatabases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
    const [isCreateDbOpen, setIsCreateDbOpen] = useState(false);
    const [roleToReset, setRoleToReset] = useState<string | null>(null);
    const [openRoleDropdown, setOpenRoleDropdown] = useState<string | null>(null);
    const [openDbDropdown, setOpenDbDropdown] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const [copiedRoles, setCopiedRoles] = useState<Record<string, boolean>>({});
    
    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [rolesRes, dbsRes] = await Promise.all([
                ApiClient.get(`/projects/${projectSlug}/branches/${branchId}/roles`),
                ApiClient.get(`/projects/${projectSlug}/branches/${branchId}/databases`)
            ]);
            setRoles(rolesRes.roles || []);
            setDatabases(dbsRes.databases || []);
        } catch (err: any) {
            console.error('Failed to fetch roles/dbs', err);
            setError('Error al cargar roles y bases de datos. Asegúrate de que el proyecto no esté pausado o intenta recargar.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectSlug && branchId) {
            fetchData();
        }
    }, [projectSlug, branchId]);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedRoles(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
            setCopiedRoles(prev => ({ ...prev, [id]: false }));
        }, 2000);
    };

    const handleDeleteRole = async (roleName: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar el rol ${roleName}? Esta acción no se puede deshacer y fallará si el rol es dueño de algún objeto.`)) return;
        try {
            await ApiClient.delete(`/projects/${projectSlug}/branches/${branchId}/roles/${roleName}`);
            await fetchData();
        } catch (e: any) {
            alert(e.message || 'Error al eliminar el rol');
        }
    };

    const handleDeleteDatabase = async (dbName: string) => {
        if (!confirm(`¡ADVERTENCIA! ¿Estás seguro de que deseas eliminar la base de datos ${dbName}? Esta acción desconectará a los clientes activos y eliminará todos los datos. Escribe "${dbName}" para confirmar.`)) return;
        
        const userInput = prompt(`Por favor, escribe "${dbName}" para confirmar la eliminación:`);
        if (userInput !== dbName) {
            alert('Confirmación incorrecta. Cancelando.');
            return;
        }

        try {
            await ApiClient.delete(`/projects/${projectSlug}/branches/${branchId}/databases/${dbName}`);
            await fetchData();
        } catch (e: any) {
            alert(e.message || 'Error al eliminar la base de datos');
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpenRoleDropdown(null);
                setOpenDbDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-zinc-400">Cargando roles y bases de datos...</div>;
    }

    if (error) {
        return (
            <div className="p-6 bg-red-950/20 border border-red-900/50 rounded-xl text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button onClick={fetchData} className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-200 rounded-md transition-colors text-sm font-medium">Reintentar</button>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="space-y-12 pb-16">
            {/* Roles Section */}
            <section className="flex flex-col gap-4 p-6 border border-[#262626] rounded-xl">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white tracking-tight">Roles</h2>
                        <button 
                            onClick={() => setIsCreateRoleOpen(true)}
                            className="h-8 px-3 inline-flex items-center justify-center text-xs font-semibold text-white border border-zinc-700 bg-transparent rounded-md hover:bg-zinc-800 transition-colors shadow-sm"
                        >
                            Añadir rol
                        </button>
                    </div>
                    <div className="text-sm text-zinc-400">
                        <span>Administra los roles de Postgres en esta rama. Para más información, consulta <a href="https://neon.com/docs/manage/roles" target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors font-medium">Administrar roles.</a></span>
                    </div>
                </div>

                <div className="border border-[#262626] rounded-xl bg-[#0c0d0d] shadow-sm mt-2">
                    {/* Header Row */}
                    <div className="grid grid-cols-[2fr_1.5fr_1.5fr_auto] gap-4 p-3 border-b border-[#262626] bg-[#0c0d0d] text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        <div className="pl-2">Nombre</div>
                        <div>Privilegios</div>
                        <div>Propiedad</div>
                        <div className="w-8"></div>
                    </div>

                    {/* Roles List */}
                    <div className="flex flex-col divide-y divide-[#262626]">
                        {roles.map(role => {
                            const isProtected = ['cloud_admin', 'postgres', 'zenith_admin'].includes(role.name) || role.name.startsWith('pg_');
                            const isDropdownOpen = openRoleDropdown === role.name;

                            return (
                                <div key={role.name} className="grid grid-cols-[2fr_1.5fr_1.5fr_auto] gap-4 p-3 items-center hover:bg-zinc-900/40 transition-colors">
                                    <div className="flex items-center gap-3 pl-2">
                                        <div className="w-7 h-7 rounded-md bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold uppercase border border-zinc-700/50 shadow-sm">
                                            {role.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-zinc-200 font-medium">{role.name}</span>
                                                {isProtected && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                        <ShieldCheck size={10} /> Sistema
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                        {role.createDb && <span className="px-2 py-0.5 rounded-full bg-zinc-800/50 border border-zinc-700/50">Crear DB</span>}
                                        {role.createRole && <span className="px-2 py-0.5 rounded-full bg-zinc-800/50 border border-zinc-700/50">Crear Rol</span>}
                                        {!role.createDb && !role.createRole && <span className="text-zinc-600 italic">Básicos</span>}
                                    </div>

                                    <div className="flex items-center text-xs text-zinc-400">
                                        — 
                                    </div>

                                    <div className="relative pr-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenDbDropdown(null);
                                                setOpenRoleDropdown(isDropdownOpen ? null : role.name);
                                            }}
                                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#2c2c2c] bg-transparent rounded-md transition-colors"
                                            aria-label="Acciones de rol"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {isDropdownOpen && (
                                            <div className="absolute right-2 top-full mt-1 w-max min-w-[170px] bg-[#1e1e1e] border border-zinc-800 rounded-lg shadow-2xl py-1 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                                                {!isProtected ? (
                                                    <>
                                                        <button 
                                                            onClick={() => { setRoleToReset(role.name); setOpenRoleDropdown(null); }}
                                                            className="w-full text-left px-4 py-2 text-[13px] font-medium text-zinc-100 hover:bg-[#2c2c2c] transition-colors whitespace-nowrap"
                                                        >
                                                            Restablecer contraseña
                                                        </button>
                                                        <button 
                                                            onClick={() => { handleDeleteRole(role.name); setOpenRoleDropdown(null); }}
                                                            className="w-full text-left px-4 py-2 text-[13px] font-medium text-zinc-100 hover:bg-[#2c2c2c] transition-colors whitespace-nowrap"
                                                        >
                                                            Eliminar rol
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="px-4 py-2 text-xs text-zinc-500 italic">
                                                        Los roles del sistema no pueden conectarse desde internet ni ser borrados.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {roles.length === 0 && (
                            <div className="p-8 text-center text-sm text-zinc-500">No se encontraron roles</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Databases Section */}
            <section className="flex flex-col gap-4 p-6 border border-[#262626] rounded-xl">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white tracking-tight">Bases de Datos</h2>
                        <button 
                            onClick={() => setIsCreateDbOpen(true)}
                            className="h-8 px-3 inline-flex items-center justify-center text-xs font-semibold text-white border border-zinc-700 bg-transparent rounded-md hover:bg-zinc-800 transition-colors shadow-sm"
                        >
                            Añadir base de datos
                        </button>
                    </div>
                    <div className="text-sm text-zinc-400">
                        <span>Administra las bases de datos lógicas de Postgres. Para información sobre cómo conectarte a ellas a través del pooler pgbouncer, consulta la Documentación.</span>
                    </div>
                </div>

                <div className="border border-[#262626] rounded-xl bg-[#0c0d0d] shadow-sm mt-2">
                    {/* Header Row */}
                    <div className="grid grid-cols-[2fr_1.5fr_1.5fr_auto] gap-4 p-3 border-b border-[#262626] bg-[#0c0d0d] text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        <div className="pl-2">Nombre</div>
                        <div>Propietario</div>
                        <div>Estado</div>
                        <div className="w-8"></div>
                    </div>

                    {/* Databases List */}
                    <div className="flex flex-col divide-y divide-[#262626]">
                        {databases.map(db => {
                            const isPrimary = db.name === projectSlug || db.name === 'main' || db.name === 'postgres';
                            const isDropdownOpen = openDbDropdown === db.name;

                            return (
                                <div key={db.name} className="grid grid-cols-[2fr_1.5fr_1.5fr_auto] gap-4 p-3 items-center hover:bg-zinc-900/40 transition-colors">
                                    <div className="flex items-center gap-3 pl-2">
                                        <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-sm">
                                            <Database size={14} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-zinc-200 font-medium">{db.name}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-xs text-zinc-400">
                                        <span className="px-2 py-0.5 rounded-md bg-zinc-800/50 border border-zinc-700/50 font-mono">
                                            {db.owner}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-xs">
                                        {isPrimary ? (
                                            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Primaria
                                            </span>
                                        ) : (
                                            <span className="text-zinc-500">Secundaria</span>
                                        )}
                                    </div>

                                    <div className="relative pr-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenRoleDropdown(null);
                                                setOpenDbDropdown(isDropdownOpen ? null : db.name);
                                            }}
                                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#2c2c2c] bg-transparent rounded-md transition-colors"
                                            aria-label="Acciones de base de datos"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {isDropdownOpen && (
                                            <div className="absolute right-2 top-full mt-1 w-max min-w-[170px] bg-[#1e1e1e] border border-zinc-800 rounded-lg shadow-2xl py-1 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                                                {!isPrimary ? (
                                                    <button 
                                                        onClick={() => { handleDeleteDatabase(db.name); setOpenDbDropdown(null); }}
                                                        className="w-full text-left px-4 py-2 text-[13px] font-medium text-zinc-100 hover:bg-[#2c2c2c] transition-colors whitespace-nowrap"
                                                    >
                                                        Eliminar base de datos
                                                    </button>
                                                ) : (
                                                    <div className="px-4 py-2 text-xs text-zinc-500 italic">
                                                        La base de datos primaria no puede ser eliminada. Funciona como root principal (template/conectividad).
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {databases.length === 0 && (
                            <div className="p-8 text-center text-sm text-zinc-500">No se encontraron bases de datos lógicas</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Modals */}
            <CreateRoleModal 
                isOpen={isCreateRoleOpen} 
                onClose={() => setIsCreateRoleOpen(false)} 
                projectSlug={projectSlug} 
                branchId={branchId}
                onSuccess={fetchData} 
            />
            
            <CreateDatabaseModal 
                isOpen={isCreateDbOpen} 
                onClose={() => setIsCreateDbOpen(false)} 
                projectSlug={projectSlug} 
                branchId={branchId}
                roles={roles}
                onSuccess={fetchData} 
            />

            <ResetPasswordModal 
                isOpen={!!roleToReset} 
                onClose={() => setRoleToReset(null)} 
                projectSlug={projectSlug} 
                branchId={branchId}
                roleName={roleToReset}
            />
        </div>
    );
}
