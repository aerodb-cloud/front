'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import { Loader2, GitMerge, RefreshCw, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import SchemaDiffViewer, { DiffItem } from '@/components/SchemaDiffViewer';
import { toast } from 'sonner';

interface Branch {
    id: string;
    name: string;
    type: string;
    isDefault: boolean;
}

export default function CompareBranchesPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [fetchingDiff, setFetchingDiff] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);
    
    const [baseBranchId, setBaseBranchId] = useState<string>('');
    const [compareBranchId, setCompareBranchId] = useState<string>('');
    
    const [diffResult, setDiffResult] = useState<{ differences: DiffItem[], isMergeable: boolean } | null>(null);

    // Initial load: Fetch branches
    useEffect(() => {
        const loadBranches = async () => {
            try {
                const data = await ApiClient.get(`/projects/${slug}`);
                if (data.project?.branches) {
                    const sorted = [...data.project.branches].sort((a, b) => {
                        if (a.isDefault) return -1;
                        if (b.isDefault) return 1;
                        return 0;
                    });
                    setBranches(sorted);
                    
                    if (sorted.length > 0) {
                        setBaseBranchId(sorted[0].id); // usually default/production
                    }
                    if (sorted.length > 1) {
                        setCompareBranchId(sorted[1].id); // first secondary branch
                    } else if (sorted.length === 1) {
                        setCompareBranchId(sorted[0].id);
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error("Error cargando ramas");
            } finally {
                setLoading(false);
            }
        };

        loadBranches();
    }, [slug]);

    // Fetch Diff whenever branch selections change
    useEffect(() => {
        if (!baseBranchId || !compareBranchId) return;

        const fetchComparison = async () => {
            if (baseBranchId === compareBranchId) {
                setDiffResult({ differences: [], isMergeable: false });
                return;
            }

            setFetchingDiff(true);
            try {
                const res = await ApiClient.get(`/projects/${slug}/compare?base=${baseBranchId}&compare=${compareBranchId}`);
                setDiffResult(res);
            } catch (err) {
                console.error(err);
                toast.error("Error comparando esquemas");
                setDiffResult({ differences: [], isMergeable: false });
            } finally {
                setFetchingDiff(false);
            }
        };

        fetchComparison();
    }, [baseBranchId, compareBranchId, slug]);

    if (loading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1200px] mx-auto p-8 relative min-h-screen pb-20">
            {/* Header & Back Link */}
            <div className="flex flex-col mb-8 gap-4">
                <Link href={`/projects/${slug}`} className="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors w-fit">
                    <ChevronLeft size={16} /> Volver al proyecto
                </Link>
                <div>
                    <h1 className="text-[28px] font-bold text-white tracking-tight flex items-center gap-3">
                        <GitMerge className="w-7 h-7 text-blue-400" /> Compare & Merge
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm max-w-xl">
                        Compara la estructura de la base de datos entre diferentes ramas y fusiona los cambios de forma aditiva. Las operaciones destructivas (Drops) serán ignoradas por seguridad.
                    </p>
                </div>
            </div>

            {/* Selectors Panel */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-[#0a0a0a] border border-zinc-800 rounded-xl p-5 mb-8">
                <div className="flex-1 w-full relative">
                    <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Rama Destino (Base)</label>
                    <select
                        value={baseBranchId}
                        onChange={(e) => setBaseBranchId(e.target.value)}
                        className="w-full appearance-none bg-[#161616] border border-zinc-700 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>
                                {b.name} {b.isDefault ? '(Default)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="shrink-0 flex items-center justify-center p-2 text-zinc-600 font-mono text-xl mt-6">
                    ←
                </div>

                <div className="flex-1 w-full relative">
                    <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Rama Origen (Compare)</label>
                    <select
                        value={compareBranchId}
                        onChange={(e) => setCompareBranchId(e.target.value)}
                        className="w-full appearance-none bg-[#161616] border border-zinc-700 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>
                                {b.name} {b.isDefault ? '(Default)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Diff Viewer Area */}
            {fetchingDiff ? (
                <div className="flex flex-col items-center justify-center p-20 bg-[#0a0a0a] border border-zinc-800 rounded-xl text-zinc-400">
                    <RefreshCw className="w-8 h-8 animate-spin mb-4 text-zinc-500" />
                    <p className="text-sm font-medium">Extrayendo y comparando esquemas de Postgres...</p>
                </div>
            ) : diffResult ? (
                <SchemaDiffViewer 
                    differences={diffResult.differences} 
                    isMergeable={diffResult.isMergeable}
                    baseBranchId={baseBranchId}
                    compareBranchId={compareBranchId}
                    projectSlug={slug}
                    onMergeSuccess={() => {
                        // Invalidate and refetch visually
                        router.refresh();
                    }}
                />
            ) : null}

        </div>
    );
}
