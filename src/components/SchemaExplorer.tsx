'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api';
import { Database, Table, Columns, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';
import { useBranch } from './BranchContext';

export interface TableColumn {
    name: string;
    type: string;
    isPrimaryKey?: boolean;
    foreignKey?: {
        referencedTable: string;
        referencedColumn: string;
        onUpdate: string;
        onDelete: string;
    } | null;
}

export interface TableSchema {
    name: string;
    columns: TableColumn[];
}

interface SchemaExplorerProps {
    projectId: string;
    onSelectTable?: (tableName: string, columns: TableColumn[]) => void;
    selectedTableName?: string | null;
}

export function SchemaExplorer({ projectId, onSelectTable, selectedTableName }: SchemaExplorerProps) {
    const { activeBranch } = useBranch();
    const [schema, setSchema] = useState<TableSchema[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

    const fetchSchema = async () => {
        if (!activeBranch) return;
        setLoading(true);
        setError(null);
        try {
            const data = await ApiClient.get(`/projects/${projectId}/branches/${activeBranch.id}/schema`);
            const schemaArr = Object.entries(data.schema || {}).map(([name, columns]) => ({
                name,
                columns: columns as TableColumn[]
            }));

            const initialExpanded: Record<string, boolean> = {};
            schemaArr.forEach(t => initialExpanded[t.name] = false);

            setSchema(schemaArr);
            setExpandedTables(initialExpanded);
        } catch (e: any) {
            setError(e.message || 'Failed to load schema');
            setSchema([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchema();
    }, [projectId, activeBranch]);

    const toggleTable = (tableName: string) => {
        setExpandedTables(prev => ({ ...prev, [tableName]: !prev[tableName] }));
    };

    const handleSelectTable = (table: TableSchema) => {
        if (onSelectTable) {
            onSelectTable(table.name, table.columns);
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
                <RefreshCw size={14} className="animate-spin text-zinc-600" />
                Cargando esquema...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-3 m-2 bg-red-950/30 text-red-500 text-xs rounded border border-red-900/50">
                {error}
                <button onClick={fetchSchema} className="mt-2 text-zinc-400 hover:text-white underline">Reintentar</button>
            </div>
        );
    }

    if (schema.length === 0) {
        return (
            <div className="p-4 text-center text-xs text-zinc-500">
                No hay tablas en el esquema público.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#111]">
            <div className="px-3 py-2 flex items-center justify-between border-b border-zinc-800/50 bg-[#161616]">
                <h3 className="text-xs font-semibold text-zinc-300 flex items-center gap-2 uppercase tracking-wide">
                    <Database size={12} className="text-zinc-500" /> Esquema Público
                </h3>
                <button onClick={fetchSchema} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors">
                    <RefreshCw size={12} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {schema.map((table) => {
                    const isExpanded = expandedTables[table.name];
                    const isSelected = selectedTableName === table.name;
                    return (
                        <div key={table.name} className="mb-0.5">
                            <div 
                                className={`w-full flex items-center px-1 py-1 rounded transition-colors group cursor-pointer ${
                                    isSelected ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800/50 text-zinc-300'
                                }`}
                            >
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleTable(table.name); }}
                                    className="p-1 hover:bg-zinc-700/50 rounded mr-0.5"
                                >
                                    {isExpanded ?
                                        <ChevronDown size={14} className="text-zinc-500 shrink-0" /> :
                                        <ChevronRight size={14} className="text-zinc-500 shrink-0" />
                                    }
                                </button>
                                <button
                                    onClick={() => handleSelectTable(table)}
                                    className="flex-1 flex items-center gap-1.5 text-left text-sm py-0.5 truncate"
                                >
                                    <Table size={14} className={isSelected ? "text-zinc-300" : "text-zinc-500"} />
                                    <span className="font-medium truncate text-[13px]">{table.name}</span>
                                </button>
                            </div>

                            {isExpanded && (
                                <div className="ml-5 mt-0.5 space-y-0.5 border-l border-zinc-800/60 pl-2">
                                    {table.columns.map(col => (
                                        <div key={col.name} className="flex items-center justify-between px-2 py-1 text-[12px] rounded hover:bg-zinc-800/40 group">
                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                <Columns size={12} className="text-zinc-600 shrink-0" />
                                                <span className="text-zinc-400 font-mono truncate">{col.name}</span>
                                            </div>
                                            <span className="text-[10px] text-blue-400/80 font-mono uppercase shrink-0 opacity-70 group-hover:opacity-100">{col.type}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
