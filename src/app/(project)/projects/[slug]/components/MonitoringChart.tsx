"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { RefreshCw, Activity } from 'lucide-react';
import { ApiClient } from '@/lib/api';

interface MetricPoint {
    timestamp: string;
    ramUsageMb: number;
    allocatedCu: number;
    isInactive: boolean;
}

interface MonitoringChartProps {
    projectSlug: string;
    branches: Array<{ id: string; name: string; isDefault?: boolean }>;
}

export default function MonitoringChart({ projectSlug, branches }: MonitoringChartProps) {
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [selectedCompute, setSelectedCompute] = useState<string>('Primary');
    const [data, setData] = useState<MetricPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (branches.length > 0 && !selectedBranchId) {
            const defaultBranch = branches.find(b => b.isDefault) || branches[0];
            setSelectedBranchId(defaultBranch.id);
        }
    }, [branches, selectedBranchId]);

    const fetchData = async () => {
        if (!projectSlug || !selectedBranchId) return;
        setLoading(true);
        try {
            const res = await ApiClient.get(`/projects/${projectSlug}/branches/${selectedBranchId}/metrics/compute`);
            
            // Format timestamps for the X-axis
            const formattedData = res.metrics.map((item: any) => ({
                ...item,
                timeLabel: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }));
            
            setData(formattedData);
        } catch (error) {
            console.error('Failed to fetch compute metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectSlug, selectedBranchId]);

    // Compute max RAM value for Y-axis scaling to make the line visible
    // Neon generally shows Allocated CU as a steady colored background reaching up to the limit
    const maxAllocated = data.length > 0 ? Math.max(...data.map(d => d.allocatedCu)) : 1024;
    const maxRam = data.length > 0 ? Math.max(...data.map(d => d.ramUsageMb)) : 0;
    const yAxisDomainMax = Math.max(maxAllocated, maxRam + 200);

    return (
        <div className="bg-[#0f0f0f] border border-zinc-800/80 rounded-lg overflow-hidden flex flex-col shadow-2xl h-full">
            {/* Header / Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/20">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <div className="p-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
                        <Activity className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-white font-medium text-[15px] tracking-wide">Monitoring</h3>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[13px]">
                    <div className="flex items-center gap-2">
                        <label className="text-zinc-400">Branch</label>
                        <select
                            value={selectedBranchId}
                            onChange={(e) => setSelectedBranchId(e.target.value)}
                            className="bg-black border border-zinc-800 text-white rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500/50"
                        >
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-zinc-400">Compute</label>
                        <select
                            value={selectedCompute}
                            onChange={(e) => setSelectedCompute(e.target.value)}
                            className="bg-black border border-zinc-800 text-zinc-300 rounded-md px-3 py-1.5 focus:outline-none cursor-not-allowed opacity-80"
                            disabled
                        >
                            <option value="Primary">Primary compute</option>
                        </select>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
                        title="Refresh metrics"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-green-400' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Chart Container */}
            <div className="p-5 flex-1 min-h-[350px] w-full relative">
                {loading && data.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f]/50 z-10">
                        <div className="animate-pulse flex flex-col items-center">
                            <Activity className="w-8 h-8 text-green-500/50 mb-3 animate-bounce" />
                            <div className="text-zinc-500 text-sm font-medium">Loading metrics...</div>
                        </div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 text-sm z-10">
                        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                            <Activity className="w-6 h-6 opacity-30" />
                        </div>
                        No compute metrics available for this branch yet.
                        <span className="text-xs text-zinc-600 mt-2">Metrics are collected every minute when active.</span>
                    </div>
                ) : null}

                {/* Legend mimicking Neon */}
                {data.length > 0 && (
                    <div className="flex items-center gap-6 mb-4 px-2 text-[12px] font-medium tracking-wide">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-emerald-500/30 bg-emerald-500/5 rounded-[2px]" />
                            <span className="text-zinc-400">Allocated CU</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-emerald-400 rounded-full" />
                            <span className="text-zinc-300">RAM Usage</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <div className="w-3 h-3 bg-zinc-800 rounded-[2px] overflow-hidden relative">
                                <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0tMiAxMGwxMi0xMk0tMiAwbDItMk04IDEwbDItMiIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')]" />
                            </div>
                            <span className="text-zinc-500">Endpoint Inactive</span>
                        </div>
                    </div>
                )}

                {/* The Chart */}
                <ResponsiveContainer width="100%" height="90%">
                    <ComposedChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            {/* Diagonal Stripes Pattern for "Inactive" area */}
                            <pattern id="stripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                <rect width="4" height="8" fill="rgba(82, 82, 91, 0.15)" />
                                <rect x="4" width="4" height="8" fill="transparent" />
                            </pattern>
                            <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        
                        <XAxis 
                            dataKey="timeLabel" 
                            stroke="#52525b" 
                            tick={{ fill: '#71717a', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        
                        <YAxis 
                            yAxisId="left"
                            stroke="#52525b" 
                            tick={{ fill: '#71717a', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, yAxisDomainMax]}
                            tickFormatter={(val: number) => `${val} MB`}
                        />

                        {/* Custom Tooltip */}
                        <Tooltip
                            content={({ active, payload, label }: any) => {
                                if (active && payload && payload.length) {
                                    const dataPoint = payload[0].payload as MetricPoint;
                                    return (
                                        <div className="bg-[#18181b] border border-zinc-800 p-3 rounded-lg shadow-xl drop-shadow-2xl">
                                            <p className="text-zinc-400 text-xs mb-2 font-medium">{label}</p>
                                            
                                            {dataPoint.isInactive ? (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse" />
                                                    <p className="text-zinc-300 text-sm font-medium tracking-wide">Endpoint Inactive</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center justify-between gap-6 mb-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                                            <span className="text-zinc-300 text-[13px]">RAM Usage</span>
                                                        </div>
                                                        <span className="text-white font-mono text-[13px] font-medium">{dataPoint.ramUsageMb} MB</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full border border-emerald-500/50 bg-emerald-500/20" />
                                                            <span className="text-zinc-400 text-[13px]">Allocated CU</span>
                                                        </div>
                                                        <span className="text-zinc-300 font-mono text-[13px]">{dataPoint.allocatedCu} MB</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        {/* Area representing Endpoint Inactive State */}
                        <Area 
                            yAxisId="left"
                            type="stepAfter" 
                            dataKey={(d: MetricPoint) => d.isInactive ? yAxisDomainMax : 0} 
                            fill="url(#stripes)" 
                            stroke="none" 
                            isAnimationActive={false}
                            activeDot={false}
                        />

                        {/* Area representing Allocated CU (faint green background) */}
                        <Area 
                            yAxisId="left"
                            type="step" 
                            dataKey="allocatedCu" 
                            stroke="#10b981" 
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            strokeOpacity={0.3}
                            fill="url(#colorAllocated)" 
                            activeDot={false}
                        />

                        {/* Line representing Actual RAM Usage */}
                        <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey={(d: MetricPoint) => d.isInactive ? null : d.ramUsageMb} 
                            stroke="#34d399" 
                            strokeWidth={2}
                            dot={false}
                            connectNulls={false}
                            activeDot={{ r: 4, fill: '#000', stroke: '#34d399', strokeWidth: 2 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
