'use client';

import React, { useState, useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useBranch } from './BranchContext';
import { Play, Sparkles, Terminal } from 'lucide-react';

interface SqlEditorProps {
    query: string;
    setQuery: (val: string) => void;
    onRunQuery: () => void;
    loading: boolean;
}

export function SqlEditor({ query, setQuery, onRunQuery, loading }: SqlEditorProps) {
    const { activeBranch } = useBranch();
    const monaco = useMonaco();
    const editorRef = useRef<any>(null);

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
        editor.focus();

        // Add Cmd+Enter to run query
        if (monaco) {
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                onRunQuery();
            });
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] relative">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-zinc-800 bg-[#161616]">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onRunQuery}
                        disabled={loading || !query.trim()}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-semibold transition-all ${loading || !query.trim()
                            ? 'bg-[#00e599]/30 text-[#00e599]/50 cursor-not-allowed'
                            : 'bg-[#00e599] text-black hover:bg-[#00e599]/90 shadow-[0_0_10px_rgba(0,229,153,0.3)]'
                            }`}
                        title="Ejecutar Consulta (Cmd+Enter)"
                    >
                        <Play size={14} fill="currentColor" /> {loading ? 'Ejecutando...' : 'Ejecutar'}
                    </button>

                    <button className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                        <Sparkles size={14} className="text-blue-400" /> Explicar
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                        <Terminal size={14} /> Formatear
                    </button>
                </div>

                {/* Branch Awareness Badge */}
                {activeBranch && (
                    <div className="flex items-center gap-2">
                        {activeBranch.type === 'production' ? (
                            <div className="px-2.5 py-1 text-[11px] font-bold tracking-wider rounded border bg-red-500/10 text-red-500 border-red-500/20 flex items-center gap-1.5 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> ADVERTENCIA: EJECUTANDO EN PRODUCCIÓN
                            </div>
                        ) : (
                            <div className="px-2.5 py-1 text-[11px] font-medium tracking-wide rounded border bg-blue-500/10 text-blue-400 border-blue-500/20 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Ejecutando en: {activeBranch.name}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Monaco Editor Canvas */}
            <div className="flex-1 overflow-hidden relative">
                <Editor
                    height="100%"
                    language="pgsql"
                    theme="vs-dark"
                    value={query}
                    onChange={(val) => setQuery(val || '')}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
                        fontLigatures: true,
                        wordWrap: 'on',
                        padding: { top: 16, bottom: 16 },
                        lineNumbers: 'on',
                        renderLineHighlight: 'all',
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        formatOnType: true,
                        suggestOnTriggerCharacters: true,
                    }}
                />
            </div>

            {/* Context overlay hints */}
            <div className="absolute bottom-4 right-6 text-zinc-500 text-[10px] pointer-events-none drop-shadow-md bg-black/50 px-2 py-1 rounded">
                ⌘+Enter to Run
            </div>
        </div>
    );
}
