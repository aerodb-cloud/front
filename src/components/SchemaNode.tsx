'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Key, Link } from 'lucide-react';

export interface ColumnData {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

export interface SchemaNodeData {
  label: string;
  columns: ColumnData[];
}

export function SchemaNode({ data }: { data: SchemaNodeData }) {
  return (
    <div className="bg-[#0a0a0a] border border-zinc-800 rounded-lg shadow-xl min-w-[240px] font-sans overflow-hidden">
      
      {/* Table Header */}
      <div className="bg-[#111] px-4 py-3 flex items-center gap-2 border-b border-zinc-800">
        <Database size={16} className="text-blue-400" />
        <span className="font-semibold text-zinc-100 text-sm tracking-wide">{data.label}</span>
      </div>

      {/* Columns List */}
      <div className="flex flex-col py-1">
        {data.columns.map((col, index) => {
            const isPK = col.isPrimaryKey;
            const isFK = col.isForeignKey;
            
            return (
                <div 
                    key={col.name} 
                    className="relative flex items-center justify-between px-4 py-2 hover:bg-zinc-900/50 transition-colors group"
                >
                    {/* Source Handle (Left) - for incoming relations if we ever need but typically target is left, source is right */}
                    <Handle 
                        type="target" 
                        position={Position.Left} 
                        id={`${col.name}-target`} 
                        className="!w-2 !h-2 !bg-zinc-600 !border-zinc-800 !-left-[5px] group-hover:!bg-blue-500 transition-colors"
                    />

                    {/* Column Info */}
                    <div className="flex items-center gap-2">
                        {isPK && <Key size={12} className="text-yellow-500 shrink-0" />}
                        {isFK && <Link size={12} className="text-blue-400 shrink-0" />}
                        {!isPK && !isFK && <div className="w-3 shrink-0"></div>}
                        
                        <span className={`text-xs ${isPK ? 'text-zinc-200 font-medium' : 'text-zinc-400'}`}>
                            {col.name}
                        </span>
                    </div>
                    
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
                        {col.type}
                    </span>

                    {/* Target Handle (Right) - explicitly assigning the column name as the ID so edges snap exactly here */}
                    <Handle 
                        type="source" 
                        position={Position.Right} 
                        id={`${col.name}-source`} 
                        className="!w-2 !h-2 !bg-zinc-600 !border-zinc-800 !-right-[5px] group-hover:!bg-blue-500 transition-colors"
                    />
                </div>
            );
        })}
      </div>
      
    </div>
  );
}
