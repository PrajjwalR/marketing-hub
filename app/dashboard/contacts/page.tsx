'use client';

import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Plus, Upload, Filter, User, Mail, MapPin, Cake, ShoppingBag, Trash2, Edit2, FileText, CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";

interface Contact {
    id: string;
    name: string;
    email: string;
    location: string;
    location_status?: string | null;
    birthday: string | null;
    birthday_details?: string | null;
    purchase_count?: number | null;
    total_purchase_amount?: number | null;
    last_purchase?: string | null;
    status: 'Active' | 'Inactive';
}

export default function ContactsPage() {
    const [search, setSearch] = useState('');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [newContact, setNewContact] = useState({
        name: '',
        email: '',
        location: 'Hyderabad',
        birthday: '',
        purchase_count: 0,
        total_purchase_amount: 0,
        status: 'Active' as const
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchContacts = async () => {
        try {
            const res = await fetch('/api/crm/contacts');
            if (res.ok) {
                const data = await res.json();
                setContacts(data);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleAddManual = async () => {
        if (!newContact.name || !newContact.email) return;
        
        const res = await fetch('/api/crm/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newContact)
        });

        if (res.ok) {
            fetchContacts();
            setNewContact({
                name: '',
                email: '',
                location: 'Hyderabad',
                birthday: '',
                purchase_count: 0,
                total_purchase_amount: 0,
                status: 'Active'
            });
            setIsAddModalOpen(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) return;
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) return;

        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const getFromRow = (
            row: Record<string, unknown>,
            aliases: string[],
            fallbackIndex?: number
        ) => {
            const entries = Object.entries(row);
            for (const [key, value] of entries) {
                const nk = normalize(key);
                if (aliases.some((a) => nk.includes(normalize(a)))) {
                    const out = String(value ?? '').trim();
                    if (out) return out;
                }
            }
            if (fallbackIndex !== undefined) {
                const values = Object.values(row);
                const out = String(values[fallbackIndex] ?? '').trim();
                if (out) return out;
            }
            return '';
        };

        const entries = rows.map((row) => {
            const birthdayDetails = getFromRow(row, ['birthday_details', 'birthday details', 'birthday'], 4);
            const purchaseCount = Number(getFromRow(row, ['purchase_count', 'purchase count', 'times purchased'], 5));
            const totalAmount = Number(getFromRow(row, ['total_purchase_amount', 'total purchase amount', 'total purchased'], 6));
            const rawStatus = getFromRow(row, ['status'], 7);
            const status = rawStatus.toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
            return {
                name: getFromRow(row, ['name', 'full name', 'customer name'], 0) || 'Unknown',
                email: getFromRow(row, ['email', 'email address', 'mail'], 1),
                location: getFromRow(row, ['location', 'city', 'address'], 2) || 'Hyderabad',
                location_status: getFromRow(row, ['location_status', 'location status', 'region'], 3) || 'Local',
                birthday: birthdayDetails || null,
                birthday_details: birthdayDetails || null,
                purchase_count: Number.isFinite(purchaseCount) ? purchaseCount : 0,
                total_purchase_amount: Number.isFinite(totalAmount) ? totalAmount : 0,
                status
            };
        }).filter((entry) => entry.email && /.+@.+\..+/.test(entry.email));

        if (entries.length === 0) {
            alert('No valid contacts found. Please ensure your file includes at least Name and Email columns.');
            return;
        }

        for (const entry of entries) {
            await fetch('/api/crm/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
            });
        }

        fetchContacts();
        setIsImportModalOpen(false);
        alert(`Successfully imported ${entries.length} contacts!`);
    };

    return (
        <div className="flex flex-col min-h-full bg-zinc-50/50">
            {/* Add New Contact Sidebar */}
            <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <SheetContent side="right" className="sm:max-w-md p-0 gap-0 border-l border-zinc-200 flex flex-col bg-white">
                    <SheetHeader className="shrink-0 border-b border-zinc-200 px-6 py-5 text-left space-y-1">
                        <SheetTitle className="text-[17px] font-bold flex items-center gap-2 text-zinc-900">
                            <Plus className="h-4.5 w-4.5 bg-zinc-900 rounded text-white p-0.5" />
                            Add New Contact
                        </SheetTitle>
                        <SheetDescription className="text-zinc-500 text-xs font-normal">
                            Manually add a new customer record to your CRM
                        </SheetDescription>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Full Name</label>
                                <input className="w-full h-11 bg-white border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f2d412]/50 shadow-sm" 
                                    value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} placeholder="e.g. Rahul Sharma" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Email Address</label>
                                <input className="w-full h-11 bg-white border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f2d412]/50 shadow-sm" 
                                    value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} placeholder="rahul@example.com" />
                            </div>
                            <div className="grid grid-cols-1 gap-6 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Location</label>
                                    <div className="relative">
                                        <select className="w-full h-11 bg-white border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f2d412]/50 appearance-none shadow-sm"
                                            value={newContact.location} onChange={e => setNewContact({...newContact, location: e.target.value})}>
                                            <option>Hyderabad</option>
                                            <option>Bangalore</option>
                                            <option>Mumbai</option>
                                            <option>Delhi</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Birthday</label>
                                    <input type="date" className="w-full h-11 bg-white border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f2d412]/50 shadow-sm" 
                                        value={newContact.birthday} onChange={e => setNewContact({...newContact, birthday: e.target.value})} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">No. of times purchased</label>
                                    <input type="number" min={0} className="w-full h-11 bg-white border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f2d412]/50 shadow-sm" 
                                        value={newContact.purchase_count} onChange={e => setNewContact({...newContact, purchase_count: Number(e.target.value || 0)})} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Total amount purchased</label>
                                    <input type="number" min={0} step="0.01" className="w-full h-11 bg-white border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f2d412]/50 shadow-sm" 
                                        value={newContact.total_purchase_amount} onChange={e => setNewContact({...newContact, total_purchase_amount: Number(e.target.value || 0)})} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="shrink-0 bg-zinc-50 p-6 border-t border-zinc-200">
                       <div className="flex w-full gap-3">
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-11 text-sm font-bold border-zinc-200 rounded-full">Cancel</Button>
                            <Button className="flex-1 h-11 bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 font-bold rounded-full shadow-md transition-all" onClick={handleAddManual}>Save Contact</Button>
                       </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Import Contacts Sidebar */}
            <Sheet open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <SheetContent side="right" className="sm:max-w-md p-0 gap-0 border-l border-zinc-200 flex flex-col bg-white">
                    <SheetHeader className="shrink-0 border-b border-zinc-200 px-6 py-5 text-left space-y-1">
                        <SheetTitle className="text-[17px] font-bold flex items-center gap-2 text-zinc-900">
                            <Upload className="h-4.5 w-4.5 bg-zinc-900 rounded text-white p-1" />
                            Import Contacts
                        </SheetTitle>
                        <SheetDescription className="text-zinc-500 text-xs font-normal">
                            Upload a spreadsheet or CSV file to bulk import customer records
                        </SheetDescription>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center text-center">
                        <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                            <Upload className="h-10 w-10 text-blue-500" />
                        </div>
                        <div className="space-y-2 mb-8">
                            <h3 className="text-lg font-bold text-zinc-900">Upload Contacts File</h3>
                            <p className="text-sm text-zinc-500 max-w-[280px]">
                                CSV columns: name, email, location, birthday, purchase_count, total_purchase_amount, status
                            </p>
                        </div>
                        
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-32 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-zinc-50 hover:bg-zinc-100/50 hover:border-zinc-300 transition-all group"
                        >
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <FileText className="h-5 w-5 text-zinc-400" />
                            </div>
                            <span className="text-sm font-bold text-zinc-600">Click to browse or drag & drop</span>
                            <span className="text-[11px] text-zinc-400 font-medium">Supports .csv, .xlsx, .xls</span>
                        </button>
                    </div>

                    <SheetFooter className="shrink-0 bg-zinc-50 p-6 border-t border-zinc-200">
                        <Button variant="ghost" onClick={() => setIsImportModalOpen(false)} className="w-full h-11 text-sm font-bold text-zinc-500 rounded-full">Cancel and Close</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Top Bar */}
            <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-900">Contacts</h1>
                        <p className="text-xs text-zinc-500">Manage {contacts.length} customers</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        className="h-9 px-5 text-xs font-bold gap-2 border-zinc-200 hover:bg-zinc-50 rounded-full transition-all" 
                        onClick={() => setIsImportModalOpen(true)}
                    >
                        <Upload className="h-3.5 w-3.5" /> Import File
                    </Button>
                    <Button 
                        className="h-9 bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 font-bold text-xs px-6 rounded-full gap-2 shadow-md transition-all" 
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus className="h-4 w-4" /> Add Contact
                    </Button>
                </div>
            </div>

            {/* Contacts Table */}
            <div className="flex-1 overflow-auto p-6">
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-200">
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-8">
                                    <input type="checkbox" className="rounded border-zinc-300" />
                                </th>
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Birthday</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Times Purchased</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Purchased</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {isLoading ? (
                                <tr><td colSpan={7} className="text-center py-10 text-sm text-zinc-400">Loading contacts...</td></tr>
                            ) : contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())).map((contact) => (
                                <tr key={contact.id} className="hover:bg-zinc-50 transition-colors group">
                                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-zinc-300" /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                                                <User className="h-4 w-4 text-zinc-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-zinc-900 leading-none mb-1">{contact.name}</span>
                                                <div className="flex items-center gap-1 text-[11px] text-zinc-500 leading-none">
                                                    <Mail className="h-2.5 w-2.5" /> {contact.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-[13px] text-zinc-600 font-medium">
                                            <MapPin className="h-3.5 w-3.5 text-zinc-400" /> {contact.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-[13px] text-zinc-600 font-medium">
                                            <Cake className="h-3.5 w-3.5 text-zinc-400" /> {contact.birthday || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[13px] text-zinc-700 font-semibold">
                                        {contact.purchase_count ?? 0}
                                    </td>
                                    <td className="px-6 py-4 text-[13px] text-zinc-700 font-semibold">
                                        ₹{Number(contact.total_purchase_amount ?? 0).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                            contact.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                                        )}>
                                            {contact.status}
                                        </span>
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
