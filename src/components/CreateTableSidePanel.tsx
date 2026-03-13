'use client';

import React, { useState } from 'react';

interface CreateTableSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    branchName: string;
}

export function CreateTableSidePanel({ isOpen, onClose, branchName }: CreateTableSidePanelProps) {
    if (!isOpen) return null;

    return (
        <div 
            className={`fixed inset-y-0 right-0 z-50 flex flex-col h-full w-screen max-w-2xl bg-[#161616] border-l border-zinc-800 shadow-xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            role="dialog"
            aria-modal="true"
        >
            <header className="flex items-center space-y-1 py-4 px-4 bg-[#111] sm:px-6 border-b border-zinc-800 shrink-0">
                <span className="text-zinc-300 text-sm font-medium">
                    Create a new table under <code className="text-zinc-100 bg-zinc-800 px-1.5 py-0.5 rounded text-xs">{branchName}</code>
                </span>
            </header>

            <div className="relative flex-1 overflow-y-auto">
                {/* Basic Info */}
                <div className="px-4 sm:px-6 space-y-8 py-6">
                    <div className="grid gap-2 md:grid-cols-12">
                        <div className="flex flex-col space-y-2 col-span-4">
                            <label className="block text-zinc-400 text-sm break-all font-medium">Name</label>
                            <p className="text-xs text-zinc-600">The name of your table.</p>
                        </div>
                        <div className="col-span-8">
                            <input 
                                type="text" 
                                className="block w-full rounded-md shadow-sm transition-all text-zinc-200 outline-none focus:ring-1 focus:ring-white focus:border-white bg-[#0c0d0d] border border-zinc-700 text-sm px-4 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-12">
                        <div className="flex flex-col space-y-2 col-span-4">
                            <label className="block text-zinc-400 text-sm break-all font-medium">Description</label>
                            <p className="text-xs text-zinc-600">Optional description for your table.</p>
                        </div>
                        <div className="col-span-8">
                            <input 
                                type="text" 
                                placeholder="Optional"
                                className="block w-full rounded-md shadow-sm transition-all text-zinc-200 outline-none focus:ring-1 focus:ring-white focus:border-white bg-[#0c0d0d] border border-zinc-700 text-sm px-4 py-2 placeholder-zinc-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full h-px my-2 bg-zinc-800/50"></div>

                {/* Security and Realtime */}
                <div className="px-4 sm:px-6 space-y-8 py-6">
                    <div className="flex cursor-pointer leading-none">
                        <input id="enable-rls" type="checkbox" className="bg-transparent outline-none ring-offset-zinc-900 focus:ring-2 focus:ring-white border-zinc-600 rounded h-4 w-4 mt-0.5 mr-3.5 accent-white cursor-pointer" defaultChecked />
                        <label className="text-zinc-400 cursor-pointer text-sm" htmlFor="enable-rls">
                            <div className="flex items-center space-x-2">
                                <span className="text-zinc-200 font-medium">Enable Row Level Security (RLS)</span>
                                <div className="inline-flex items-center gap-1 justify-center rounded-full uppercase font-bold text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700">Recommended</div>
                            </div>
                            <p className="text-zinc-500 text-xs mt-1">Restrict access to your table by enabling RLS and writing Postgres policies.</p>
                        </label>
                    </div>

                    <div className="relative w-full text-sm rounded-lg border border-yellow-900/50 bg-yellow-950/20 p-4 text-yellow-200/80 mt-3 flex gap-3">
                        <div className="mt-0.5 text-yellow-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 20" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M0.625 9.8252C0.625 4.44043 4.99023 0.0751953 10.375 0.0751953C15.7598 0.0751953 20.125 4.44043 20.125 9.8252C20.125 15.21 15.7598 19.5752 10.375 19.5752C4.99023 19.5752 0.625 15.21 0.625 9.8252ZM9.3584 4.38135C9.45117 4.28857 9.55518 4.20996 9.66699 4.14648C9.88086 4.02539 10.1245 3.96045 10.375 3.96045C10.5845 3.96045 10.7896 4.00586 10.9766 4.09229C11.1294 4.1626 11.2705 4.26025 11.3916 4.38135C11.6611 4.65088 11.8125 5.0166 11.8125 5.39795C11.8125 5.5249 11.7959 5.6499 11.7637 5.77002C11.6987 6.01172 11.5718 6.23438 11.3916 6.41455C11.1221 6.68408 10.7563 6.83545 10.375 6.83545C9.99365 6.83545 9.62793 6.68408 9.3584 6.41455C9.08887 6.14502 8.9375 5.7793 8.9375 5.39795C8.9375 5.29492 8.94873 5.19287 8.97021 5.09375C9.02783 4.82568 9.16162 4.57812 9.3584 4.38135ZM10.375 15.6899C10.0933 15.6899 9.82275 15.5781 9.62354 15.3789C9.42432 15.1797 9.3125 14.9092 9.3125 14.6274V9.31494C9.3125 9.0332 9.42432 8.7627 9.62354 8.56348C9.82275 8.36426 10.0933 8.25244 10.375 8.25244C10.6567 8.25244 10.9272 8.36426 11.1265 8.56348C11.3257 8.7627 11.4375 9.0332 11.4375 9.31494V14.6274C11.4375 14.7944 11.3979 14.9575 11.3242 15.104C11.2739 15.2046 11.2075 15.2979 11.1265 15.3789C10.9272 15.5781 10.6567 15.6899 10.375 15.6899Z"></path></svg>
                        </div>
                        <div className="flex flex-col">
                            <h5 className="font-medium text-sm text-yellow-500/90 mb-1">Policies are required to query data</h5>
                            <div className="text-xs font-normal mb-2 leading-relaxed">
                                You need to create an access policy before you can query data from this table. Without a policy, querying this table will return an <u className="text-yellow-400">empty array</u> of results. You can create policies after saving this table.
                            </div>
                            <div>
                                <button className="inline-flex items-center gap-2 text-xs font-medium bg-yellow-900/30 hover:bg-yellow-900/50 border border-yellow-700/50 px-3 py-1.5 rounded transition-colors text-yellow-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                                    Documentation
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex cursor-pointer leading-none mt-6">
                        <input id="enable-realtime" type="checkbox" className="bg-transparent outline-none ring-offset-zinc-900 focus:ring-2 focus:ring-white border-zinc-600 rounded h-4 w-4 mt-0.5 mr-3.5 accent-white cursor-pointer" />
                        <label className="text-zinc-400 cursor-pointer text-sm" htmlFor="enable-realtime">
                            <span className="text-zinc-200 font-medium">Enable Realtime</span>
                            <p className="text-zinc-500 text-xs mt-1">Broadcast changes on this table to authorized subscribers.</p>
                        </label>
                    </div>
                </div>

                <div className="w-full h-px my-2 bg-zinc-800/50"></div>

                {/* Columns section */}
                <div className="px-4 sm:px-6 space-y-6 py-6">
                    <div className="flex items-center justify-between w-full mb-4">
                        <h5 className="font-medium text-zinc-200">Columns</h5>
                        <div className="flex items-center gap-x-3">
                            <button className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                                About data types
                            </button>
                            <div className="h-3 border-r border-zinc-700"></div>
                            <button className="text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded transition-colors border border-zinc-700">
                                Import data from CSV
                            </button>
                        </div>
                    </div>

                    {/* Columns table structure mock */}
                    <div className="space-y-2">
                        <div className="flex w-full px-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">
                            <div className="w-[5%]"></div>
                            <div className="w-[25%]">Name</div>
                            <div className="w-[25%]">Type</div>
                            <div className="w-[25%]">Default Value</div>
                            <div className="w-[10%]">Primary</div>
                            <div className="w-[10%]"></div>
                        </div>
                        
                        <div className="space-y-2 bg-[#1a1a1a] rounded-lg p-2 border border-zinc-800">
                            {/* Row 1 (id) */}
                            <div className="flex w-full items-center">
                                <div className="w-[5%] flex justify-center text-zinc-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg></div>
                                <div className="w-[25%] pr-2"><input type="text" value="id" readOnly className="w-full bg-[#0c0d0d] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-300" /></div>
                                <div className="w-[25%] pr-2">
                                    <button className="w-full flex items-center justify-between bg-zinc-800/50 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-300 text-left">
                                        <div className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg> int8</div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg>
                                    </button>
                                </div>
                                <div className="w-[25%] pr-2"><input type="text" placeholder="NULL" disabled className="w-full bg-[#0c0d0d] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-500 opacity-50" /></div>
                                <div className="w-[10%] flex justify-center"><input type="checkbox" checked readOnly className="border-zinc-600 rounded bg-transparent h-3.5 w-3.5 accent-zinc-500" /></div>
                                <div className="w-[10%] flex justify-end gap-2 text-zinc-500">
                                    <button><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                                    <button><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>
                                </div>
                            </div>

                            {/* Row 2 (created_at) */}
                            <div className="flex w-full items-center pt-1">
                                <div className="w-[5%] flex justify-center text-zinc-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg></div>
                                <div className="w-[25%] pr-2"><input type="text" value="created_at" readOnly className="w-full bg-[#0c0d0d] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-300" /></div>
                                <div className="w-[25%] pr-2">
                                    <button className="w-full flex items-center justify-between bg-zinc-800/50 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-300 text-left">
                                        <div className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg> timestamptz</div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg>
                                    </button>
                                </div>
                                <div className="w-[25%] pr-2"><input type="text" value="now()" readOnly className="w-full bg-[#0c0d0d] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-300" /></div>
                                <div className="w-[10%] flex justify-center"><input type="checkbox" readOnly className="border-zinc-600 rounded bg-transparent h-3.5 w-3.5" /></div>
                                <div className="w-[10%] flex justify-end gap-2 text-zinc-500">
                                    <button><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                                    <button><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center rounded-lg border border-zinc-700 border-dashed py-3 mt-4 hover:border-zinc-500 hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                            <button className="text-xs text-zinc-300 group-hover:text-white font-medium">Add column</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center gap-3 border-t border-zinc-800 px-6 py-4 justify-end bg-[#111] shrink-0">
                <button 
                    onClick={onClose}
                    className="px-4 py-1.5 text-xs font-medium border border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded transition-colors"
                >
                    Cancel
                </button>
                <button className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex items-center gap-2">
                    Save <span className="opacity-60 font-normal">Ctrl+↵</span>
                </button>
            </div>
        </div>
    );
}
