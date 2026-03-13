'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import Link from 'next/link';
import { useBranch } from '@/components/BranchContext';
import { SqlEditor } from '@/components/SqlEditor';
import { QueryResults } from '@/components/QueryResults';
import { SchemaExplorer } from '@/components/SchemaExplorer';

import { Copy, Check, Trash2, Database, Terminal, Link as LinkIcon, Download, UserPlus, TerminalSquare, Code, Cpu, Info, RefreshCcw, GitBranch, Clock, Activity, Settings, Workflow, Play, FileCode, Plus, Search, ChevronRight, ChevronDown, Table2, ShieldAlert, Heart, BookText, X } from 'lucide-react';

interface ProjectDetail {
    id: string;
    name: string;
    region: string;
    status: string;
    createdAt: string;
    databases: {
        id: string;
        name: string;
        pgVersion: number;
        createdAt: string;
    }[];
    branches?: {
        id: string;
        name: string;
        type: string;
        createdAt: string;
    }[];
    apiKeys?: {
        id: string;
        keyId: string;
        name: string;
    }[];
}

export default function BranchDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const branchName = params.branchName as string;
    const branchId = branchName; // Use branchName as the identifier for backend calls that now support names
    
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [connectionString, setConnectionString] = useState('');
    const [loading, setLoading] = useState(true);
    const [queryResult, setQueryResult] = useState<any>(null);
    const [queryError, setQueryError] = useState<string | null>(null);
    const [activeSqlView, setActiveSqlView] = useState<'editor' | 'templates' | 'quickstarts'>('editor');
    const [copied, setCopied] = useState(false);

    const { activeBranch, branches, setActiveBranch } = useBranch();

    useEffect(() => {
        if (branches.length > 0 && branchId) {
            const currentRouteBranch = branches.find((b: any) => b.id === branchId || b.name === branchId);
            if (currentRouteBranch && (!activeBranch || (activeBranch.id !== branchId && activeBranch.name !== branchId))) {
                setActiveBranch(currentRouteBranch);
            }
        }
    }, [branches, branchId, activeBranch, setActiveBranch]);
    const router = useRouter();

    useEffect(() => {
        async function fetchProject() {
            try {
                const data = await ApiClient.get(`/projects/${slug}`);
                setProject(data.project);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        async function fetchMetrics() {
            try {
                const data = await ApiClient.get(`/projects/${slug}/branches/${branchId}/metrics/compute`).catch(() => null);
                if (data?.metrics) {
                    // setMetrics(data.metrics); // Assuming metrics state is still needed elsewhere
                }
            } catch (e) {
                console.warn('Failed to fetch metrics:', e);
            }
        }

        fetchProject();
        fetchMetrics();

        // Poll every 5 seconds
        const interval = setInterval(fetchProject, 5000);
        return () => clearInterval(interval);
    }, [slug, branchId]);

    // Update connection string dynamically when activeBranch or project changes
    useEffect(() => {
        if (!project || !activeBranch) return;
        const host = process.env.NODE_ENV === 'production' ? 'api.aero.local' : 'localhost';
        const dbName = activeBranch.name;
        // Find specific branch key if it exists, otherwise fallback to first available
        const branchKeyName = `Branch Key: ${activeBranch.name}`;
        let apiKey = project.apiKeys?.find((key: any) => key.name === branchKeyName);
        if (!apiKey) apiKey = project.apiKeys?.[0];

        const keyId = apiKey?.keyId || 'ep-xxxx';
        setConnectionString(`postgresql://${keyId}:[YOUR_SECRET]@${host}:5432/${dbName}?sslmode=disable`);
    }, [project, activeBranch]);

    const [queryLoading, setQueryLoading] = useState(false);
    // SQL Editor state
    const [query, setQuery] = useState(`/*
In Aero, databases are stored on branches. By default, a project has one branch and one database.
You can select the branch and database to use from the drop-down menus above.

Try generating sample data and querying it by running the example statements below, or click
New Query to clear the editor.
*/
CREATE TABLE IF NOT EXISTS playing_with_aero(id SERIAL PRIMARY KEY, name TEXT NOT NULL, value REAL);
INSERT INTO playing_with_aero(name, value)
  SELECT LEFT(md5(i::TEXT), 10), random() FROM generate_series(1, 10) s(i);
SELECT * FROM playing_with_aero;`);
    const handleDelete = async () => {
        // Now handled in settings page
    };

    const runQuery = async () => {
        if (!query.trim() || !activeBranch) return;
        setQueryLoading(true);
        setQueryError('');
        setQueryResult(null);

        try {
            const data = await ApiClient.post(`/projects/${slug}/branches/${activeBranch.id}/query`, { query });
            setQueryResult(data);
        } catch (err: any) {
            setQueryError(err.message || 'Error executing query');
        } finally {
            setQueryLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-zinc-400">Cargando proyecto...</div>;
    if (!project || !activeBranch) return <div className="p-10 text-red-500">Proyecto no encontrado</div>;

    return (
            <div className="flex flex-col lg:flex-row h-full w-full bg-[#0c0d0d] overflow-hidden">
                {/* SQL Editor Left Sidebar */}
                <div className="w-full lg:w-64 border-r border-zinc-800 bg-[#161616] flex flex-col shrink-0 select-none">
                    <div className="p-4 flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">SQL Editor</h2>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                                <GitBranch size={12} className="text-zinc-500" />
                                <span className="font-medium text-zinc-300">{activeBranch?.name || 'Loading...'}</span>
                            </div>
                        </div>
                        <button className="p-1.5 text-zinc-400 hover:text-white border border-zinc-700/50 rounded bg-zinc-800/30 transition-colors">
                            <Settings size={14} />
                        </button>
                    </div>

                    <div className="px-4 py-2">
                        <div className="flex bg-[#0c0d0d] rounded border border-zinc-800/60 p-0.5">
                            <button className="flex-1 text-center py-1 text-[11px] font-semibold rounded text-zinc-400 hover:text-white transition-colors">
                                Saved
                            </button>
                            <button className="flex-1 text-center py-1 text-[11px] font-semibold rounded bg-zinc-800 text-zinc-200 shadow-sm transition-colors">
                                History
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center mt-10">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-600 mb-3">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 18V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 12L14.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 12L9.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p className="text-[12px] text-zinc-400">Your history is empty</p>
                    </div>
                </div>

                {/* SQL Editor Main Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#161616]">
                    {activeSqlView === 'editor' && (
                        <div className="flex flex-col h-full overflow-hidden">
                            {/* Editor Top Half */}
                            <div className="flex-[3] min-h-[300px]">
                                <SqlEditor
                                    query={query}
                                    setQuery={setQuery}
                                    onRunQuery={runQuery}
                                    loading={queryLoading}
                                />
                            </div>

                            {/* Resizer */}
                            <div className="h-2 cursor-row-resize bg-[#111] hover:bg-blue-500/20 border-y border-zinc-800 shrink-0"></div>

                            {/* Results Bottom Half */}
                            <div className="flex-[2] flex flex-col min-h-[200px] overflow-hidden">
                                <QueryResults
                                    result={queryResult}
                                    error={queryError}
                                    loading={queryLoading}
                                />
                            </div>
                        </div>
                    )}

                    {/* Scripts/Templates Area */}
                    {(activeSqlView === 'templates' || activeSqlView === 'quickstarts') && (
                        <div className="flex-1 flex flex-col overflow-hidden bg-[#161616]">
                            <div className="flex items-center px-4 border-b border-zinc-800/50 pt-2 gap-1 shrink-0">
                                <button className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-zinc-800/20 border border-b-0 border-zinc-800/50 rounded-t-md">
                                    <Code size={14} className="text-zinc-400" />
                                    {activeSqlView === 'templates' ? 'Plantillas' : 'Inicios Rápidos'}
                                </button>
                                <button className="px-3 py-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                                    <Plus size={16} />
                                </button>
                                <div className="flex-1" />
                                <button className="px-3 py-1.5 mb-1 text-xs font-semibold bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                                    Ayuda
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto p-8">
                                <h2 className="text-xl font-bold text-white mb-2">
                                    {activeSqlView === 'templates' ? 'Scripts' : 'Inicios Rápidos'}
                                </h2>
                                <p className="text-[14px] text-zinc-400 mb-8 max-w-2xl leading-relaxed">
                                    {activeSqlView === 'templates'
                                        ? "Scripts rápidos para ejecutar en su base de datos. Haga clic en cualquier script para enviar la consulta, modifíquela y luego haga clic en Ejecutar."
                                        : "Haga clic en cualquier script para llenar el cuadro de consulta, modifique el script y luego haga clic en Ejecutar."}
                                </p>

                                {activeSqlView === 'templates' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            { title: "Create table", description: "Basic table template. Change 'table_name' to the name you prefer." },
                                            { title: "Add view", description: "Template to add a view. Make sure to change the table and column names to ones that already exist." },
                                            { title: "Add column", description: "Template to add a column. Make sure to change the name and type." },
                                            { title: "Add comments", description: "Templates to add a comment to either a table or a column." },
                                            { title: "Show extensions", description: "Get a list of extensions in your database and status." },
                                            { title: "Show version", description: "Get your Postgres version." },
                                            { title: "Show active connections", description: "Get the number of active and max connections." },
                                            { title: "Automatically update timestamps", description: "Update a column timestamp on every update." },
                                            { title: "Increment field value", description: "Update a field with incrementing value using stored procedure." },
                                            { title: "pg_stat_statements report", description: "Select from pg_stat_statements and view recent queries" },
                                            { title: "Most frequently invoked", description: "Most frequently called queries in your database." },
                                            { title: "Most time consuming", description: "Aggregate time spent on a query type." },
                                        ].map((card, idx) => (
                                            <button key={idx} className="flex flex-col text-left p-4 border border-zinc-800 rounded-xl bg-[#1a1a1a] hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileCode size={14} className="text-zinc-500 group-hover:text-zinc-300" />
                                                    <span className="text-[14px] font-semibold text-zinc-200">{card.title}</span>
                                                </div>
                                                <p className="text-[12px] text-zinc-500 leading-relaxed">{card.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {activeSqlView === 'quickstarts' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            { title: "Colors", description: "Create a table with a list of colors and their hex values." },
                                            { title: "Slack Clone", description: "Build a basic slack clone with Row Level Security." },
                                            { title: "Todo List", description: "Build a basic todo list with Row Level Security." },
                                            { title: "Stripe Subscriptions", description: "Starter template for the Next.js Stripe Subscriptions Starter." },
                                            { title: "User Management Starter", description: "Sets up a public Profiles table which you can access with your API." },
                                            { title: "NextAuth Schema Setup", description: "Sets up the Schema and Tables for the NextAuth Supabase Adapter." },
                                            { title: "OpenAI Vector Search", description: "Template for the Next.js OpenAI Doc Search Starter." },
                                            { title: "LangChain", description: "LangChain is a popular framework for working with AI, Vectors, and embeddings." },
                                        ].map((card, idx) => (
                                            <button key={idx} className="flex flex-col text-left p-4 border border-zinc-800 rounded-xl bg-[#1a1a1a] hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileCode size={14} className="text-zinc-500 group-hover:text-zinc-300" />
                                                    <span className="text-[14px] font-semibold text-zinc-200">{card.title}</span>
                                                </div>
                                                <p className="text-[12px] text-zinc-500 leading-relaxed">{card.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
            </div>
            </div>
        );
}
