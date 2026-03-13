'use client';

import React, { useState } from 'react';

interface Branch {
    id: string;
    name: string;
    type: string;
}

interface SetDefaultBranchModalProps {
    isOpen: boolean;
    onClose: () => void;
    branch: Branch | null;
    onSuccess: () => void;
    projectId: string; // the project ID or slug for the API call
}

export function SetDefaultBranchModal({ isOpen, onClose, branch, onSuccess, projectId }: SetDefaultBranchModalProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !branch) return null;

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const { ApiClient } = await import('../lib/api');
            await ApiClient.patch(`/projects/${projectId}/branches/${branch.id}/default`, {});
            onSuccess();
        } catch (error) {
            console.error('Failed to set default branch', error);
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <section className="bg-[#121212] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-[580px] overflow-hidden" role="dialog" aria-labelledby="set-default-modal-title" tabIndex={-1}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                    <h2 id="set-default-modal-title" className="text-[18px] font-semibold text-white tracking-tight">
                        Establecer como predeterminada
                    </h2>
                    <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white transition-colors" type="button" aria-label="Cerrar">
                        <span className="w-5 h-5 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 16" role="img" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M7.64 8.03 2.67 3.06 3.73 2 8.7 6.97 13.67 2l1.06 1.06-4.97 4.97L14.73 13l-1.06 1.06L8.7 9.1l-4.97 4.97L2.67 13z" clipRule="evenodd"></path></svg>
                        </span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-6">
                    <div className="flex flex-col text-zinc-300 gap-4">
                        <div className="text-[14px]">
                            <code className="bg-zinc-800/80 text-white px-1.5 py-0.5 rounded font-mono font-medium text-[13px]">{branch.name}</code> se establecerá como tu rama predeterminada.
                        </div>
                        <div className="text-[14px] text-zinc-400 leading-relaxed font-normal">
                            El endpoint de cómputo asociado con la rama predeterminada permanece accesible si excedes los límites del proyecto, asegurando acceso ininterrumpido a los datos en la rama predeterminada.
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                        <div className="text-[13px] text-zinc-400">
                            Consulta <a href="https://neon.com/docs/manage/branches" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Rama predeterminada</a> para más detalles.
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="px-4 py-2 text-[14px] font-medium text-white bg-transparent border border-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={() => handleSubmit()}
                                disabled={loading}
                                className="px-4 py-2 text-[14px] font-medium text-black bg-white hover:bg-zinc-200 disabled:bg-zinc-600 disabled:text-zinc-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center shadow-md shadow-white/5"
                            >
                                {loading ? 'Guardando...' : 'Establecer predeterminada'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
