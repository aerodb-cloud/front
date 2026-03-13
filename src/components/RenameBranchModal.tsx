'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Branch {
    id: string;
    name: string;
    type: string;
}

interface RenameBranchModalProps {
    isOpen: boolean;
    onClose: () => void;
    branch: Branch | null;
    onSuccess: (newName: string) => void;
}

export function RenameBranchModal({ isOpen, onClose, branch, onSuccess }: RenameBranchModalProps) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && branch) {
            setName(branch.name);
        }
    }, [isOpen, branch]);

    if (!isOpen || !branch) return null;

    const isUnchanged = name.trim() === branch.name;
    const isInvalid = name.trim() === '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isUnchanged || isInvalid) return;
        
        setLoading(true);
        // We handle the actual API call in the parent component
        onSuccess(name.trim());
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <section className="bg-[#121212] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-[440px] overflow-hidden" role="dialog" aria-labelledby="rename-modal-title" tabIndex={-1}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                    <div className="flex-1">
                        <h2 id="rename-modal-title" className="text-[18px] font-semibold text-white tracking-tight">
                            Rename the branch
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white transition-colors" type="button" tabIndex={0} aria-label="Close">
                        <span className="w-5 h-5 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 17 16" role="img" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M7.64 8.03 2.67 3.06 3.73 2 8.7 6.97 13.67 2l1.06 1.06-4.97 4.97L14.73 13l-1.06 1.06L8.7 9.1l-4.97 4.97L2.67 13z" clipRule="evenodd"></path></svg>
                        </span>
                    </button>
                </div>

                {/* Form */}
                <div className="p-6">
                    <form id="branch_rename_form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="branch_name_input" className="text-[13px] font-medium text-zinc-300">
                                Name
                            </label>
                            <div className="relative">
                                <input 
                                    id="branch_name_input"
                                    type="text" 
                                    name="name" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#1c1c1c] border border-zinc-600/80 rounded-[5px] px-3 py-[9px] text-[14px] text-white focus:outline-none focus:border-white focus:ring-[3px] focus:ring-zinc-800/80 transition-all font-mono"
                                    placeholder="Branch name"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 mt-2">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="px-4 py-2 text-[14px] font-medium text-white bg-transparent border border-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            <button 
                                type="submit" 
                                disabled={isUnchanged || isInvalid || loading}
                                className="px-4 py-2 text-[14px] font-medium text-black bg-white hover:bg-zinc-200 disabled:bg-zinc-600 disabled:text-zinc-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}
