'use client';

import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, List as ListIcon, ListChecks, Users, Star, ArrowUpDown } from "lucide-react";
import { PageHero, heroButtonClass } from "@/components/dashboard/page-hero";
import { useState } from "react";

const lists = [
    { name: 'ICP Companies Q1', type: 'Company', contacts: 340, created: 'Jan 15, 2025', status: 'active' },
    { name: 'Top Leads - SaaS', type: 'People', contacts: 850, created: 'Jan 20, 2025', status: 'active' },
    { name: 'Conference Attendees', type: 'People', contacts: 120, created: 'Feb 1, 2025', status: 'active' },
    { name: 'Churned Accounts', type: 'Company', contacts: 45, created: 'Feb 10, 2025', status: 'archived' },
];

export default function ListsPage() {
    const [search, setSearch] = useState('');
    const filtered = lists.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <PageHero
                title="Lists"
                breadcrumb={['CRM', 'Lists']}
                icon={ListChecks}
                description="Organize your contacts and accounts into targeted lists."
                stats={[{ label: 'Lists', value: lists.length, icon: ListChecks }]}
                actions={
                    <button className={heroButtonClass('gold')}>
                        <Plus className="h-4 w-4" /> New list
                    </button>
                }
            />

            {/* Tabs */}
            <div className="flex w-fit flex-wrap rounded-full bg-brand-800 p-1">
                {['All Lists', 'People Lists', 'Company Lists', 'Archived'].map((tab, i) => (
                    <button key={i} className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition-all ${i === 0 ? 'bg-white text-brand-900 shadow-sm' : 'text-white/75 hover:text-white'}`}>{tab}</button>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-3 h-4 w-4 text-zinc-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lists..." className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
                </div>
                <Button variant="outline" className="h-10 gap-1.5 text-sm"><Filter className="h-3.5 w-3.5" /> Filter</Button>
                <Button variant="outline" className="h-10 gap-1.5 text-sm"><ArrowUpDown className="h-3.5 w-3.5" /> Sort</Button>
            </div>

            {/* Table */}
            <div className="ae-tile">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500 tracking-wider">Name</th>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500 tracking-wider">Type</th>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500 tracking-wider">Contacts</th>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500 tracking-wider">Created</th>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500 tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {filtered.map((l, i) => (
                            <tr key={i} className="hover:bg-zinc-50 cursor-pointer transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-7 w-7 rounded-md bg-blue-50 flex items-center justify-center">
                                            <ListIcon className="h-3.5 w-3.5 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-zinc-900">{l.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-zinc-500">{l.type}</td>
                                <td className="px-4 py-3 font-medium text-zinc-700">{l.contacts.toLocaleString()}</td>
                                <td className="px-4 py-3 text-zinc-500">{l.created}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${l.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                                        {l.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-12 text-center text-zinc-400 text-sm">No lists found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
