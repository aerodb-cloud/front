'use client';

import React, { useState } from 'react';
import { Plus, Minus, AlertTriangle, Key, ArrowRight, Loader2, GitMerge } from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface DiffMeta {
    type: string;
    nullable: boolean;
    default: string | null;
}

export interface DiffItem {
    type: 'create_table' | 'drop_table' | 'add_column' | 'drop_column' | 'alter_column' | 'add_constraint' | 'drop_constraint';
    table: string;
    column?: string;
    constraint?: string;
    schema?: any; // For full table schema
    meta?: DiffMeta; // For new columns
    oldMeta?: DiffMeta; // For alter
    newMeta?: DiffMeta; // For alter
    definition?: string; // For constraints
    isDestructive: boolean;
}

interface SchemaDiffViewerProps {
    differences: DiffItem[];
    isMergeable: boolean;
    baseBranchId: string;
    compareBranchId: string;
    projectSlug: string;
    onMergeSuccess?: () => void;
}

export default function SchemaDiffViewer({ differences, isMergeable, baseBranchId, compareBranchId, projectSlug, onMergeSuccess }: SchemaDiffViewerProps) {
    const router = useRouter();
    const [isMerging, setIsMerging] = useState(false);

    if (!differences || differences.length === 0) {
        return (
            <div className="flex flex-col flex-1 min-h-[400px] items-center justify-center p-12 text-center bg-[#0a0a0a] border border-zinc-800 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                    <GitMerge className="text-zinc-500 w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Sin diferencias</h3>
                <p className="text-sm text-zinc-400 max-w-sm">
                    Ambas ramas tienen exactamente la misma estructura de esquema. No hay cambios estructurales pendientes para fusionar.
                </p>
            </div>
        );
    }

    // Group differences by table
    const groupedDiffs = differences.reduce((acc, diff) => {
        if (!acc[diff.table]) acc[diff.table] = [];
        acc[diff.table].push(diff);
        return acc;
    }, {} as Record<string, DiffItem[]>);

    const handleMerge = async () => {
        setIsMerging(true);
        try {
            await ApiClient.post(`/projects/${projectSlug}/merge`, {
                base: baseBranchId,
                compare: compareBranchId
            });
            toast.success("Esquema fusionado con éxito", {
                description: "Los cambios estructurales se aplicaron de forma segura en la rama base."
            });
            if (onMergeSuccess) {
                onMergeSuccess();
            } else {
                router.push(`/projects/${projectSlug}/branches/${baseBranchId}`);
            }
        } catch (error: any) {
            toast.error("Error al fusionar ramas", {
                description: error.message || "Se abortó la transacción para evitar corrupción del esquema."
            });
        } finally {
            setIsMerging(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Diferencias de Esquema</h3>
                    <p className="text-sm text-zinc-400">{differences.length} cambios detectados</p>
                </div>
                {isMergeable && (
                    <button
                        onClick={handleMerge}
                        disabled={isMerging}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-black bg-[#00e599] rounded-md hover:bg-[#00c58e] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isMerging ? <Loader2 size={16} className="animate-spin" /> : <GitMerge size={16} />}
                        Merge into Base
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-4">
                {Object.entries(groupedDiffs).map(([tableName, diffs]) => {
                    const isNewTable = diffs.some(d => d.type === 'create_table');
                    const isDroppedTable = diffs.some(d => d.type === 'drop_table');

                    return (
                        <div key={tableName} className="border border-zinc-800 rounded-xl bg-zinc-900/50 overflow-hidden text-sm">
                            <div className="flex items-center p-4 border-b border-zinc-800 bg-[#0a0a0a]">
                                <h4 className="font-mono font-medium text-white text-[15px]">{tableName}</h4>
                                {isNewTable && <span className="ml-3 px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 uppercase">Tabla Nueva</span>}
                                {isDroppedTable && <span className="ml-3 px-2 py-0.5 text-[10px] font-medium bg-red-500/10 text-red-400 rounded border border-red-500/20 uppercase">Eliminada</span>}
                            </div>

                            <div className="divide-y divide-zinc-800/60 p-1">
                                {!isDroppedTable && !isNewTable && diffs.map((diff, i) => (
                                    <DiffRow key={i} diff={diff} />
                                ))}

                                {isNewTable && (
                                    <div className="p-3 pl-4 flex items-start gap-3">
                                        <Plus className="w-4 h-4 text-emerald-500 mt-0.5" />
                                        <div className="flex flex-col gap-1">
                                            <span className="text-zinc-300">Se crearán las columnas y llaves primarias de la nueva tabla.</span>
                                            {diffs.filter(d => d.type === 'add_constraint').map((c, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5 text-xs text-emerald-500/80 font-mono">
                                                    <Key className="w-3 h-3" /> {c.definition}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {isDroppedTable && (
                                    <div className="p-3 pl-4 flex items-start gap-3 opacity-60">
                                        <Minus className="w-4 h-4 text-red-500 mt-0.5" />
                                        <span className="text-zinc-400 line-through">Tabla removida en la rama hija</span>
                                        <span className="text-xs text-red-400 border border-red-500/20 bg-red-500/10 px-1.5 rounded">(Ignorado por seguridad)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function DiffRow({ diff }: { diff: DiffItem }) {
    if (diff.type === 'add_column') {
        return (
            <div className="p-3 pl-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3">
                    <Plus className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-mono text-zinc-200">{diff.column}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs text-zinc-500">
                    <span className="text-emerald-400/80">{diff.meta?.type}</span>
                    {diff.meta?.nullable ? <span className="text-zinc-600">NULL</span> : <span className="text-zinc-400">NOT NULL</span>}
                    {diff.meta?.default && <span className="text-zinc-400">DEF: {diff.meta.default}</span>}
                </div>
            </div>
        );
    }

    if (diff.type === 'alter_column') {
        return (
            <div className="p-3 pl-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3 w-1/3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-mono text-zinc-200">{diff.column}</span>
                </div>
                
                <div className="flex items-center justify-end gap-3 flex-1 font-mono text-xs text-zinc-500 whitespace-nowrap">
                    {/* OLD */}
                    <div className="flex items-center gap-2 opacity-50 line-through">
                        <span>{diff.oldMeta?.type}</span>
                        {diff.oldMeta?.nullable ? <span>NULL</span> : <span>NOT NULL</span>}
                    </div>
                    
                    <ArrowRight className="w-3 h-3 text-zinc-600" />
                    
                    {/* NEW */}
                    <div className="flex items-center gap-2 text-amber-400/80">
                        <span>{diff.newMeta?.type}</span>
                        {diff.newMeta?.nullable ? <span>NULL</span> : <span className="text-amber-200">NOT NULL</span>}
                        {diff.newMeta?.default && <span>DEF: {diff.newMeta.default}</span>}
                    </div>
                </div>
            </div>
        );
    }

    if (diff.type === 'add_constraint') {
        return (
            <div className="p-3 pl-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-mono text-zinc-200">{diff.constraint}</span>
                </div>
                <div className="font-mono text-xs text-emerald-400/80 truncate max-w-sm" title={diff.definition}>
                    {diff.definition}
                </div>
            </div>
        );
    }

    if (diff.isDestructive) {
        return (
            <div className="p-3 pl-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors opacity-60">
                <div className="flex items-center gap-3">
                    <Minus className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="font-mono text-zinc-400 line-through">{diff.column || diff.constraint}</span>
                </div>
                <div className="text-xs text-red-400 border border-red-500/20 bg-red-500/10 px-1.5 rounded">
                    (Ignorado por seguridad)
                </div>
            </div>
        );
    }

    return null;
}
