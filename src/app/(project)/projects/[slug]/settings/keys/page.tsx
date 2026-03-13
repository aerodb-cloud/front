'use client';

import { useEffect, useState, use } from 'react';
import { ApiClient } from '@/lib/api';
import { Copy, Check, Plus, Trash2, Key, AlertTriangle, X, Eye, EyeOff } from 'lucide-react';

interface ApiKeyItem {
    id: string;
    name: string;
    prefix: string;
    createdAt: string;
    lastUsedAt: string | null;
}

interface CreatedKey {
    id: string;
    name: string;
    prefix: string;
    key: string; // full plaintext key, shown ONCE
    createdAt: string;
}

export default function ApiKeysPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [keys, setKeys] = useState<ApiKeyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Create Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [creating, setCreating] = useState(false);

    // Success Modal (one-time key display)
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null);
    const [copied, setCopied] = useState(false);
    const [keyVisible, setKeyVisible] = useState(false);

    // Delete Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState<ApiKeyItem | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchKeys = async () => {
        try {
            const data = await ApiClient.get(`/projects/${slug}/keys`);
            setKeys(data.keys || []);
        } catch (e: any) {
            console.error('Failed to fetch API keys:', e);
            setError(e.message || 'Error al cargar las API Keys');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, [slug]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;
        setCreating(true);
        try {
            const data = await ApiClient.request(`/projects/${slug}/keys`, {
                method: 'POST',
                body: JSON.stringify({ name: newKeyName.trim() }),
            });
            setCreatedKey(data.apiKey);
            setShowCreateModal(false);
            setNewKeyName('');
            setShowSuccessModal(true);
            setCopied(false);
            setKeyVisible(false);
            fetchKeys();
        } catch (e: any) {
            console.error('Failed to create API key:', e);
            alert(e.message || 'Error al crear la API Key');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteConfirm = async (keyId: string) => {
        setDeletingId(keyId);
        try {
            await ApiClient.delete(`/projects/${slug}/keys/${keyId}`);
            setKeys(prev => prev.filter(k => k.id !== keyId));
            setShowDeleteModal(false);
            setKeyToDelete(null);
        } catch (e: any) {
            console.error('Failed to delete API key:', e);
            alert(e.message || 'Error al eliminar la API Key');
        } finally {
            setDeletingId(null);
        }
    };

    const handleCopyKey = () => {
        if (createdKey) {
            navigator.clipboard.writeText(createdKey.key);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const maskKey = (key: string) => {
        return key.substring(0, 16) + '••••••••••••••••••••••••••••••••••••••••••••••••••';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) return <div className="p-10 text-zinc-400">Cargando API Keys...</div>;

    return (
        <div className="w-full max-w-[800px] mx-auto p-12">
            <div className="mb-10">
                <h1 className="text-[32px] font-bold text-white tracking-tight">API Keys</h1>
                <p className="text-[14px] text-zinc-400 mt-2 leading-relaxed">
                    Gestiona las claves de API para acceso programático a tu proyecto. Las claves solo se muestran una vez al crearlas.
                </p>
            </div>

            {/* API Keys Panel */}
            <section className="p-6 border rounded-xl border-zinc-800/80 bg-[#0e0e0e] shadow-sm mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-white">Claves activas</h2>
                    <button
                        onClick={() => { setShowCreateModal(true); setNewKeyName(''); }}
                        type="button"
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-black bg-white rounded-md hover:bg-zinc-200 transition-colors"
                    >
                        <Plus size={14} />
                        Crear API Key
                    </button>
                </div>

                {error && (
                    <div className="p-4 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {keys.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 border border-zinc-800 rounded-xl bg-[#131313]">
                        <div className="w-14 h-14 rounded-full bg-zinc-800/50 flex items-center justify-center mb-5">
                            <Key size={24} className="text-zinc-500" />
                        </div>
                        <p className="text-zinc-300 font-medium text-[15px] mb-1">No hay API Keys</p>
                        <p className="text-zinc-500 text-[13px]">Crea una clave para conectar aplicaciones externas a tu proyecto.</p>
                    </div>
                ) : (
                    <div className="border border-zinc-800 flex flex-col rounded-xl bg-[#0c0c0c] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#111111] border-b border-zinc-800">
                                <tr>
                                    <th className="px-5 py-3 text-[12px] font-medium text-zinc-400 uppercase tracking-wider">Nombre</th>
                                    <th className="px-5 py-3 text-[12px] font-medium text-zinc-400 uppercase tracking-wider">Clave</th>
                                    <th className="px-5 py-3 text-[12px] font-medium text-zinc-400 uppercase tracking-wider">Creada</th>
                                    <th className="px-5 py-3 text-[12px] font-medium text-zinc-400 uppercase tracking-wider">Último uso</th>
                                    <th className="px-5 py-3 w-[60px]"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {keys.map((k) => (
                                    <tr key={k.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors group">
                                        <td className="px-5 py-3.5 text-[14px] text-zinc-200 font-medium">{k.name}</td>
                                        <td className="px-5 py-3.5">
                                            <code className="text-[13px] text-zinc-400 font-mono bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800/50">
                                                {k.prefix}••••••••
                                            </code>
                                        </td>
                                        <td className="px-5 py-3.5 text-[13px] text-zinc-500">{formatDate(k.createdAt)}</td>
                                        <td className="px-5 py-3.5 text-[13px] text-zinc-500">
                                            {k.lastUsedAt ? formatDate(k.lastUsedAt) : <span className="text-zinc-600">Nunca</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            {k.name !== 'Default Key' && (
                                                <button
                                                    onClick={() => {
                                                        setKeyToDelete(k);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    disabled={deletingId === k.id}
                                                    className="p-1.5 text-zinc-500 hover:text-red-400 rounded-md hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                    title="Revocar API Key"
                                                >
                                                    {deletingId === k.id ? (
                                                        <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Security Info */}
            <div className="flex items-start gap-3 px-1">
                <AlertTriangle size={14} className="text-zinc-500 shrink-0 mt-0.5" />
                <p className="text-[12.5px] text-zinc-500 leading-relaxed">
                    Las API Keys proporcionan acceso completo al proyecto. Mantenlas seguras y nunca las compartas en repositorios públicos. Si una clave se ve comprometida, revócala inmediatamente.
                </p>
            </div>

            {/* ─── CREATE MODAL ─── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <section className="bg-[#111111] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-[440px] overflow-hidden" role="dialog" aria-modal="true">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#161616]">
                            <h2 className="text-[17px] font-semibold text-white">Crear nueva API Key</h2>
                            <button onClick={() => setShowCreateModal(false)} type="button" className="text-zinc-500 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="p-5 space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-[14px] font-medium text-zinc-300" htmlFor="keyName">
                                        Nombre de la clave
                                    </label>
                                    <input
                                        id="keyName"
                                        type="text"
                                        placeholder="ej. Producción Vercel, CI/CD Pipeline"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        autoFocus
                                        className="w-full px-3 py-2.5 text-[14px] bg-[#0c0d0d] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-shadow placeholder:text-zinc-600"
                                    />
                                    <p className="text-[12px] text-zinc-500">Un nombre descriptivo para identificar dónde se usa esta clave.</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-zinc-800 bg-[#161616]">
                                <button onClick={() => setShowCreateModal(false)} type="button" className="px-5 py-2 text-sm font-medium text-white bg-transparent border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || !newKeyName.trim()}
                                    className="px-5 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-300"
                                >
                                    {creating ? 'Generando...' : 'Crear API Key'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {/* ─── SUCCESS MODAL (ONE-TIME KEY DISPLAY) ─── */}
            {showSuccessModal && createdKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <section className="bg-[#111111] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-[540px] overflow-hidden" role="dialog" aria-modal="true">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#161616]">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#00e5bf]/10 flex items-center justify-center">
                                    <Check size={14} className="text-[#00e5bf]" />
                                </div>
                                <h2 className="text-[17px] font-semibold text-white">API Key creada</h2>
                            </div>
                        </div>
                        <div className="p-5 space-y-5">
                            {/* CRITICAL WARNING */}
                            <div className="p-4 bg-[#3f0f14] border border-[#7f1d1d] rounded-lg flex items-start gap-3">
                                <AlertTriangle size={18} className="text-[#f87171] shrink-0 mt-[1px]" />
                                <div className="text-[13.5px] text-[#fca5a5] leading-relaxed font-medium">
                                    <p className="font-bold text-white mb-1">⚠️ Guarda esta clave ahora</p>
                                    <p>Esta es la <strong>única vez</strong> que se mostrará la clave completa. No podrás recuperarla después de cerrar este diálogo. Cópiala y guárdala en un lugar seguro.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[13px] font-medium text-zinc-400">Nombre</label>
                                <div className="text-[14px] text-white font-medium">{createdKey.name}</div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[13px] font-medium text-zinc-400">Tu API Key</label>
                                <div className="flex items-center bg-[#0a0a0a] border border-zinc-800 rounded-lg overflow-hidden">
                                    <code className="flex-1 px-4 py-3 text-[13px] text-[#00e5bf] font-mono break-all select-all">
                                        {keyVisible ? createdKey.key : maskKey(createdKey.key)}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={() => setKeyVisible(!keyVisible)}
                                        className="px-3 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border-l border-zinc-800"
                                        title={keyVisible ? 'Ocultar' : 'Mostrar'}
                                    >
                                        {keyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCopyKey}
                                        className="px-3 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border-l border-zinc-800"
                                        title="Copiar al portapapeles"
                                    >
                                        {copied ? <Check size={16} className="text-[#00e5bf]" /> : <Copy size={16} />}
                                    </button>
                                </div>
                                {copied && (
                                    <p className="text-[12px] text-[#00e5bf] font-medium animate-pulse">
                                        ✓ Copiado al portapapeles
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-zinc-800 bg-[#161616]">
                            <button
                                onClick={() => { setShowSuccessModal(false); setCreatedKey(null); }}
                                type="button"
                                className="px-5 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors"
                            >
                                He guardado la clave
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {/* ─── DELETE MODAL ─── */}
            {showDeleteModal && keyToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <section className="bg-[#111111] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-[440px] overflow-hidden" role="dialog" aria-modal="true">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#161616]">
                            <h2 className="text-[17px] font-semibold text-white">Revocar API Key</h2>
                            <button onClick={() => { setShowDeleteModal(false); setKeyToDelete(null); }} type="button" className="text-zinc-500 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="p-4 bg-[#3f0f14] border border-[#7f1d1d] rounded-lg flex items-start gap-4" role="alert">
                                <AlertTriangle size={18} className="text-[#f87171] shrink-0 mt-[1px]" />
                                <div className="text-[14px] text-[#fca5a5] leading-relaxed">
                                    ¿Estás seguro de que deseas revocar la clave <code className="font-mono bg-[#54141b] text-white px-1 py-0.5 rounded">{keyToDelete.name}</code>? Las aplicaciones que la estén usando perderán acceso inmediatamente. Esta acción no se puede deshacer.
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-zinc-800 bg-[#161616]">
                            <button onClick={() => { setShowDeleteModal(false); setKeyToDelete(null); }} type="button" className="px-5 py-2 text-sm font-medium text-white bg-transparent border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteConfirm(keyToDelete.id)}
                                disabled={deletingId === keyToDelete.id}
                                type="button"
                                className="px-5 py-2 text-sm font-medium text-white bg-[#dc2626] border border-transparent rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#dc2626]/50"
                            >
                                {deletingId === keyToDelete.id ? 'Revocando...' : 'Revocar Clave'}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
