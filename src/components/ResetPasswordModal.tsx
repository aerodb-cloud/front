'use client';

import { useState } from 'react';
import { ApiClient } from '@/lib/api';
import { X, Copy, Check, KeyRound } from 'lucide-react';

interface ResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectSlug: string;
    branchId: string;
    roleName: string | null;
}

export function ResetPasswordModal({ isOpen, onClose, projectSlug, branchId, roleName }: ResetPasswordModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [newPassword, setNewPassword] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen || !roleName) return null;

    const handleCopy = () => {
        if (!newPassword) return;
        navigator.clipboard.writeText(newPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await ApiClient.post(`/projects/${projectSlug}/branches/${branchId}/roles/${roleName}/reset-password`, {});
            setNewPassword(data.password);
        } catch (err: any) {
            setError(err.message || 'Error executing request');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setNewPassword(null);
        setError('');
        setCopied(false);
        onClose();
    };

    if (newPassword) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                        <h2 className="text-lg font-semibold text-white">Contraseña Restablecida</h2>
                        <button onClick={handleClose} className="text-zinc-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        <p className="text-[14px] text-zinc-400 mb-6 leading-relaxed">
                            Copia esta nueva contraseña y guárdala en un lugar seguro. Por motivos de seguridad, <strong className="text-white">no volveremos a mostrartela</strong>.
                        </p>

                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="block text-[12px] font-medium text-zinc-400 mb-1">Nueva Contraseña para {roleName}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newPassword}
                                        readOnly
                                        className="w-full bg-[#111] border border-zinc-800 rounded-lg pl-4 pr-12 py-2.5 text-zinc-300 font-mono text-[13px] focus:outline-none"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-white transition-colors rounded-md hover:bg-zinc-800"
                                    >
                                        {copied ? <Check size={16} className="text-[#00e599]" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-zinc-800 flex justify-end">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-zinc-200 transition-colors"
                        >
                            Lo he guardado
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-semibold text-white">Restablecer Contraseña</h2>
                    <button onClick={handleClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700/50">
                        <KeyRound size={24} className="text-zinc-300" />
                    </div>
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-left">
                            {error}
                        </div>
                    )}
                    <h3 className="text-lg font-medium text-white mb-2">
                        ¿Restablecer contraseña para <span className="font-mono bg-zinc-800 px-1 py-0.5 rounded text-[15px]">{roleName}</span>?
                    </h3>
                    <p className="text-[14px] text-zinc-400 leading-relaxed max-w-sm mx-auto">
                        Cualquier aplicación que utilice las credenciales actuales del rol <strong className="text-zinc-300">{roleName}</strong> dejará de funcionar inmediatamente.
                    </p>
                </div>

                <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-[#161616]">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-semibold text-[#f87171] bg-red-950 border border-red-900/50 rounded-md hover:bg-red-900 transition-colors flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Restableciendo...' : 'Sí, restablecer la contraseña'}
                    </button>
                </div>
            </div>
        </div>
    );
}
