import { useState, useEffect } from 'react';
import { X, Copy, Check, Info, ExternalLink, RefreshCw } from 'lucide-react';
import { ApiClient } from '@/lib/api';

interface ConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
    activeBranch: any;
    connectionString: string;
}

export default function ConnectModal({ isOpen, onClose, project, activeBranch, connectionString }: ConnectModalProps) {
    const [copied, setCopied] = useState(false);

    // Auth display states
    const [showPassword, setShowPassword] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [realPassword, setRealPassword] = useState<string | null>(null);
    const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

    // Only keep simple parameters derived from active branch defaults
    const [selectedBranch, setSelectedBranch] = useState(activeBranch?.name || 'production');
    const [connectionFormat, setConnectionFormat] = useState('psql'); // psql, parameters, uri, nextjs
    const [usePooler, setUsePooler] = useState(true);

    useEffect(() => {
        if (activeBranch) {
            setSelectedBranch(activeBranch.name);
        }
    }, [activeBranch]);

    // Reset local state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setShowPassword(false);
            setRealPassword(null);
            setCopied(false);
            setShowResetConfirmModal(false);
        }
    }, [isOpen]);

    if (!isOpen || !project) return null;

    // Parse connection string for tabular view
    // Format is roughly: postgresql://[user]:[password]@[host]:5432/[db]?sslmode=require
    let dbUser = 'neondb_owner';
    let dbHost = 'localhost';
    let dbPort = '5432';
    let dbName = selectedBranch;
    let baseOpts = 'sslmode=require';

    try {
        if (connectionString.startsWith('postgresql://')) {
            const temp = connectionString.replace('postgresql://', '');
            const [credentials, hostAndDb] = temp.split('@');
            if (credentials) {
                dbUser = credentials.split(':')[0];
            }
            if (hostAndDb) {
                const [hostPortChunk, dbAndOpts] = hostAndDb.split('/');
                const [parsedHost, parsedPort] = hostPortChunk.split(':');
                dbHost = parsedHost || 'localhost';
                if (parsedPort) dbPort = parsedPort;

                if (dbAndOpts) {
                    const [db, opts] = dbAndOpts.split('?');
                    dbName = db;
                    if (opts) baseOpts = opts;
                }
            }
        }
    } catch (e) { /* ignore parse errors */ }

    // Modify host/port for pooling if enabled
    const finalHostInfo = (() => {
        if (!usePooler) return { host: dbHost, port: dbPort };

        let poolerHost = dbHost;
        const parts = dbHost.split('.');
        if (parts.length > 0 && !parts[0].endsWith('-pooler')) {
            parts[0] = parts[0] + '-pooler';
            poolerHost = parts.join('.');
        }
        return { host: poolerHost, port: '6432' };
    })();

    const finalPassword = showPassword && realPassword ? realPassword : '****************';

    // In AERO, the dbUser is actually the endpointId (API Key ID).
    // The Neon Proxy dynamic routing requires the format `endpoint_id$username`.
    const finalUser = usePooler ? `${dbUser}$${dbUser}` : dbUser;

    // Build strings
    const getUriString = () => `postgresql://${finalUser}:${finalPassword}@${finalHostInfo.host}:${finalHostInfo.port}/${dbName}?${baseOpts}`;

    const getDisplayString = () => {
        if (connectionFormat === 'parameters') return ''; // we render parameters manually
        if (connectionFormat === 'nextjs') {
            return `DATABASE_URL='${getUriString()}'`;
        }
        if (connectionFormat === 'psql') {
            return `psql '${getUriString()}'`;
        }
        return getUriString();
    };

    const copyToClipboard = () => {
        let textToCopy = getDisplayString();
        if (connectionFormat === 'parameters') {
            textToCopy = `PGHOST='${finalHostInfo.host}'\nPGPORT='${finalHostInfo.port}'\nPGDATABASE='${dbName}'\nPGUSER='${finalUser}'\nPGPASSWORD='${finalPassword}'\nPGSSLMODE='require'`;
        }
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleHideQuickActions = () => {
        const hideUntil = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours from now
        localStorage.setItem(`hide_quick_actions_${project.slug}`, hideUntil.toString());
        // We can't actually set the parent state here, it will be handled by page.tsx
    };

    const handleExecuteReset = async () => {
        try {
            setIsResetting(true);
            const data = await ApiClient.post(`/projects/${project.slug}/reset-password`, {});
            if (data.newPassword) {
                setRealPassword(data.newPassword);
                setShowPassword(true);
                setShowResetConfirmModal(false);
            }
        } catch (error) {
            console.error('Failed to reset password:', error);
            alert('Error al restablecer contraseña. Por favor, inténtalo de nuevo.');
        } finally {
            setIsResetting(false);
        }
    };

    const handleShowPasswordClick = () => {
        if (realPassword) {
            setShowPassword(!showPassword);
        } else {
            setShowResetConfirmModal(true);
        }
    };

    // Close on click outside
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-[#0e0e0e] border border-zinc-800 rounded-xl w-full max-w-[750px] shadow-2xl overflow-hidden shadow-black/50 animate-in fade-in zoom-in duration-200 relative">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                    <h2 className="text-[18px] font-semibold text-white tracking-tight">Conéctate a tu base de datos</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800/80 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Selectors Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        {/* Branch Select */}
                        <div>
                            <label className="block text-[13px] font-medium text-zinc-300 mb-1.5">Rama</label>
                            <div className="relative">
                                <select
                                    className="w-full px-3 py-2 text-[14px] text-white bg-[#131313] border border-zinc-700 rounded-lg appearance-none focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-shadow disabled:opacity-50"
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    title="Branch"
                                >
                                    {project.branches?.map((b: any) => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                    )) || <option value={selectedBranch}>{selectedBranch}</option>}
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Compute Select (Fixed) */}
                        <div>
                            <label className="block text-[13px] font-medium text-zinc-300 mb-1.5">Cómputo</label>
                            <div className="relative opacity-70">
                                <select
                                    className="w-full px-3 py-2 text-[14px] text-white bg-[#131313] border border-zinc-700 rounded-lg appearance-none focus:outline-none pointer-events-none"
                                    disabled
                                    title="Compute endpoint"
                                >
                                    <option>Principal (Activo)</option>
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                        {/* Database Select */}
                        <div>
                            <label className="block text-[13px] font-medium text-zinc-300 mb-1.5">Base de datos</label>
                            <div className="relative opacity-70">
                                <select
                                    className="w-full px-3 py-2 text-[14px] text-white bg-[#131313] border border-zinc-700 rounded-lg appearance-none focus:outline-none pointer-events-none"
                                    disabled
                                    title="Database"
                                >
                                    <option>{dbName}</option>
                                </select>
                            </div>
                        </div>

                        {/* Role Select */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-[13px] font-medium text-zinc-300">Rol</label>
                                <button
                                    onClick={() => setShowResetConfirmModal(true)}
                                    className="text-[13px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Restablecer contraseña
                                </button>
                            </div>
                            <div className="relative opacity-70">
                                <select
                                    className="w-full px-3 py-2 text-[14px] text-white bg-[#131313] border border-zinc-700 rounded-lg appearance-none focus:outline-none pointer-events-none"
                                    disabled
                                    title="Role"
                                >
                                    <option>{dbUser}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* NEW NEON DESIGN SNIPPET AREA */}
                    <div className="flex flex-col gap-3">
                        {/* Snippet Header: Format Selector & Pooler Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="relative">
                                {/* Format Dropdown */}
                                <select
                                    className="appearance-none bg-transparent text-white font-semibold text-[14px] pr-5 cursor-pointer focus:outline-none"
                                    value={connectionFormat}
                                    onChange={(e) => setConnectionFormat(e.target.value)}
                                >
                                    <option value="psql" className="bg-[#1a1a1a]">psql</option>
                                    <option value="parameters" className="bg-[#1a1a1a]">Solo parámetros</option>
                                    <option value="uri" className="bg-[#1a1a1a]">Cadena de conexión</option>
                                    <option value="nextjs" className="bg-[#1a1a1a]">Next.js</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-zinc-400">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 relative group/tooltip">
                                {/* Toggle switch */}
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setUsePooler(!usePooler)}>
                                    <div className={`w-8 h-4 rounded-full flex items-center px-[2px] transition-colors ${usePooler ? 'bg-[#00e599]' : 'bg-zinc-600'}`}>
                                        <div className={`w-[13px] h-[13px] bg-white rounded-full shadow-sm transition-transform ${usePooler ? 'translate-x-[15px]' : 'translate-x-0'}`}></div>
                                    </div>
                                    <span className="text-[13px] font-semibold text-white">Connection pooling</span>
                                </div>

                                <Info size={14} className="text-zinc-400 ml-1 cursor-help" />

                                <div className="absolute right-0 bottom-full mb-2 w-72 bg-[#1e1e1e] border border-zinc-700 p-4 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-[70] pointer-events-none text-left">
                                    <ul className="text-[12px] text-zinc-300 space-y-2 list-disc pl-4 mb-3">
                                        <li>Admite hasta 10.000 conexiones simultáneas.</li>
                                        <li>Utiliza PgBouncer para agrupar conexiones, lo cual se recomienda para la mayoría de los casos de uso.</li>
                                        <li>Utilice una conexión directa para <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-200">pg_dump</code>, funciones dependientes de la sesión o migraciones de esquema.</li>
                                        <li>El límite de conexión sin agrupamiento es 839.</li>
                                    </ul>
                                    <a href="https://neon.tech/docs/connect/connection-pooling" target="_blank" rel="noreferrer" className="text-[12px] font-medium text-blue-400 hover:text-blue-300 pointer-events-auto flex items-center gap-1 transition-colors w-fit">
                                        Más información <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Snippet Box */}
                        <div className="border border-[#2a2a2a] rounded-lg bg-[#181818] overflow-hidden">
                            {/* Optional Tabs for certain formats */}
                            {(connectionFormat === 'psql' || connectionFormat === 'uri') && (
                                <div className="flex items-center gap-6 px-4 pt-3 border-b border-[#2a2a2a]">
                                    <button className="pb-3 text-[14px] font-semibold text-white border-b-[2px] border-white -mb-[1px]">
                                        Cadena de conexión
                                    </button>
                                </div>
                            )}

                            {connectionFormat === 'nextjs' && (
                                <div className="flex items-center gap-6 px-4 pt-3 border-b border-[#2a2a2a]">
                                    <button className="pb-3 text-[14px] font-semibold text-white border-b-[2px] border-white -mb-[1px]">
                                        .env
                                    </button>
                                </div>
                            )}

                            {/* Code Area */}
                            {connectionFormat === 'parameters' ? (
                                <div className="p-4 bg-[#0a0a0a] rounded-xl overflow-hidden font-mono text-[13px] leading-6 border border-[#2a2a2a] m-3">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex">
                                            <span className="text-zinc-500 w-24">PGHOST</span>
                                            <span className="text-[#00e599] flex-1 select-all">'{finalHostInfo.host}'</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-zinc-500 w-24">PGPORT</span>
                                            <span className="text-[#00e599] flex-1 select-all">'{finalHostInfo.port}'</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-zinc-500 w-24">PGDATABASE</span>
                                            <span className="text-[#00e599] flex-1 select-all">'{dbName}'</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-zinc-500 w-24">PGUSER</span>
                                            <span className="text-[#00e599] flex-1 select-all">'{finalUser}'</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-zinc-500 w-24">PGPASSWORD</span>
                                            <span className="text-[#00e599] flex-1 select-all">'{finalPassword}'</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-zinc-500 w-24">PGSSLMODE</span>
                                            <span className="text-[#00e599] flex-1 select-all">'require'</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 min-h-[140px] flex items-center">
                                    <code className="text-[14px] font-mono leading-relaxed block whitespace-pre-wrap break-all">
                                        {connectionFormat === 'nextjs' ? (
                                            <>
                                                <div className="text-[#c678dd] italic mb-2"># keep Neon credentials secure: do not expose them to client-side code</div>
                                                <div className="text-zinc-200">DATABASE_URL=<span className="text-[#00e599]">"{getUriString()}"</span></div>
                                            </>
                                        ) : connectionFormat === 'psql' ? (
                                            <div className="text-zinc-200">psql <span className="text-[#00e599]">'{getUriString()}'</span></div>
                                        ) : (
                                            <div className="text-[#00e599]">{getUriString()}</div>
                                        )}
                                    </code>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center gap-6 px-4 py-3 border-t border-[#2a2a2a] bg-[#1e1e1e]">
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-300 hover:text-white transition-colors py-1.5 rounded"
                                >
                                    {copied ? <Check size={14} className="text-[#00e599]" /> : <Copy size={14} />}
                                    {copied ? 'Copiado' : 'Copiar fragmento'}
                                </button>

                                <button
                                    onClick={handleShowPasswordClick}
                                    className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-300 hover:text-white transition-colors py-1.5 rounded"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    {realPassword && showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer details */}
                <div className="px-6 py-4 bg-[#141414] border-t border-[#2a2a2a] flex items-center justify-between text-[13px] text-zinc-400">
                    <span>
                        Por motivos de seguridad no almacenamos su contraseña. Guárdela en un lugar seguro; en caso de pérdida, será necesario restablecerla.
                    </span>
                </div>

                {/* Reset Confirmation Modal */}
                {showResetConfirmModal && (
                    <div
                        className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#1e1e1e] border border-zinc-700 rounded-lg shadow-2xl w-[90%] max-w-[420px] overflow-hidden animate-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                                <h3 className="text-[16px] font-semibold text-white">Restablecer contraseña</h3>
                                <button
                                    onClick={() => setShowResetConfirmModal(false)}
                                    className="text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-5">
                                <p className="text-[14px] text-zinc-300 mb-4 leading-relaxed">
                                    Estás a punto de restablecer la contraseña para el rol <code className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded text-[13px] break-all">{dbUser}</code> en la rama <code className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded text-[13px] break-all">{selectedBranch}</code>.
                                </p>
                                <p className="text-[14px] text-zinc-300 mb-6 leading-relaxed">
                                    Después del restablecimiento, la contraseña actual ya no será válida ni accesible.
                                </p>
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => setShowResetConfirmModal(false)}
                                        className="px-4 py-2 text-[13px] font-semibold text-white bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 rounded-md transition-all duration-200 shadow-sm"
                                        disabled={isResetting}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleExecuteReset}
                                        className="px-4 py-2 text-[13px] font-semibold text-black bg-white hover:bg-zinc-200 rounded-md transition-colors flex items-center gap-2 shadow-sm"
                                        disabled={isResetting}
                                    >
                                        {isResetting && <RefreshCw size={14} className="animate-spin" />}
                                        Restablecer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
