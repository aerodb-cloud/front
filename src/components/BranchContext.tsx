'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ApiClient } from '@/lib/api';

export interface Branch {
    id: string;
    projectId: string;
    name: string;
    timelineId: string;
    parentTimelineId: string | null;
    type: 'production' | 'preview' | 'dev';
    endpointId: string | null;
    createdAt: string;
    updatedAt: string;
}

interface BranchContextType {
    branches: Branch[];
    activeBranch: Branch | null;
    setActiveBranch: (branch: Branch) => void;
    isLoading: boolean;
    refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ projectId, children }: { projectId: string; children: React.ReactNode }) {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [activeBranch, setActiveBranchState] = useState<Branch | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();

    const refreshBranches = async () => {
        try {
            const data = await ApiClient.get(`/projects/${projectId}/branches`);
            const loadedBranches = data.branches || [];
            setBranches(loadedBranches);

            // Extract branchName from URL to act as absolute truth on page reload (F5)
            const branchMatch = pathname?.match(/\/branches\/([^/]+)/);
            const urlBranchName = branchMatch && branchMatch[1] !== 'page' ? decodeURIComponent(branchMatch[1]) : null;

            if (urlBranchName) {
                const routeBranch = loadedBranches.find((b: Branch) => b.name === urlBranchName || b.id === urlBranchName);
                if (routeBranch) {
                    setActiveBranchState(routeBranch);
                    return; // Absolute truth matched, skip fallback
                }
            }

            // Set active branch to previous selection or default to production
            if (activeBranch) {
                const stillExists = loadedBranches.find((b: Branch) => b.id === activeBranch.id);
                if (!stillExists) setActiveBranchState(loadedBranches.find((b: Branch) => b.type === 'production') || loadedBranches[0] || null);
            } else if (loadedBranches.length > 0) {
                const prod = loadedBranches.find((b: Branch) => b.type === 'production');
                setActiveBranchState(prod || loadedBranches[0]);
            }
        } catch (error) {
            console.error('Failed to load branches', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshBranches();
    }, [projectId]);

    return (
        <BranchContext.Provider value={{ branches, activeBranch, setActiveBranch: setActiveBranchState, isLoading, refreshBranches }}>
            {children}
        </BranchContext.Provider>
    );
}

export function useBranch() {
    const context = useContext(BranchContext);
    if (context === undefined) {
        throw new Error('useBranch must be used within a BranchProvider');
    }
    return context;
}
