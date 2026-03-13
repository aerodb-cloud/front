'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import { TableColumn } from './SchemaExplorer';
import { X, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface AddRecordModalProps {
    projectId: string;
    branchId: string;
    dbName: string;
    tableName: string;
    columns: TableColumn[];
    onClose: () => void;
    onSuccess: () => void;
}

export function AddRecordModal({ projectId, branchId, dbName, tableName, columns, onClose, onSuccess }: AddRecordModalProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [ignoredFields, setIgnoredFields] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

    const handleInputChange = (colName: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [colName]: value
        }));
    };

    const toggleIgnoreField = (colName: string) => {
        setIgnoredFields(prev => ({
            ...prev,
            [colName]: !prev[colName]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Strict Payload Cleaning
            const cleanPayload: Record<string, any> = {};
            
            for (const col of columns) {
                // Skip if user explicitly decided to let Postgres handle it (e.g. DEFAULT or SERIAL)
                if (ignoredFields[col.name]) continue;

                let val = formData[col.name];

                // If undefined or empty string, do not send it unless explicitly meant to be empty text.
                // In Postgres, sending "" to an integer or uuid column throws an error.
                if (val === undefined || val === '') {
                    // For text fields we could allow "", but generally it's better to send null or omit
                    continue; 
                }

                // Parse types explicitly if necessary
                if (col.type === 'integer' || col.type === 'bigint' || col.type === 'smallint') {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed)) {
                        cleanPayload[col.name] = parsed;
                    }
                } else if (col.type === 'boolean') {
                    cleanPayload[col.name] = val === true || val === 'true';
                } else {
                    cleanPayload[col.name] = val; // uuid, text, timestamp, etc.
                }
            }

            if (Object.keys(cleanPayload).length === 0) {
                toast.error('Gosh! No puedes enviar un registro completamente vacío.');
                setLoading(false);
                return;
            }

            await ApiClient.post(
                `/projects/${projectId}/branches/${branchId}/databases/${dbName}/tables/${tableName}/rows`,
                cleanPayload
            );
            
            toast.success('Registro insertado correctamente');
            onSuccess();
        } catch (error: any) {
            console.error('Insert error:', error);
            toast.error(error.response?.data?.error || error.message || 'Error al insertar registro');
            if (error.response?.data?.details) {
                 toast.error(error.response.data.details, { style: { fontSize: '0.75rem', color: '#a1a1aa' } });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end backdrop-blur-sm transition-opacity"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-lg h-full bg-[#0a0a0a] border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#111]">
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                            Add row to <span className="font-mono text-blue-400 bg-blue-400/10 px-1.5 rounded">{tableName}</span>
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 text-zinc-500 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body Form */}
                <form id="add-record-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {columns.map(col => {
                        const isIgnored = ignoredFields[col.name];
                        const inputId = `col-${col.name}`;
                        
                        return (
                            <div key={col.name} className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label htmlFor={inputId} className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                                        {col.name}
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase">{col.type}</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] text-zinc-500 cursor-pointer flex items-center gap-1 hover:text-zinc-300">
                                            <input 
                                                type="checkbox" 
                                                checked={!!isIgnored}
                                                onChange={() => toggleIgnoreField(col.name)}
                                                className="rounded bg-zinc-900 border-zinc-700 w-3 h-3 text-white focus:ring-zinc-600 focus:ring-offset-zinc-900 cursor-pointer"
                                            />
                                            Autocalcular (DEFAULT/NULL)
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="relative">
                                    {col.type === 'boolean' ? (
                                        <select
                                            id={inputId}
                                            disabled={isIgnored}
                                            value={formData[col.name] !== undefined ? String(formData[col.name]) : ''}
                                            onChange={(e) => handleInputChange(col.name, e.target.value === 'true')}
                                            className="w-full bg-[#111] border border-zinc-800 text-sm text-zinc-200 rounded-md px-3 py-2 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <option value="">Seleccionar booleano...</option>
                                            <option value="true">True</option>
                                            <option value="false">False</option>
                                        </select>
                                    ) : (
                                        <input
                                            id={inputId}
                                            disabled={isIgnored}
                                            type={col.type.includes('int') ? 'number' : 'text'}
                                            placeholder={isIgnored ? 'Base de datos generará este valor...' : 'NULL'}
                                            value={formData[col.name] || ''}
                                            onChange={(e) => handleInputChange(col.name, e.target.value)}
                                            className="w-full bg-[#111] border border-zinc-800 text-sm text-zinc-200 rounded-md px-3 py-2 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono"
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </form>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-800 bg-[#111] flex justify-end gap-3 shrink-0">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        form="add-record-form"
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-zinc-100 text-black hover:bg-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow"
                    >
                        {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                        Save record
                    </button>
                </div>
            </div>
        </div>
    );
}
