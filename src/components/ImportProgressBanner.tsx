'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api';
import { Loader2, Database, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImportProgressBanner({ slug, branchId }: { slug: string, branchId: string }) {
    const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'failed' | null>('idle');
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        let isMounted = true;
        const checkStatus = async () => {
            try {
                const data = await ApiClient.getImportStatus(slug, branchId);
                if (!isMounted) return;
                
                setStatus(data.importStatus || 'idle');
                setProgress(data.importProgress || 0);
                setMessage(data.importMessage || '');
                
                // If it was hidden but now it's running, show it again
                if (data.importStatus === 'running') {
                    setIsVisible(true);
                }
                
                // Auto hide after 10 minutes (600,000 ms) of completion or failure
                if (data.importStatus === 'completed' || data.importStatus === 'failed') {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    timeoutRef.current = setTimeout(() => { if (isMounted) setIsVisible(false) }, 600000);
                }
            } catch (e) {
                console.error('Failed to get import status', e);
            }
        };

        // Initial check immediately
        checkStatus();

        // Start polling based on status
        let interval: NodeJS.Timeout;
        if (status === 'running') {
            interval = setInterval(checkStatus, 1500);
        } else {
            interval = setInterval(checkStatus, 5000);
        }
        
        return () => {
             isMounted = false;
             if (interval) clearInterval(interval);
             if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [status, slug, branchId]);

    if (!isVisible || !status || status === 'idle') return null;

    const isRunning = status === 'running';
    const isSuccess = status === 'completed';
    const isFailed = status === 'failed';

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className={`w-full rounded-xl border p-4 mb-6 shadow-sm overflow-hidden relative ${
                    isRunning ? 'bg-surface-100 border-border' : 
                    isSuccess ? 'bg-green-500/10 border-green-500/30' : 
                    'bg-red-500/10 border-red-500/30'
                }`}
            >
                {/* Background Progress Bar (Subtle) */}
                {isRunning && (
                     <div 
                         className="absolute inset-0 bg-blue-500/5 transition-all duration-500 ease-out z-0 pointer-events-none"
                         style={{ width: `${progress}%` }}
                     />
                )}

                <div className="relative z-10 flex items-start gap-4">
                    <div className={`mt-0.5 flex-shrink-0 ${
                         isRunning ? 'text-blue-400' : 
                         isSuccess ? 'text-green-400' : 
                         'text-red-400'
                    }`}>
                        {isRunning && <Loader2 className="w-5 h-5 animate-spin" />}
                        {isSuccess && <CheckCircle2 className="w-5 h-5" />}
                        {isFailed && <AlertCircle className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
                                {isRunning && 'Migración de Datos en Progreso'}
                                {isSuccess && 'Migración Completada'}
                                {isFailed && 'Fallo en la Migración'}
                                
                                {isRunning && (
                                     <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20">
                                         {progress}%
                                     </span>
                                )}
                            </h3>
                        </div>
                        
                        <p className="text-sm text-text-secondary truncate">
                            {message || 'Analizando tablas extrenas...'}
                        </p>
                        
                        {isRunning && (
                            <div className="mt-3 h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ ease: "easeOut", duration: 0.5 }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Manual Close Button */}
                {(isSuccess || isFailed) && (
                    <button 
                        onClick={() => setIsVisible(false)}
                        className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${
                            isSuccess ? 'text-green-500/70 hover:text-green-400 hover:bg-green-500/20' : 
                            'text-red-500/70 hover:text-red-400 hover:bg-red-500/20'
                        }`}
                        title="Cerrar notificación"
                    >
                        <X size={16} />
                    </button>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
