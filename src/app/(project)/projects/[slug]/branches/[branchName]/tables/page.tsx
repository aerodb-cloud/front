'use client';

import { use, useState } from 'react';
import { useBranch } from '@/components/BranchContext';
import { SchemaExplorer, TableColumn } from '@/components/SchemaExplorer';
import { NeonTableBuilder } from '@/components/NeonTableBuilder';
import { TableDataGrid } from '@/components/TableDataGrid';
import { Database } from 'lucide-react';

export default function TablesPage({ params }: { params: Promise<{ slug: string, branchName: string }> }) {
    const { slug, branchName } = use(params);
    const branchId = branchName;
    const { activeBranch } = useBranch();
    const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<{ name: string, columns: TableColumn[] } | null>(null);

    if (!activeBranch) {
        return <div className="p-10 text-zinc-400">Cargando base de datos...</div>;
    }

    return (
        <div className="w-full h-full overflow-hidden flex flex-col bg-[#0c0d0d]">
            {/* Header section inspired by Drizzle Studio layout */}
            <div className="flex-none px-6 pt-6 pb-4 border-b border-zinc-800/60 shadow-sm z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-[20px] font-semibold text-zinc-100 tracking-tight leading-none">Tables</h1>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/40 border border-zinc-700/50 rounded-md">
                            <span className="text-zinc-400 flex items-center justify-center p-0.5">
                                {activeBranch.type === 'production' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 17 17" role="img" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M4.67 3.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-3 1.5a3 3 0 1 1 5.18 2.06c.5.62 1.21 1.03 2 1.16a3 3 0 1 1-.15 1.5 4.7 4.7 0 0 1-3.12-1.85l-.16.04v2.2a3 3 0 1 1-1.5 0V7.6a3 3 0 0 1-2.25-2.9m1.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m7-3.74a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0" clipRule="evenodd"></path></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 17 16" fill="none" role="img" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M3.96875 6.4375C3.96875 7.11896 4.06412 7.73079 4.375 8.16504C4.64917 8.54792 5.19934 8.93749 6.46875 8.9375H8.61328C8.92431 7.61231 10.1112 6.625 11.5312 6.625C13.1881 6.625 14.5312 7.96815 14.5312 9.625C14.5312 11.2819 13.1881 12.625 11.5312 12.625C10.1563 12.625 9.00002 11.6992 8.64551 10.4375H6.46875C4.86341 10.4375 3.78835 9.92076 3.15625 9.03809C2.56096 8.20674 2.46875 7.19344 2.46875 6.4375V3.375H3.96875V6.4375ZM11.5312 8.125C10.7028 8.125 10.0312 8.79657 10.0312 9.625C10.0312 10.4534 10.7028 11.125 11.5312 11.125C12.3597 11.125 13.0312 10.4534 13.0312 9.625C13.0312 8.79657 12.3597 8.125 11.5312 8.125Z" fill="currentColor"></path></svg>
                                )}
                            </span>
                            <a href={`/projects/${slug}/branches/${branchId}`} className="text-[13px] font-semibold text-zinc-300 hover:text-white transition-colors leading-none tracking-wide">
                                {activeBranch.name}
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar (Tables List) */}
                <div className="w-64 md:w-72 border-r border-zinc-800/60 bg-[#161616] flex flex-col shrink-0 pt-5 gap-5 z-0">
                    {/* New table button */}
                    <div className="flex flex-col gap-y-1.5 px-4">
                        <div className="grid gap-3">
                            <button 
                                onClick={() => setIsCreatePanelOpen(true)}
                                className="relative cursor-pointer space-x-2 text-center font-regular ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border text-white bg-zinc-800 hover:bg-zinc-700 border-zinc-700 hover:border-zinc-500 w-full flex items-center text-xs px-2.5 py-1 flex-row h-[28px] justify-start shadow-sm"
                            >
                                <div className="text-zinc-400 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                                </div>
                                <span className="truncate font-medium">New table</span>
                            </button>
                        </div>
                    </div>

                    {/* Search and List */}
                    <div className="grow min-h-0 flex flex-col gap-2 pb-0">
                        <div className="flex px-4 gap-2 items-center mb-2">
                            <div className="relative w-full">
                                <input 
                                    type="text" 
                                    placeholder="Search tables..." 
                                    className="flex border border-zinc-800 bg-[#0c0d0d] text-zinc-300 placeholder:text-zinc-600 focus-visible:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 px-3 py-1.5 h-[28px] text-xs pl-7 pr-7 w-full rounded transition-colors"
                                />
                                <button className="absolute right-1 top-[.3rem] text-zinc-500 hover:text-zinc-300 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 6 5 5 5-5"></path><path d="m7 13 5 5 5-5"></path></svg>
                                </button>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-0 bottom-0 my-auto text-zinc-500"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                            </div>
                            <button className="relative justify-center cursor-pointer inline-flex items-center text-center ease-out duration-200 rounded-md outline-none transition-all text-zinc-400 border border-dashed border-zinc-700 hover:border-zinc-500 bg-transparent hover:text-zinc-300 h-[28px] px-1.5 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                            <SchemaExplorer 
                                projectId={slug} 
                                onSelectTable={(name, columns) => setSelectedTable({ name, columns })}
                                selectedTableName={selectedTable?.name}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 overflow-hidden bg-[#0a0a0a] flex flex-col">
                    {selectedTable ? (
                        <TableDataGrid 
                            projectId={slug}
                            branchId={branchId}
                            dbName={activeBranch.name || 'main'}
                            tableName={selectedTable.name}
                            columns={selectedTable.columns}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-zinc-500 bg-[#0c0d0d] border-l border-zinc-800">
                            <Database size={32} className="mb-4 text-zinc-700 opacity-50" />
                            <h3 className="text-zinc-400 font-medium mb-1">No table selected</h3>
                            <p className="text-sm">Select a table from the sidebar to view its structure and data.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay for Centered Modal */}
            {isCreatePanelOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-50 transition-opacity flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setIsCreatePanelOpen(false)}
                    aria-hidden="true"
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-5xl">
                        <NeonTableBuilder 
                            onClose={() => setIsCreatePanelOpen(false)} 
                            projectId={slug}
                            branchId={branchId}
                            dbName={activeBranch.name || 'main'}
                            onSuccess={() => window.location.reload()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
