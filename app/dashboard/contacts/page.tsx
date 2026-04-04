'use client';

import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Plus, Download, Upload, Filter, MoreHorizontal, User, Mail, MapPin, Cake, ShoppingBag, Trash2, Edit2, FileText, CheckCircle2, X } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";

interface Contact {
    id: number;
    name: string;
    email: string;
    location: string;
    birthday: string;
    lastPurchase: string;
    status: 'Active' | 'Inactive';
}

const initialContacts: Contact[] = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', location: 'Hyderabad', birthday: '1992-04-12', lastPurchase: '2026-03-20', status: 'Active' },
    { id: 2, name: 'Priya Verma', email: 'priya@example.com', location: 'Bangalore', birthday: '1995-10-25', lastPurchase: '2026-02-15', status: 'Active' },
    { id: 3, name: 'Amit Patel', email: 'amit@example.com', location: 'Mumbai', birthday: '1988-06-05', lastPurchase: '2026-01-10', status: 'Inactive' },
    { id: 4, name: 'Sneha Rao', email: 'sneha@example.com', location: 'Hyderabad', birthday: '1990-12-30', lastPurchase: '2026-03-25', status: 'Active' },
];

export default function ContactsPage() {
    const [search, setSearch] = useState('');
    const [contacts, setContacts] = useState<Contact[]>(initialContacts);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [newContact, setNewContact] = useState({
        name: '', email: '', location: 'Hyderabad', birthday: '', lastPurchase: '', status: 'Active' as const
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddManual = () => {
        if (!newContact.name || !newContact.email) return;
        const contact: Contact = { 
            id: Date.now(), 
            ...newContact,
            birthday: newContact.birthday || 'N/A',
            lastPurchase: newContact.lastPurchase || 'N/A'
        };
        setContacts([contact, ...contacts]);
        setNewContact({ name: '', email: '', location: 'Hyderabad', birthday: '', lastPurchase: '', status: 'Active' });
        setIsAddModalOpen(false);
    };

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            const newContacts: Contact[] = lines.slice(1).filter(line => line.trim()).map((line, index) => {
                const [name, email, location, birthday, lastPurchase] = line.split(',');
                return {
                    id: Date.now() + index,
                    name: name?.trim() || 'Unknown',
                    email: email?.trim() || '',
                    location: location?.trim() || 'N/A',
                    birthday: birthday?.trim() || 'N/A',
                    lastPurchase: lastPurchase?.trim() || 'N/A',
                    status: 'Active'
                };
            });
            setContacts([...newContacts, ...contacts]);
            setIsImportModalOpen(false);
            alert(`Successfully imported ${newContacts.length} contacts!`);
        };
        reader.readAsText(file);
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
                            Upload a CSV file to bulk import customer records
                        </SheetDescription>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center text-center">
                        <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                            <Upload className="h-10 w-10 text-blue-500" />
                        </div>
                        <div className="space-y-2 mb-8">
                            <h3 className="text-lg font-bold text-zinc-900">Upload CSV File</h3>
                            <p className="text-sm text-zinc-500 max-w-[280px]">Ensure your CSV has columns for Name, Email, Location, and Birthday.</p>
                        </div>
                        
                        <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleCSVUpload} />
                        
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-32 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-zinc-50 hover:bg-zinc-100/50 hover:border-zinc-300 transition-all group"
                        >
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <FileText className="h-5 w-5 text-zinc-400" />
                            </div>
                            <span className="text-sm font-bold text-zinc-600">Click to browse or drag & drop</span>
                            <span className="text-[11px] text-zinc-400 font-medium">Support .CSV up to 10MB</span>
                        </button>

                        <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-left w-full">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold text-emerald-900">CSV Template Ready</h4>
                                <p className="text-[11px] text-emerald-700/80 font-medium leading-relaxed">Download our <span className="underline font-bold cursor-pointer hover:text-emerald-900 text-emerald-900">sample template</span> to verify formatting.</p>
                            </div>
                        </div>
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
                        <p className="text-xs text-zinc-500">Manage {contacts.length} customers and prospects</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        className="h-9 px-5 text-xs font-bold gap-2 border-zinc-200 hover:bg-zinc-50 rounded-full transition-all" 
                        onClick={() => setIsImportModalOpen(true)}
                    >
                        <Upload className="h-3.5 w-3.5" /> Import CSV
                    </Button>
                    <Button 
                        className="h-9 bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 font-bold text-xs px-6 rounded-full gap-2 shadow-md transition-all" 
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus className="h-4 w-4" /> Add Contact
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border-b border-zinc-200 px-6 py-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <input className="w-full h-8 bg-zinc-50 border border-zinc-200 rounded-md pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-300"
                            placeholder="Search by name, email..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <Button variant="ghost" className="h-8 text-xs font-bold text-zinc-600 gap-1.5 px-2">
                        <Filter className="h-3.5 w-3.5" /> Filters
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="h-8 text-xs font-bold text-zinc-600 gap-2">
                        Sort by: <span className="text-zinc-900">Recent</span> <ChevronDown className="h-3.5 w-3.5" />
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
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Last Purchase</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())).map((contact) => (
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
                                            <Cake className="h-3.5 w-3.5 text-zinc-400" /> {contact.birthday}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-[13px] text-zinc-600 font-medium">
                                            <ShoppingBag className="h-3.5 w-3.5 text-zinc-400" /> {contact.lastPurchase}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                            contact.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                                        )}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-zinc-100 rounded-md text-zinc-500"><Edit2 className="h-3.5 w-3.5" /></button>
                                            <button className="p-1.5 hover:bg-rose-50 rounded-md text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {contacts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-zinc-200">
                        <div className="h-16 w-16 rounded-full bg-zinc-50 flex items-center justify-center mb-4">
                            <User className="h-8 w-8 text-zinc-300" />
                        </div>
                        <h3 className="font-bold text-zinc-900">No contacts found</h3>
                        <p className="text-sm text-zinc-500 mt-1 mb-6">Start by adding a contact manually or uploading a CSV file.</p>
                        <div className="flex gap-3">
                            <Button onClick={() => setIsAddModalOpen(true)}>Add Contact</Button>
                            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>Upload CSV</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

