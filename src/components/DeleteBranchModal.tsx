'use client';

import React, { useState } from 'react';

interface Branch {
    id: string;
    name: string;
    type: string;
}

interface DeleteBranchModalProps {
    isOpen: boolean;
    onClose: () => void;
    branch: Branch | null;
    onConfirm: () => Promise<void>;
}

export function DeleteBranchModal({ isOpen, onClose, branch, onConfirm }: DeleteBranchModalProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !branch) return null;

    const handleDelete = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Failed to delete branch', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <section className="bg-[#121212] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-[580px] overflow-hidden" role="dialog" aria-labelledby="delete-modal-title" tabIndex={-1}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                    <h2 id="delete-modal-title" className="text-[18px] font-semibold text-white tracking-tight">
                        ¿Eliminar la rama?
                    </h2>
                    <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white transition-colors" type="button" aria-label="Descartar">
                        <span className="w-5 h-5 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 16" role="img" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M7.64 8.03 2.67 3.06 3.73 2 8.7 6.97 13.67 2l1.06 1.06-4.97 4.97L14.73 13l-1.06 1.06L8.7 9.1l-4.97 4.97L2.67 13z" clipRule="evenodd"></path></svg>
                        </span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-[#f87171]/10 border border-[#f87171]/20 rounded-xl" role="alert">
                        <div className="shrink-0 mt-0.5 text-[#f87171]">
                            <span className="w-5 h-5 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="none" viewBox="0 0 16 17" role="img" aria-hidden="true"><path fill="currentColor" d="M8 1.25q.42.01.65.37l7.25 12.5a.75.75 0 0 1-.65 1.13H.75a.75.75 0 0 1-.65-1.13l7.25-12.5A.8.8 0 0 1 8 1.25m0 2.24L2.05 13.75h11.9zm-.75 6.76v-3.5h1.5v3.5zm.75 2.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" clipRule="evenodd"></path></svg>
                            </span>
                        </div>
                        <div className="text-[14px] text-zinc-200 leading-relaxed font-medium">
                            Esto eliminará permanentemente la rama <code className="bg-[#f87171]/10 text-[#f87171] px-1.5 py-0.5 rounded font-mono font-medium text-[13px]">{branch.name}</code>. ¿Estás seguro de que quieres continuar?
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-2">
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
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-4 py-2 text-[14px] font-medium text-white bg-[#e5484d] hover:bg-[#ce2c31] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                        >
                            {loading ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
