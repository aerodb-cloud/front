'use client';

import React, { useState } from 'react';
import { LockOpen, X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApiClient } from '@/lib/api';

interface NeonTableBuilderProps {
  onClose?: () => void;
  projectId: string;
  branchId: string;
  dbName: string;
  onSuccess?: () => void;
}

export interface ColumnDef {
  id: string; // internal id for react map
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isIdentity: boolean;
  defaultValue: string;
}

const DATA_TYPES = [
  'integer', 'text', 'boolean', 'uuid', 'timestamp', 
  'timestamp with time zone', 'date', 'jsonb', 'real', 
  'double precision', 'serial', 'bigserial', 'numeric'
];

export function NeonTableBuilder({ onClose, projectId, branchId, dbName, onSuccess }: NeonTableBuilderProps) {
  const [isRlsEnabled, setIsRlsEnabled] = useState(false);
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);
  const [activeColTab, setActiveColTab] = useState('column name');
  
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<ColumnDef[]>([
    { id: crypto.randomUUID(), name: 'id', type: 'integer', isPrimaryKey: true, isIdentity: true, defaultValue: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddColumn = () => {
    const newCol: ColumnDef = {
      id: crypto.randomUUID(),
      name: `col_${columns.length + 1}`,
      type: 'text',
      isPrimaryKey: false,
      isIdentity: false,
      defaultValue: ''
    };
    setColumns([...columns, newCol]);
    setExpandedColumn(newCol.id);
    setActiveColTab('column name');
  };

  const handleRemoveColumn = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (columns.length === 1) {
      toast.error('A table must have at least one column');
      return;
    }
    setColumns(columns.filter(c => c.id !== id));
    if (expandedColumn === id) setExpandedColumn(null);
  };

  const updateColumn = (id: string, updates: Partial<ColumnDef>) => {
    setColumns(columns.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleSubmit = async () => {
    if (!tableName.trim()) {
      toast.error('Table name is required');
      return;
    }

    const invalidCols = columns.filter(c => !c.name.trim());
    if (invalidCols.length > 0) {
      toast.error('All columns must have a name');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        tableName: tableName.trim(),
        enableRls: isRlsEnabled,
        columns: columns.map(({ id, ...rest }) => rest)
      };

      const res = await ApiClient.post(`/projects/${projectId}/branches/${branchId}/databases/${dbName}/tables`, payload);
      
      if (res.error) {
        throw new Error(res.error || res.details || 'Failed to create table');
      }

      toast.success(`Table "${tableName}" created successfully`);
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      toast.error(err.message || 'Error creating table');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[30rem] w-full max-w-5xl mx-auto bg-[#0a0a0a] text-zinc-300 font-sans border border-zinc-800 rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
      
      {/* 1. TOP HEADER SECTION */}
      <div className="flex justify-between items-center px-8 pb-4 pt-6 border-b border-zinc-800/50 bg-[#111] shrink-0">
        <div className="flex gap-4">
          
          {/* Schema Selector */}
          <button className="flex items-center justify-between gap-2 px-3 h-10 border border-zinc-700 bg-[#0c0d0d] hover:bg-zinc-800 rounded-md text-sm min-w-[120px] transition-colors">
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Schema</span>
              <span className="text-zinc-200">public</span>
            </div>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </button>

          {/* Table Name Input (Floating Label) */}
          <div className="relative group w-64">
            <input 
              type="text" 
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="block w-full h-10 px-3 pt-4 pb-1 text-sm bg-[#0c0d0d] border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 peer placeholder-transparent"
              placeholder="Table name"
            />
            <label 
              htmlFor="tableName"
              className="absolute left-3 top-1 text-[10px] text-zinc-500 uppercase font-semibold transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-zinc-500 peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-blue-500 pointer-events-none"
            >
              Table name
            </label>
          </div>

          {/* RLS Toggle */}
          <div className="flex items-center gap-2 h-10 px-3 border border-zinc-700 bg-[#0c0d0d] rounded-md text-sm text-zinc-300">
            <LockOpen className="w-4 h-4" />
            <span>Row Level Security</span>
            <button 
              onClick={() => setIsRlsEnabled(!isRlsEnabled)}
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ml-2 ${isRlsEnabled ? 'bg-green-500' : 'bg-zinc-600'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isRlsEnabled ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
            </button>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isSubmitting} className="text-sm font-medium text-zinc-400 hover:text-white px-3 hover:underline underline-offset-4 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !tableName.trim()}
            className="flex items-center gap-2 h-8 px-4 text-sm font-medium bg-white text-black hover:bg-zinc-200 rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Review and create
          </button>
        </div>
      </div>

      {/* BODY SCROLL AREA */}
      <div className="flex-1 overflow-y-auto">
        {/* 2. COLUMNS SECTION */}
        <div className="px-8 pt-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Columns</h3>
            <button onClick={handleAddColumn} className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-all">
              Add column
            </button>
          </div>

          {/* Column Editor Wrapper */}
          <div className="flex flex-col gap-1">
            {columns.map((col) => (
              <div key={col.id} className="border border-zinc-700 rounded-md bg-[#111] overflow-hidden">
                {/* Column Summary Row */}
                <div 
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-zinc-800/50 transition-colors group"
                  onClick={() => setExpandedColumn(expandedColumn === col.id ? null : col.id)}
                >
                  <div className="flex items-center gap-2 font-mono text-sm max-w-[80%] overflow-hidden">
                    <span className="text-green-400 shrink-0">+</span>
                    <span className="text-white truncate">{col.name || 'unnamed_column'}</span>
                    <span className="text-blue-400 shrink-0">{col.type.toUpperCase()}</span>
                    {col.isPrimaryKey && <span className="text-yellow-200/80 shrink-0 text-xs">PRIMARY KEY</span>}
                    {col.isIdentity && <span className="text-purple-400 shrink-0 text-xs">IDENTITY</span>}
                    {col.defaultValue && <span className="text-zinc-500 shrink-0 truncate max-w-[100px] text-xs">DEF: {col.defaultValue}</span>}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleRemoveColumn(col.id, e)}
                      className="p-1 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white"
                      title="Remove column"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <ChevronUp className={`w-4 h-4 text-zinc-400 transition-transform ${expandedColumn === col.id ? '' : 'rotate-180'}`} />
                  </div>
                </div>

                {/* Expanded Editor Details */}
                {expandedColumn === col.id && (
                  <div className="flex min-h-[12rem] border-t border-zinc-700">
                    {/* Left Vertical Tabs */}
                    <div className="flex flex-col w-48 border-r border-zinc-700 p-2 gap-1 bg-zinc-900/30">
                      {['Column name', 'Data type', 'Constraints', 'Default', 'Generated'].map((tab) => {
                        const tabKey = tab.toLowerCase();
                        return (
                          <button 
                            key={tab}
                            onClick={() => setActiveColTab(tabKey)}
                            className={`text-sm text-left px-3 py-2 rounded-md transition-colors ${
                              activeColTab === tabKey 
                              ? 'bg-zinc-800 text-white' 
                              : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                            }`}
                          >
                            {tab}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Right Content Area */}
                    <div className="flex-1 p-6 bg-[#0a0a0a]">
                      
                      {activeColTab === 'column name' && (
                        <div className="space-y-4 max-w-sm">
                          <label className="block text-sm font-medium text-zinc-400">Column Name</label>
                          <input 
                            type="text" 
                            value={col.name}
                            onChange={(e) => updateColumn(col.id, { name: e.target.value })}
                            className="block w-full h-10 px-3 text-sm bg-[#111] border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:border-blue-500"
                            placeholder="e.g. id, created_at..."
                          />
                        </div>
                      )}

                      {activeColTab === 'data type' && (
                        <div className="space-y-4 max-w-sm">
                          <label className="block text-sm font-medium text-zinc-400">Data Type</label>
                          <select 
                            value={col.type}
                            onChange={(e) => updateColumn(col.id, { type: e.target.value })}
                            className="block w-full h-10 px-3 text-sm bg-[#111] border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:border-blue-500 appearance-none"
                          >
                            {DATA_TYPES.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {activeColTab === 'constraints' && (
                        <div className="space-y-4 max-w-sm">
                          <p className="text-sm text-zinc-400 mb-4">Table Constraints</p>
                          <label className="flex items-center gap-3 p-3 border border-zinc-800 rounded-md hover:bg-zinc-900 cursor-pointer transition-colors">
                            <input 
                              type="checkbox" 
                              checked={col.isPrimaryKey}
                              onChange={(e) => updateColumn(col.id, { isPrimaryKey: e.target.checked })}
                              className="w-4 h-4 bg-zinc-800 border-zinc-700 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-0 focus:ring-1"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-zinc-200">Primary Key</span>
                              <span className="text-xs text-zinc-500">Uniquely identifies each row in this table.</span>
                            </div>
                          </label>
                        </div>
                      )}

                      {activeColTab === 'default' && (
                        <div className="space-y-4 max-w-sm">
                          <label className="block text-sm font-medium text-zinc-400">Default Value</label>
                          <input 
                            type="text" 
                            value={col.defaultValue}
                            onChange={(e) => updateColumn(col.id, { defaultValue: e.target.value })}
                            className="block w-full h-10 px-3 text-sm bg-[#111] border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                            placeholder="e.g. now(), uuid_generate_v4(), or 'active'"
                          />
                          <p className="text-xs text-zinc-500 mt-2">
                            Functions like <code className="text-blue-400">now()</code> are evaluated. Literals are escaped automatically.
                          </p>
                        </div>
                      )}

                      {activeColTab === 'generated' && (
                        <div className="space-y-4 max-w-sm">
                          <p className="text-sm text-zinc-400 mb-4">Identity & Generation</p>
                          <label className="flex items-center gap-3 p-3 border border-zinc-800 rounded-md hover:bg-zinc-900 cursor-pointer transition-colors">
                            <input 
                              type="checkbox" 
                              checked={col.isIdentity}
                              onChange={(e) => updateColumn(col.id, { isIdentity: e.target.checked })}
                              className="w-4 h-4 bg-zinc-800 border-zinc-700 rounded text-purple-500 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-zinc-200">Is Identity</span>
                              <span className="text-xs text-zinc-500">GENERATED ALWAYS AS IDENTITY</span>
                            </div>
                          </label>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. OTHER SECTIONS (Constraints, Indexes, Policies) */}
        {['Constraints', 'Indexes', 'Policies'].map((section) => (
          <div key={section} className="px-8 mt-8 last:mb-8 opacity-50 pointer-events-none">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                {section} 
                <span className="text-[9px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">Coming soon</span>
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
