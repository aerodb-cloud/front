'use client';

import { useState } from 'react';
import { ApiClient } from '@/lib/api';
import { X } from 'lucide-react';

interface CreateDatabaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectSlug: string;
    branchId: string;
    roles: any[];
    onSuccess: () => void;
}

export function CreateDatabaseModal({ isOpen, onClose, projectSlug, branchId, roles, onSuccess }: CreateDatabaseModalProps) {
    const [name, setName] = useState('');
    const [owner, setOwner] = useState(roles[0]?.name || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await ApiClient.post(`/projects/${projectSlug}/branches/${branchId}/databases`, { dbName: name, owner });
            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.message || 'Error executing request');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setOwner(roles[0]?.name || '');
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-semibold text-white">Nueva Base de Datos</h2>
                    <button onClick={handleClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleCreate}>
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                {error}
                            </div>
                        )}
                        <p className="text-[14px] text-zinc-400 mb-6 leading-relaxed">
                            Crea una nueva base de datos lógica en esta rama. 
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Nombre de la base de datos
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ej. analytics_db"
                                className="w-full bg-[#111] border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-zinc-500 font-mono text-sm"
                                required
                                pattern="^[a-z_][a-z0-9_-]{0,62}$"
                                title="Solo minúsculas, números, guiones y guiones bajos. Debe empezar por letra o guión bajo."
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Propietario (Owner)
                            </label>
                            <select
                                value={owner}
                                onChange={(e) => setOwner(e.target.value)}
                                className="w-full bg-[#111] border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 font-mono text-sm appearance-none"
                                required
                            >
                                {roles.map(r => (
                                    <option key={r.name} value={r.name}>{r.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-zinc-800 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name || !owner}
                            className={`px-4 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-zinc-200 transition-colors flex items-center gap-2 ${loading || !name || !owner ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creando...' : 'Crear Base de Datos'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
