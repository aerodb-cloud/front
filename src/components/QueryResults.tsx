import React from 'react';

interface QueryResultsProps {
    result: {
        command: string;
        rowCount: number;
        fields: string[];
        rows: any[];
        duration?: string;
    } | null;
    error: string | null;
    loading: boolean;
}

export function QueryResults({ result, error, loading }: QueryResultsProps) {
    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-3">
                <div className="w-5 h-5 border-2 border-zinc-700 border-t-[#00e599] rounded-full animate-spin"></div>
                <span className="text-sm">Ejecutando consulta...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-4 bg-red-950/20 text-red-500 overflow-auto font-mono text-sm">
                <p className="font-semibold mb-2">Error al ejecutar la consulta:</p>
                <div className="bg-black/40 p-3 rounded border border-red-900/50 whitespace-pre-wrap">
                    {error}
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm italic py-10">
                Ejecuta una consulta para ver los resultados aquí
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#0c0d0d]">
            {/* Status Bar */}
            <div className="px-4 py-2 bg-[#161616] border-b border-zinc-800 flex items-center gap-4 text-xs font-medium text-zinc-400 shrink-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-zinc-600">Estado:</span>
                    <span className="text-[#00e599]">Éxito</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-zinc-600">Tiempo:</span>
                    <span className="text-white">{result.duration || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-zinc-600">Filas:</span>
                    <span className="text-white">{result.rowCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-zinc-600">Comando:</span>
                    <span className="text-zinc-300 font-mono px-1.5 py-0.5 bg-zinc-800 rounded">{result.command}</span>
                </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-auto bg-black">
                {result.fields.length === 0 ? (
                    <div className="p-4 text-zinc-500 text-sm text-center mt-10">
                        Consulta ejecutada con éxito. (Sin datos de retorno)
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="sticky top-0 bg-[#1e1e1e] shadow-md z-10">
                            <tr>
                                <th className="px-2 py-1.5 border-b border-r border-zinc-800 w-10 text-center text-zinc-600 font-mono bg-[#161616]">#</th>
                                {result.fields.map((field, i) => (
                                    <th key={i} className="px-4 py-2 font-medium text-zinc-300 border-b border-r border-zinc-700 whitespace-nowrap bg-[#1a1a1a]">
                                        {field}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="font-mono text-[13px]">
                            {result.rows.map((row, i) => (
                                <tr key={i} className="hover:bg-zinc-900/50 border-b border-zinc-800/50 transition-colors group">
                                    <td className="px-2 py-1.5 text-center text-zinc-600 border-r border-zinc-800 bg-[#161616] group-hover:bg-[#1a1a1a] transition-colors">
                                        {i + 1}
                                    </td>
                                    {result.fields.map((field, j) => (
                                        <td key={j} className="px-4 py-1.5 text-zinc-300 border-r border-zinc-800/50 whitespace-nowrap max-w-[300px] overflow-hidden text-ellipsis">
                                            {row[field] === null ? (
                                                <span className="text-zinc-600 italic">null</span>
                                            ) : row[field] === undefined ? (
                                                <span className="text-zinc-600 italic">undefined</span>
                                            ) : typeof row[field] === 'object' ? (
                                                JSON.stringify(row[field])
                                            ) : typeof row[field] === 'boolean' ? (
                                                <span className={row[field] ? 'text-blue-400' : 'text-zinc-500'}>{String(row[field])}</span>
                                            ) : (
                                                String(row[field])
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
