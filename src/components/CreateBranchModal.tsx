'use client';

import React, { useState } from 'react';
import { X, GitBranch, Clock, Database, Calendar, Circle, CheckCircle2, Info } from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTitle, TooltipDescription, TooltipTrigger } from '@/components/ui/tooltip';

interface Branch {
    id: string;
    name: string;
    type: string;
}

interface CreateBranchModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectSlug: string;
    branches: Branch[];
    onSuccess: () => void;
}

export function CreateBranchModal({ isOpen, onClose, projectSlug, branches, onSuccess }: CreateBranchModalProps) {
    const [name, setName] = useState('');
    const [parentBranchId, setParentBranchId] = useState('');

    const [autoDelete, setAutoDelete] = useState(true);
    const [autoDeleteSeconds, setAutoDeleteSeconds] = useState<number>(86400); // 1 day default
    const [isDefault, setIsDefault] = useState(false);

    const [dataSource, setDataSource] = useState<'current' | 'past' | 'schema'>('current');
    const [pastDate, setPastDate] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    // By default, select production or the first branch
    const defaultParentId = branches.find(b => b.type === 'production')?.id || branches[0]?.id || '';
    const selectedParentId = parentBranchId || defaultParentId;
    const selectedParentName = branches.find(b => b.id === selectedParentId)?.name || 'production';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('El nombre de la rama es requerido.');
            return;
        }

        if (dataSource === 'past' && !pastDate) {
            setError('Debes seleccionar una fecha y hora para los datos pasados.');
            return;
        }

        setLoading(true);

        try {
            const payload: any = {
                branchName: name,
                parentId: selectedParentId,
                type: 'preview'
            };

            if (autoDelete) {
                // Convert seconds back to days approx for our current simplistic backend, or keep as is if backend supports it.
                // Assuming backend expects days currently.
                payload.autoDeleteDays = Math.max(1, Math.round(autoDeleteSeconds / 86400));
            }

            if (dataSource === 'past') {
                payload.pastDate = new Date(pastDate).toISOString();
            } else if (dataSource === 'schema') {
                payload.schemaOnly = true;
            }

            if (isDefault) {
                payload.isDefault = true;
            }

            await ApiClient.post(`/projects/${projectSlug}/branches`, payload);

            // Clean up and notify success
            setName('');
            setAutoDelete(false);
            setDataSource('current');
            setPastDate('');
            setIsDefault(false);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al crear la rama.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000099] backdrop-blur-sm p-4">
            {/* Modal Container */}
            <div className="w-full max-w-[1000px] h-auto max-h-[90vh] flex flex-col bg-[#0c0c0c] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden font-sans">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 shrink-0">
                    <div className="flex items-center gap-4">
                        <h3 className="text-[18px] font-semibold text-white m-0 leading-none tracking-tight">Crear nueva rama</h3>
                        
                        {/* Parent Branch Selector mimicking Neon */}
                        <div className="flex items-center gap-3 border-l border-zinc-800 pl-4 ml-2">
                            <label className="text-[14px] text-zinc-400 font-medium">Rama padre</label>
                            <div className="relative">
                                <select 
                                    className="appearance-none bg-[#161618] border border-zinc-600/80 text-white text-[13px] font-medium py-1.5 pl-3 pr-8 rounded-[5px] outline-none focus:border-white focus:ring-[3px] focus:ring-zinc-800/80 hover:bg-[#1c1c1e] transition-all cursor-pointer"
                                    value={selectedParentId}
                                    onChange={(e) => setParentBranchId(e.target.value)}
                                >
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                    <path d="M7.41 8L12 12.58L16.59 8L18 9.41L12 15.41L6 9.41L7.41 8Z" fill="currentColor"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 p-1.5 rounded-md transition-colors"
                        aria-label="Cerrar modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-[400px]">
                    <form id="new-branch-form" onSubmit={handleSubmit} className="h-full flex flex-col lg:flex-row">
                        
                        {/* Left Content Area */}
                        <div className="flex-1 p-8 space-y-10">
                            
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md mb-6">
                                    {error}
                                </div>
                            )}

                            {/* Branch Name Input */}
                            <div>
                                <label className="block text-[14px] font-medium text-white mb-2">Nombre de la rama</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="main"
                                    className="w-full bg-[#161618] border border-zinc-600/80 rounded-[5px] px-3 py-[9px] text-[14px] text-white focus:outline-none focus:border-white focus:ring-[3px] focus:ring-zinc-800/80 transition-all font-mono"
                                    autoFocus
                                />
                            </div>

                            {/* TTL Checkbox & Select */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 border border-zinc-800/60 bg-[#111213]/50 p-4 rounded-xl">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${autoDelete ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-zinc-600 group-hover:border-zinc-500'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={autoDelete}
                                            onChange={(e) => setAutoDelete(e.target.checked)}
                                        />
                                        {autoDelete && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white"><path fillRule="evenodd" clipRule="evenodd" d="M10.6292 2.22279C11.0585 2.57028 11.1247 3.19997 10.7772 3.62923L5.9201 9.62923C5.74431 9.84638 5.48569 9.9801 5.20688 9.99798C4.92806 10.0159 4.65448 9.9163 4.45238 9.72339L1.30953 6.72339C0.910028 6.34205 0.895307 5.70906 1.27665 5.30956C1.65799 4.91006 2.29098 4.89534 2.69048 5.27668L5.04839 7.52741L9.22276 2.37083C9.57025 1.94157 10.1999 1.87529 10.6292 2.22279Z" fill="currentColor"></path></svg>}
                                    </div>
                                    <span className="text-[14px] font-medium text-white pointer-events-none">Eliminar rama automáticamente después de:</span>
                                </label>
                                
                                <div className="relative w-[120px] ml-7 sm:ml-0">
                                    <select 
                                        disabled={!autoDelete}
                                        value={autoDeleteSeconds}
                                        onChange={(e) => setAutoDeleteSeconds(Number(e.target.value))}
                                        className="w-full appearance-none bg-[#161618] border border-zinc-600/80 text-white text-[13px] font-medium py-1.5 pl-3 pr-8 rounded-[5px] outline-none focus:border-white focus:ring-[3px] focus:ring-zinc-800/80 hover:bg-[#1c1c1e] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <option value={3600}>1 hora</option>
                                        <option value={86400}>1 día</option>
                                        <option value={604800}>7 días</option>
                                    </select>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                        <path d="M7.41 8L12 12.58L16.59 8L18 9.41L12 15.41L6 9.41L7.41 8Z" fill="currentColor"></path>
                                    </svg>
                                </div>
                            </div>

                            {/* Set As Default Checkbox */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 border border-zinc-800/60 bg-[#111213]/50 p-4 rounded-xl">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${isDefault ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-zinc-600 group-hover:border-zinc-500'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={isDefault}
                                            onChange={(e) => {
                                                setIsDefault(e.target.checked);
                                                if(e.target.checked) setAutoDelete(false); // Default branches shouldn't auto-delete
                                            }}
                                        />
                                        {isDefault && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white"><path fillRule="evenodd" clipRule="evenodd" d="M10.6292 2.22279C11.0585 2.57028 11.1247 3.19997 10.7772 3.62923L5.9201 9.62923C5.74431 9.84638 5.48569 9.9801 5.20688 9.99798C4.92806 10.0159 4.65448 9.9163 4.45238 9.72339L1.30953 6.72339C0.910028 6.34205 0.895307 5.70906 1.27665 5.30956C1.65799 4.91006 2.29098 4.89534 2.69048 5.27668L5.04839 7.52741L9.22276 2.37083C9.57025 1.94157 10.1999 1.87529 10.6292 2.22279Z" fill="currentColor"></path></svg>}
                                    </div>
                                    <span className="text-[14px] font-medium text-white pointer-events-none">Establecer como rama predeterminada</span>
                                </label>
                            </div>

                            {/* Data & Schema Radio selection */}
                            <div className="space-y-3">
                                <label 
                                    className={`relative flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all ${dataSource === 'current' ? 'border-zinc-300 bg-[#161618]' : 'border-zinc-800 hover:border-zinc-600 bg-transparent'}`}
                                    onClick={() => setDataSource('current')}
                                >
                                    <div className="mt-1">
                                        {dataSource === 'current' ? (
                                            <div className="w-5 h-5 rounded-full border-[5px] border-[#0dc38e] bg-transparent"></div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-zinc-600 bg-transparent"></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className={`text-[15px] font-semibold mb-1 ${dataSource === 'current' ? 'text-white' : 'text-zinc-300'}`}>Datos actuales</div>
                                        <div className="text-[14px] text-zinc-400 leading-snug">Incluir datos de la rama padre hasta este momento.</div>
                                    </div>
                                </label>

                                <label 
                                    className={`relative flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all ${dataSource === 'past' ? 'border-zinc-300 bg-[#161618]' : 'border-zinc-800 hover:border-zinc-600 bg-transparent'}`}
                                    onClick={() => setDataSource('past')}
                                >
                                    <div className="mt-1">
                                    {dataSource === 'past' ? (
                                            <div className="w-5 h-5 rounded-full border-[5px] border-[#0dc38e] bg-transparent"></div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-zinc-600 bg-transparent"></div>
                                        )}
                                    </div>
                                    <div className="w-full">
                                        <div className={`text-[15px] font-semibold mb-1 ${dataSource === 'past' ? 'text-white' : 'text-zinc-300'}`}>Datos pasados</div>
                                        <div className="text-[14px] text-zinc-400 leading-snug">Incluir datos de la rama padre hasta una fecha y hora específicas.</div>
                                        
                                        {dataSource === 'past' && (
                                            <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="datetime-local"
                                                    value={pastDate}
                                                    onChange={(e) => setPastDate(e.target.value)}
                                                    className="w-full max-w-[250px] bg-[#0c0c0c] border border-zinc-600/80 text-white text-[13px] px-3 py-2 rounded-[5px] outline-none focus:border-white focus:ring-[3px] focus:ring-zinc-800/80 transition-all [color-scheme:dark]"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </label>

                                <label 
                                    className={`relative flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all ${dataSource === 'schema' ? 'border-zinc-300 bg-[#161618]' : 'border-zinc-800 hover:border-zinc-600 bg-transparent'}`}
                                    onClick={() => setDataSource('schema')}
                                >
                                    <div className="mt-1">
                                        {dataSource === 'schema' ? (
                                            <div className="w-5 h-5 rounded-full border-[5px] border-[#0dc38e] bg-transparent"></div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-zinc-600 bg-transparent"></div>
                                        )}
                                    </div>
                                    <div className="w-full">
                                        <div className={`text-[15px] font-semibold mb-1 ${dataSource === 'schema' ? 'text-white' : 'text-zinc-300'}`}>Solo esquema</div>
                                        <div className="text-[14px] text-zinc-400 leading-snug">Clona la estructura y tipos sin copiar registros de datos. Ideal para pruebas puras (0 MB adicionales).</div>
                                    </div>
                                </label>
                            </div>

                        </div>

                        {/* Aside Panel (Right Sidebar) */}
                        <div className="w-full lg:w-[320px] bg-[#161616] border-l border-zinc-800 p-8 shrink-0">
                            <ul className="space-y-8">
                                <li className="flex gap-4">
                                    <Info className="text-zinc-400 shrink-0 mt-0.5" size={18} />
                                    <div className="text-[13px] text-zinc-400 leading-relaxed font-medium">
                                        Una rama es una copia de tus datos para desarrollo o pruebas. Solo consume almacenamiento cuando haces cambios o cuando la rama queda fuera de la ventana de restauración.{' '}
                                        <a href="#" className="text-white hover:underline underline-offset-2 decoration-zinc-500 inline-flex items-center gap-1 font-semibold mt-1">
                                            Aprender más
                                            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" className="shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M1.25 18.75L1.25 1.25L7.55 1.25L7.55 2.75L2.75 2.75L2.75 17.25L17.25 17.25L17.25 12.45L18.75 12.45L18.75 18.75L1.25 18.75ZM17.25 3.81066L11.8637 9.197L10.803 8.13633L16.1893 2.75L11 2.75L11 1.25L18.75 1.25L18.75 9L17.25 9L17.25 3.81066Z" fill="currentColor"></path></svg>
                                        </a>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <GitBranch className="text-zinc-400 shrink-0 mt-0.5" size={18} />
                                    <div className="text-[13px] text-zinc-400 leading-relaxed font-medium">
                                        Puedes crear ramas automáticamente por cada{' '}
                                        <a href="#" className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#202123] hover:bg-[#2a2b2d] border border-zinc-700/50 rounded-md text-white font-medium transition-colors">
                                            pull request
                                        </a>
                                        {' '}o{' '}
                                        <a href="#" className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#202123] hover:bg-[#2a2b2d] border border-zinc-700/50 rounded-md text-white font-medium transition-colors mt-1">
                                            preview deployment
                                        </a>.
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </form>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800/80 bg-[#0c0c0c] shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-[14px] font-semibold text-white bg-transparent rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="new-branch-form"
                        disabled={loading || !name.trim()}
                        className="px-5 py-2 text-[14px] font-semibold text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] flex items-center justify-center shadow-md shadow-white/5"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-black border-r-transparent rounded-full animate-spin"></div>
                        ) : 'Crear'}
                    </button>
                </div>

            </div>
        </div>
    );
}
