'use client';

import { use } from 'react';
import { useBranch } from '@/components/BranchContext';
import { SchemaVisualizer } from '@/components/SchemaVisualizer';
import { Database } from 'lucide-react';

export default function SchemaVisualizerPage({ params }: { params: Promise<{ slug: string, branchName: string }> }) {
    const { slug, branchName } = use(params);
    const branchId = branchName;
    const { activeBranch } = useBranch();

    if (!activeBranch) {
        return <div className="p-10 text-zinc-400">Cargando base de datos...</div>;
    }

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0A0A0A] text-zinc-100 relative">
            
            {/* Dark aesthetic header covering the full width */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-zinc-800 bg-[#0c0d0d] shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <Database size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold tracking-wide flex items-center gap-2">
                            Schema Visualizer
                            <span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
                                ERD
                            </span>
                        </h1>
                        <p className="text-[11px] text-zinc-500">Live entity-relationship diagram for {activeBranch.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                   {/* Top toolbar hooks are managed inside the Flow panel now, but we could put general branch actions here */}
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 relative w-full h-full">
                <SchemaVisualizer 
                    projectId={slug}
                    branchId={branchId}
                    dbName={activeBranch.name || 'main'}
                />
            </div>
        </div>
    );
}
