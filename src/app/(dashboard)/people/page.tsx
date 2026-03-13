'use client';

import { useState } from 'react';
import { MoreVertical, X, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function PeoplePage() {
    const { data: session } = useSession();
    const [inviteModalOpen, setInviteModalOpen] = useState(false);

    const userEmail = session?.user?.email || 'name@example.com';
    const userName = session?.user?.name || 'Admin User';

    return (
        <div className="flex h-full min-h-screen bg-[#0a0a0a] text-zinc-300">
            <div className="flex-1 max-w-4xl p-10 mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold text-white">People</h1>
                    <button
                        onClick={() => setInviteModalOpen(true)}
                        className="px-4 py-1.5 text-sm font-medium text-white bg-transparent border border-zinc-700 rounded-md hover:bg-zinc-800 transition-colors"
                    >
                        Invite member
                    </button>
                </div>

                {/* Main Content Area mapping Neon's layout */}
                <div className="flex gap-12">
                    <div className="flex-1 space-y-8">

                        {/* Members Section */}
                        <section id="members" className="p-6 border border-zinc-800 rounded-xl bg-[#161616]">
                            <h2 className="mb-2 text-xl font-semibold text-white">Members</h2>
                            <p className="mb-6 text-sm text-zinc-400">
                                Invite new members, assign roles, or remove from the organization.
                            </p>

                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-800/50">
                                        <th className="pb-3 text-sm font-medium text-zinc-400 w-2/3">Email</th>
                                        <th className="pb-3 text-sm font-medium text-zinc-400 w-1/3">Role &nbsp;↑</th>
                                        <th className="pb-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                                        <td className="py-4 text-sm text-white">{userEmail}</td>
                                        <td className="py-4 text-sm text-zinc-400">Admin</td>
                                        <td className="py-4 text-right">
                                            <button className="p-1 text-zinc-500 hover:text-white rounded">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                        {/* Pending Invites Section */}
                        <section id="pending-invites" className="p-6 border border-zinc-800 rounded-xl bg-[#161616]">
                            <h2 className="mb-2 text-xl font-semibold text-white">Pending invites</h2>
                            <p className="mt-4 text-sm font-semibold text-zinc-100">
                                There are no pending invites at the moment.
                            </p>
                        </section>

                    </div>

                    {/* Right side anchors */}
                    <div className="w-48 pt-6 hidden md:block">
                        <nav className="flex flex-col gap-3 text-sm font-medium">
                            <a href="#members" className="text-white">Members</a>
                            <a href="#pending-invites" className="text-zinc-500 hover:text-zinc-300">Pending invites</a>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Invite Members Modal */}
            {inviteModalOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />

                    {/* Modal Dialog */}
                    <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#1c1c1c] border border-zinc-800 shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-zinc-800/50">
                            <h3 className="text-lg font-semibold text-white">Invite members</h3>
                            <button onClick={() => setInviteModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-5">
                            <p className="mb-6 text-sm text-zinc-300 leading-relaxed">
                                AERO is better with teammates. Add members to <span className="font-semibold text-white">{userEmail}</span> and start collaborating straight away. Members can access this organization by visiting <a href="#" className="text-[#00e599] hover:underline">this link</a>.
                            </p>

                            <h4 className="mb-3 text-sm font-semibold text-white">Email addresses</h4>

                            <div className="space-y-3 mb-8">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <input
                                            type="email"
                                            placeholder="name@example.com"
                                            className="flex-1 px-3 py-2 text-sm bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                                        />
                                        <div className="relative w-32">
                                            <select className="w-full h-full px-3 py-2 text-sm font-medium text-white bg-black border border-zinc-800 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-zinc-500">
                                                <option value="member">Member</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
                                                <ChevronDown size={14} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/50">
                                <button
                                    onClick={() => setInviteModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-transparent border border-zinc-700 rounded-md hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setInviteModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors"
                                >
                                    Invite members
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
