'use client';

import { useState } from 'react';
import { ApiClient } from '@/lib/api';
import { X, Copy, Check } from 'lucide-react';

interface CreateRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectSlug: string;
    branchId: string;
    onSuccess: () => void;
}

export function CreateRoleModal({ isOpen, onClose, projectSlug, branchId, onSuccess }: CreateRoleModalProps) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [newCredentials, setNewCredentials] = useState<{ name: string; password: string } | null>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        if (!newCredentials) return;
        navigator.clipboard.writeText(newCredentials.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadEnv = () => {
        if (!newCredentials) return;
        const content = `PGUSER=${newCredentials.name}\nPGPASSWORD=${newCredentials.password}\n`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `.env`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await ApiClient.post(`/projects/${projectSlug}/branches/${branchId}/roles`, { roleName: name });
            setNewCredentials(data.role);
        } catch (err: any) {
            setError(err.message || 'Error executing request');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        const fetchNeeded = !!newCredentials;
        setName('');
        setNewCredentials(null);
        setError('');
        setCopied(false);
        onClose();
        if (fetchNeeded) onSuccess();
    };

    if (newCredentials) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-[#1c1c1c] border border-[#262626] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-[#262626]">
                        <h2 className="text-lg font-semibold text-white">¡Rol creado!</h2>
                        <button onClick={handleClose} className="text-zinc-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        <p className="text-[14px] text-[#e6e6e6] mb-6">
                            El rol <span className="bg-zinc-800/80 px-1.5 py-0.5 rounded font-mono text-zinc-300 text-[13px] mx-1 border border-zinc-700">{newCredentials.name}</span> fue creado exitosamente. Copia la contraseña o descarga el archivo .env.
                        </p>

                        <div className="mb-6">
                            <label className="block text-[14px] font-medium text-[#e6e6e6] mb-2">Contraseña:</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newCredentials.password}
                                    readOnly
                                    className="w-full bg-[#111] border border-[#262626] rounded-md pl-4 pr-12 py-2.5 text-zinc-300 font-mono text-[13px] focus:outline-none"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white transition-colors rounded hover:bg-[#2c2c2c]"
                                    title="Copiar contraseña"
                                >
                                    {copied ? <Check size={16} className="text-[#00e599]" /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>

                        <p className="text-[14px] text-[#e6e6e6] mb-6">
                            Descarga el archivo .env para guardar la contraseña del usuario.
                        </p>

                        <div className="flex justify-start">
                            <button
                                onClick={handleDownloadEnv}
                                className="h-9 px-4 inline-flex items-center justify-center text-[13px] font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors shadow-sm"
                            >
                                Descargar .env
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-semibold text-white">Creación de rol</h2>
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
                            Crea un usuario nativo de PostgreSQL. Este rol solo existirá en esta rama y se clonará a sus hijas.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Nombre del rol
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ej. analista_bi"
                                className="w-full bg-[#111] border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-zinc-500 font-mono text-sm"
                                required
                                pattern="^[a-z_][a-z0-9_-]{0,62}$"
                                title="Solo minúsculas, números, guiones y guiones bajos. Debe empezar por letra o guión bajo."
                            />
                            <p className="text-[12px] text-zinc-500 mt-2">
                                Se generará una contraseña segura automáticamente.
                            </p>
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
                            disabled={loading || !name}
                            className={`px-4 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-zinc-200 transition-colors flex items-center gap-2 ${loading || !name ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creando...' : 'Crear Rol'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
