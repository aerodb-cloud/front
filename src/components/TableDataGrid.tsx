'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api';
import { TableColumn } from './SchemaExplorer';
import { RefreshCw, Filter, Columns, Plus, ChevronLeft, ChevronRight, Key, Link, Trash } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AddRecordModal } from './AddRecordModal';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TableDataGridProps {
    projectId: string;
    branchId: string;
    dbName: string;
    tableName: string;
    columns: TableColumn[];
}

export function TableDataGrid({ projectId, branchId, dbName, tableName, columns }: TableDataGridProps) {
    const [rows, setRows] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState<number>(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const limit = 50;

    const fetchRows = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ApiClient.get(`/projects/${projectId}/branches/${branchId}/databases/${dbName}/tables/${tableName}/rows?limit=${limit}&offset=${offset}`);
            setRows(data.data || []);
            setTotalCount(data.count || 0);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch rows');
            setRows([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Reset pagination when table changes
        setOffset(0);
    }, [tableName]);

    useEffect(() => {
        fetchRows();
    }, [projectId, branchId, dbName, tableName, offset]);

    const handleNext = () => {
        if (offset + limit < totalCount) setOffset(offset + limit);
    };

    const handlePrev = () => {
        if (offset - limit >= 0) setOffset(offset - limit);
    };

    const handleAddRecordSuccess = () => {
        setIsAddModalOpen(false);
        setOffset(0); // Go back to page 1 to see the new record (usually inserts at top or bottom depending on sort, but safe to reset)
        fetchRows();
    };

    // Bulk Delete State & Handlers
    const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const selectedKeys = Object.keys(rowSelection);
    const isAllSelected = rows.length > 0 && selectedKeys.length === rows.length;
    const isSomeSelected = selectedKeys.length > 0 && !isAllSelected;

    const toggleAllRows = () => {
        if (isAllSelected) {
            setRowSelection({});
        } else {
            const newSelection: Record<number, boolean> = {};
            rows.forEach((_, i) => newSelection[i] = true);
            setRowSelection(newSelection);
        }
    };

    const toggleRow = (index: number) => {
        setRowSelection(prev => {
            const next = { ...prev };
            if (next[index]) delete next[index];
            else next[index] = true;
            return next;
        });
    };

    const handleDeleteSelected = async () => {
        if (selectedKeys.length === 0) return;
        setIsDeleting(true);
        try {
            const pkCol = columns.find(c => c.isPrimaryKey);
            if (!pkCol) {
                toast.error("Para eliminar múltiple filas la tabla debe tener una Llave Primaria definida.");
                setIsDeleting(false);
                setIsDeleteDialogOpen(false);
                return;
            }

            const pkValues = selectedKeys.map(keyIndex => rows[Number(keyIndex)][pkCol.name]);
            
            await ApiClient.delete(`/projects/${projectId}/branches/${branchId}/databases/${dbName}/tables/${tableName}/rows`, {
                pkColumn: pkCol.name,
                pkValues
            });
            
            toast.success(`${pkValues.length} registro(s) eliminado(s) exitosamente.`);
            setRowSelection({});
            setIsDeleteDialogOpen(false);
            fetchRows(); // Refresh
        } catch (err: any) {
            toast.error(err.message || 'Error borrando registros');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] text-zinc-200">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#111] border-b border-zinc-800 shrink-0 h-14">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-zinc-100 flex items-center gap-2">
                        {tableName}
                    </span>
                    <div className="h-4 w-[1px] bg-zinc-700"></div>
                    <span className="text-xs font-mono text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded">
                        {loading ? '...' : totalCount} rows
                    </span>
                    
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors ml-2">
                        <Filter size={14} /> Filter
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors">
                        <Columns size={14} /> Columns
                    </button>
                    <button onClick={fetchRows} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
                
                <div className="flex items-center gap-4">
                    {selectedKeys.length > 0 && (
                        <button 
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded transition-colors shadow-sm"
                        >
                            <Trash size={14} /> Delete {selectedKeys.length} record(s)
                        </button>
                    )}
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={handlePrev} 
                            disabled={offset === 0}
                            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 hover:bg-zinc-800 rounded transition"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs font-mono text-zinc-500 w-24 text-center">
                            {totalCount === 0 ? '0 - 0' : `${offset + 1} - ${Math.min(offset + limit, totalCount)}`} of {totalCount}
                        </span>
                        <button 
                            onClick={handleNext} 
                            disabled={offset + limit >= totalCount}
                            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 hover:bg-zinc-800 rounded transition"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-100 text-black hover:bg-white rounded transition-colors shadow-sm"
                    >
                        <Plus size={14} /> Add record
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-auto bg-[#0a0a0a]">
                {error ? (
                    <div className="p-6">
                        <div className="bg-red-950/30 text-red-500 text-sm p-4 rounded border border-red-900/50 inline-block">
                            {error}
                            <div className="mt-2">
                                <button onClick={fetchRows} className="text-zinc-400 hover:text-white underline">Reintentar</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="sticky top-0 z-10 bg-[#111] shadow-sm">
                            <tr>
                                <th className="border-b border-zinc-800 px-4 py-2 bg-[#111] w-12 text-center">
                                    <input 
                                        type="checkbox" 
                                        checked={isAllSelected && rows.length > 0}
                                        ref={input => { if (input) input.indeterminate = isSomeSelected; }}
                                        onChange={toggleAllRows}
                                        className="rounded bg-zinc-900 border-zinc-700 text-white focus:ring-zinc-600 focus:ring-offset-zinc-900 cursor-pointer"
                                    />
                                </th>
                                <th className="border-b border-zinc-800 px-4 py-2 bg-[#111] w-12 text-center text-zinc-500">#</th>
                                {columns.map(col => (
                                    <th key={col.name} className="border-b border-r border-zinc-800 px-4 py-2 bg-[#111] font-medium text-zinc-300 min-w-[150px] max-w-[300px] whitespace-nowrap overflow-hidden text-ellipsis">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <TooltipProvider delayDuration={200}>
                                                    {col.isPrimaryKey && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="cursor-help flex items-center justify-center shrink-0">
                                                                    <Key size={13} className="text-amber-500" />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="bg-zinc-800 border-zinc-700 text-xs px-2 py-1 shadow-lg">
                                                                <p>Primary key</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    {col.foreignKey && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="cursor-help flex items-center justify-center shrink-0">
                                                                    <Link size={13} className="text-zinc-400" />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="bg-zinc-800 border-zinc-700 text-xs px-2.5 py-1.5 shadow-lg max-w-[250px] font-mono text-left">
                                                                <p className="font-sans font-medium text-zinc-200 mb-1">Foreign key relation:</p>
                                                                <p className="text-zinc-300">{col.name} → {col.foreignKey.referencedTable}.{col.foreignKey.referencedColumn}</p>
                                                                <p className="text-zinc-400 mt-1">On update: <span className="text-zinc-300">{col.foreignKey.onUpdate}</span></p>
                                                                <p className="text-zinc-400">On delete: <span className="text-zinc-300">{col.foreignKey.onDelete}</span></p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </TooltipProvider>
                                                <span className="leading-none pt-0.5">{col.name}</span>
                                            </div>
                                            <span className="text-[10px] font-mono text-zinc-500 uppercase leading-none pt-0.5">{col.type}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-[#0a0a0a]">
                            {totalCount === 0 && !loading ? (
                                <tr>
                                    <td colSpan={columns.length + 2} className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center font-mono tracking-tight text-muted-foreground text-zinc-500">
                                            <div>No rows</div>
                                            <div className="text-xs mt-1">limit {limit} offset {offset}</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {rows.map((row, i) => (
                                        <tr key={i} className={`border-b border-zinc-800/60 transition-colors group ${rowSelection[i] ? 'bg-zinc-800/30' : 'hover:bg-zinc-900/50'}`}>
                                            <td className="px-4 py-2 text-center border-r border-zinc-900/50">
                                                <input 
                                                    type="checkbox" 
                                                    checked={!!rowSelection[i]}
                                                    onChange={() => toggleRow(i)}
                                                    className="rounded bg-zinc-900 border-zinc-700 text-white focus:ring-zinc-600 focus:ring-offset-zinc-900 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-zinc-600 font-mono text-xs text-center border-r border-zinc-900/50">
                                                {offset + i + 1}
                                            </td>
                                            {columns.map(col => (
                                                <td key={col.name} className="px-4 py-2 text-zinc-400 font-mono text-[13px] border-r border-zinc-900/50 max-w-[300px] truncate">
                                                    {row[col.name] === null ? (
                                                        <span className="text-zinc-600 italic">null</span>
                                                    ) : typeof row[col.name] === 'object' ? (
                                                        JSON.stringify(row[col.name])
                                                    ) : typeof row[col.name] === 'boolean' ? (
                                                        row[col.name] ? 'true' : 'false'
                                                    ) : (
                                                        String(row[col.name])
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {/* Fill empty rows if we have less than limit to maintain grid look */}
                                    {rows.length > 0 && Array.from({ length: Math.max(0, 15 - rows.length) }).map((_, i) => (
                                        <tr key={`empty-${i}`} className="border-b border-zinc-800/30">
                                            <td className="px-4 py-3 border-r border-zinc-900/50"></td>
                                            <td className="px-4 py-3 border-r border-zinc-900/50"></td>
                                            {columns.map(col => (
                                                <td key={`empty-${i}-${col.name}`} className="px-4 py-3 border-r border-zinc-900/50"></td>
                                            ))}
                                        </tr>
                                    ))}
                                </>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            
            {/* Loading Overlay */}
            {loading && rows.length > 0 && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0a0a] to-transparent h-20 pointer-events-none flex items-end justify-center pb-4">
                    <RefreshCw size={14} className="animate-spin text-zinc-500" />
                </div>
            )}

            {/* Add Record Modal */}
            {isAddModalOpen && (
                <AddRecordModal
                    projectId={projectId}
                    branchId={branchId}
                    dbName={dbName}
                    tableName={tableName}
                    columns={columns}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={handleAddRecordSuccess}
                />
            )}

            {/* Bulk Delete Confirm Modal */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-zinc-950 border-zinc-900 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-zinc-100 flex items-center gap-2">
                            <Trash size={18} className="text-red-500" /> Confirmar Eliminación
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            ¿Estás seguro de que deseas eliminar permanentemente <b>{selectedKeys.length}</b> registro(s) de la tabla <b>{tableName}</b>?<br/>Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); handleDeleteSelected(); }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white border-transparent flex items-center gap-2"
                        >
                            {isDeleting ? <RefreshCw className="animate-spin" size={14} /> : null}
                            Sí, eliminar {selectedKeys.length}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
