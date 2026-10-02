'use client';
import React from "react";


import { Button } from "@/components/ui/button";
import { Database, Sparkles, Upload, RefreshCw, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { PageHero, heroButtonClass } from "@/components/dashboard/page-hero";

const enrichments = [
    { name: 'LinkedIn Job Titles', records: '1,240', status: 'completed', date: 'Feb 24, 2025', icon: '💼' },
    { name: 'Email Verification', records: '3,500', status: 'processing', date: 'Feb 25, 2025', icon: '✉️' },
    { name: 'Company Firmographics', records: '800', status: 'completed', date: 'Feb 20, 2025', icon: '🏢' },
    { name: 'Phone Numbers', records: '620', status: 'failed', date: 'Feb 18, 2025', icon: '📞' },
];

const statusIcon: Record<string, React.ReactNode> = {
    completed: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    processing: <Clock className="h-4 w-4 text-blue-500 animate-spin" />,
    failed: <AlertCircle className="h-4 w-4 text-red-500" />,
};

const statusColor: Record<string, string> = {
    completed: 'bg-green-50 text-green-700',
    processing: 'bg-blue-50 text-blue-700',
    failed: 'bg-red-50 text-red-700',
};

export default function DataEnrichmentPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <PageHero
                title="Data Enrichment"
                breadcrumb={['CRM', 'Data enrichment']}
                icon={Sparkles}
                description="Enrich your contacts and companies with accurate, up-to-date data."
                actions={
                    <>
                        <button className={heroButtonClass('ghost')}>
                            <Upload className="h-4 w-4" /> Import CSV
                        </button>
                        <button className={heroButtonClass('gold')}>
                            <Sparkles className="h-4 w-4" /> Enrich with AI
                        </button>
                    </>
                }
            />

            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    { label: 'Records Enriched', value: '6,160', change: '+340 this week', icon: Database },
                    { label: 'Fields Enriched', value: '18 of 24', change: '75% coverage', icon: CheckCircle2 },
                    { label: 'API Credits Used', value: '4,820', change: '1,180 remaining', icon: RefreshCw },
                ].map((s, i) => (
                    <div key={i} className="ae-tile ae-contour p-5">
                        <div className="relative mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-800 text-gold-300"><s.icon className="h-4 w-4" /></span> {s.label}
                        </div>
                        <div className="relative font-display text-3xl font-semibold text-zinc-900">{s.value}</div>
                        <div className="text-xs text-zinc-400 mt-1">{s.change}</div>
                    </div>
                ))}
            </div>

            {/* Enrichment Jobs Table */}
            <div>
                <p className="ae-section-label mb-3">Recent enrichment jobs</p>
                <div className="ae-tile">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500">Job Name</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500">Records</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500">Status</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500">Date</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {enrichments.map((e, i) => (
                                <tr key={i} className="hover:bg-brand-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-lg">{e.icon}</span>
                                            <span className="font-medium text-zinc-900">{e.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-600">{e.records}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            {statusIcon[e.status]}
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[e.status]}`}>{e.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-500">{e.date}</td>
                                    <td className="px-4 py-3">
                                        <Button variant="ghost" className="h-7 text-xs text-zinc-600 px-2">View</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
