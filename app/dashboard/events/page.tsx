'use client';

import { Button } from "@/components/ui/button";
import { Search, Sparkles, ChevronDown, Settings, Bell, Calendar, MapPin, UserCheck, Plus, Trash2, Edit2, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";

import { INDIAN_HOLIDAYS_DATA } from "@/lib/indian-holidays";

const holidayCategories = [
    { name: 'National Holidays', key: 'national_holidays', color: 'text-rose-600 bg-rose-50' },
    { name: 'Pan-India Festivals', key: 'pan_india_festivals', color: 'text-amber-600 bg-amber-50' },
    { name: 'Regional Festivals', key: 'regional_festivals', color: 'text-indigo-600 bg-indigo-50' },
    { name: 'Observances', key: 'observances', color: 'text-emerald-600 bg-emerald-50' }
];

const initialCampaigns = [
    {
        id: 1,
        title: 'Monthly Birthday Wish',
        trigger: 'Birthday (Current Month)',
        message: 'Happy Birthday! Here is a ₹5000 gift voucher for you.',
        target: 'All Customers',
        schedule: '1st of every month',
        status: 'Active',
        icon: Sparkles,
        category: 'Personalized',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-100'
    },
    {
        id: 2,
        title: 'Hyderabad Celebration',
        trigger: 'Location (Hyderabad)',
        message: 'Special offer for our Hyderabad family! Visit us today.',
        target: 'Hyderabad Customers',
        schedule: 'Instant',
        status: 'Active',
        icon: MapPin,
        category: 'Regional',
        color: 'bg-orange-50 text-orange-700 border-orange-100'
    }
];

export default function EventsPage() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'notifications' | 'library' | 'calendar'>('notifications');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState<any[]>(initialCampaigns);
    const [selectedLibraryItem, setSelectedLibraryItem] = useState<any>(null);
    const [config, setConfig] = useState({
        title: '',
        type: 'Holiday',
        subType: 'Today',
        message: '',
        schedule: 'Daily at 9:00 AM',
        leadTime: 0,
    });

    const handleCreate = () => {
        if (!config.title || !config.message) {
            alert('Please fill in both title and message');
            return;
        }

        const iconMap = {
            'Birthday': Sparkles,
            'Location': MapPin,
            'Purchase': UserCheck,
            'Holiday': Calendar,
            'Anniversary': Sparkles
        };

        const colorMap = {
            'Birthday': 'bg-indigo-50 text-indigo-700 border-indigo-100',
            'Location': 'bg-orange-50 text-orange-700 border-orange-100',
            'Purchase': 'bg-blue-50 text-blue-700 border-blue-100',
            'Holiday': 'bg-emerald-50 text-emerald-700 border-emerald-100',
            'Anniversary': 'bg-rose-50 text-rose-700 border-rose-100'
        };

        const newCamp = {
            id: Date.now(),
            title: config.title,
            trigger: config.leadTime > 0 ? `${config.type} (Starts ${config.leadTime} days before)` : `${config.type} (On Date)`,
            message: config.message,
            target: config.type === 'Location' ? `${config.subType} Customers` : 'All Customers',
            schedule: config.schedule,
            status: 'Active',
            category: selectedLibraryItem?.category || 'Custom',
            icon: iconMap[config.type as keyof typeof iconMap] || Bell,
            color: colorMap[config.type as keyof typeof colorMap] || 'bg-zinc-50 text-zinc-700 border-zinc-100'
        };

        setCampaigns([newCamp, ...campaigns]);
        setIsModalOpen(false);
        setSelectedLibraryItem(null);
        setConfig({ title: '', type: 'Holiday', subType: 'Today', message: '', schedule: 'Daily at 9:00 AM', leadTime: 0 });
        if (activeTab === 'library') setActiveTab('notifications');
    };

    const openEnableDialog = (item: any) => {
        setSelectedLibraryItem(item);
        setConfig({
            ...config,
            title: `${item.name} Campaign`,
            type: 'Holiday',
            message: `Wishing you a very Happy ${item.name}! Celebrate with us.`,
            leadTime: 7 
        });
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col min-h-full bg-zinc-50/50">
            {/* New Automation Sidebar */}
            <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                <SheetContent side="right" className="sm:max-w-md p-0 gap-0 border-l border-zinc-200 flex flex-col bg-white">
                    <SheetHeader className="shrink-0 border-b border-zinc-200 px-6 py-5 text-left space-y-1">
                        <SheetTitle className="text-[17px] font-bold flex items-center gap-2 text-zinc-900">
                            <Sparkles className="h-4.5 w-4.5 text-[#f2d412]" />
                            {selectedLibraryItem ? `Enable ${selectedLibraryItem.name}` : 'New Automation'}
                        </SheetTitle>
                        <SheetDescription className="text-zinc-500 text-xs font-normal">
                            {selectedLibraryItem ? `Configure the campaign for ${selectedLibraryItem.name}` : 'Configure your event trigger and notification message'}
                        </SheetDescription>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Automation Title</label>
                            <input 
                                type="text"
                                className="w-full h-11 bg-white border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f2d412]/50 shadow-sm"
                                value={config.title}
                                onChange={e => setConfig({...config, title: e.target.value})}
                            />
                        </div>

                        {!selectedLibraryItem && (
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Select Trigger Event</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Birthday', 'Location', 'Purchase', 'Holiday'].map((t) => (
                                        <button 
                                            key={t}
                                            onClick={() => setConfig({...config, type: t})}
                                            className={cn(
                                                "p-4 rounded-xl border flex flex-col items-center gap-3 transition-all",
                                                config.type === t ? "border-[#f2d412] bg-[#f2d412]/5 shadow-sm" : "border-zinc-100 bg-zinc-50/50 hover:border-zinc-200 text-zinc-600 hover:bg-zinc-100/50"
                                            )}
                                        >
                                            <div className={cn("h-5 w-5", config.type === t ? "text-[#f2d412]" : "text-zinc-400")}>
                                                {t === 'Birthday' && <Sparkles className="h-full w-full" />}
                                                {t === 'Location' && <MapPin className="h-full w-full" />}
                                                {t === 'Purchase' && <UserCheck className="h-full w-full" />}
                                                {t === 'Holiday' && <Calendar className="h-full w-full" />}
                                            </div>
                                            <span className={cn("text-xs font-bold", config.type === t ? "text-zinc-900" : "text-zinc-500")}>{t}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Campaign Lead Time</label>
                                <div className="relative">
                                    <select 
                                        value={config.leadTime}
                                        onChange={e => setConfig({...config, leadTime: Number(e.target.value)})}
                                        className="w-full h-11 bg-white border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f2d412]/50 appearance-none shadow-sm"
                                    >
                                        <option value={0}>On the event day</option>
                                        <option value={3}>3 days before</option>
                                        <option value={7}>7 days before</option>
                                        <option value={10}>10 days before</option>
                                        <option value={15}>15 days before</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                                </div>
                                <p className="text-[10px] text-zinc-400 font-medium italic">Early start helps in building engagement before the actual holiday.</p>
                            </div>
                        </div>

                        <div className="space-y-2 pb-6">
                            <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Notification Message</label>
                            <textarea 
                                className="w-full h-32 bg-white border border-zinc-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f2d412]/50 resize-none italic shadow-sm"
                                placeholder="Enter the message customers will receive..."
                                value={config.message}
                                onChange={e => setConfig({...config, message: e.target.value})}
                            />
                        </div>
                    </div>

                    <SheetFooter className="shrink-0 bg-zinc-50 px-6 py-4 border-t border-zinc-200 mt-0">
                       <div className="flex w-full gap-3">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 h-11 text-sm font-bold text-zinc-600 rounded-full">Cancel</Button>
                            <Button className="flex-1 h-11 bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 font-bold rounded-full shadow-md" onClick={handleCreate}>
                                {selectedLibraryItem ? 'Enable Event' : 'Activate Event'}
                            </Button>
                       </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Topbar */}
            <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-900 leading-tight">Events & Notifications</h1>
                        <p className="text-xs text-zinc-500">Automate customer engagement and holiday wishes</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsModalOpen(true)} className="h-9 bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 font-bold text-xs px-5 rounded-full shadow-md gap-2">
                        <Plus className="h-4 w-4" /> New Automation
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 bg-white px-6">
                <button onClick={() => setActiveTab('notifications')} className={cn("py-3 text-[13px] font-bold transition-colors mr-6 border-b-2", activeTab === 'notifications' ? "text-zinc-900 border-zinc-900" : "text-zinc-400 border-transparent hover:text-zinc-600")}>
                    Your Automations ({campaigns.length})
                </button>
                <button onClick={() => setActiveTab('library')} className={cn("py-3 text-[13px] font-bold transition-colors mr-6 border-b-2", activeTab === 'library' ? "text-zinc-900 border-zinc-900" : "text-zinc-400 border-transparent hover:text-zinc-600")}>
                    Event Library <span className="ml-1.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px]">Everything is available</span>
                </button>
                <button onClick={() => setActiveTab('calendar')} className={cn("py-3 text-[13px] font-bold transition-colors border-b-2", activeTab === 'calendar' ? "text-zinc-900 border-zinc-900" : "text-zinc-400 border-transparent hover:text-zinc-600")}>
                    Holiday Calendar
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search events..."
                            className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300"
                        />
                    </div>
                </div>

                {activeTab === 'notifications' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.filter(c => c.title.toLowerCase().includes(search.toLowerCase())).map((camp, i) => (
                            <div key={i} className="group relative rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md transition-all border-l-4" style={{borderLeftColor: camp.color.split(' ')[1].replace('text-', '')}}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn("p-2 rounded-lg", camp.color)}>
                                        <camp.icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 uppercase">{camp.category}</span>
                                </div>
                                <h3 className="text-sm font-bold text-zinc-900 mb-1">{camp.title}</h3>
                                <p className="text-[11px] text-zinc-500 font-medium mb-3">{camp.trigger}</p>
                                <div className="bg-zinc-50 rounded-lg p-3 mb-4">
                                    <p className="text-xs text-zinc-600 italic line-clamp-2">"{camp.message}"</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                        <span className="text-[11px] text-zinc-500 font-medium">{camp.schedule}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-1.5 text-zinc-400 hover:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button className="p-1.5 text-zinc-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setCampaigns(campaigns.filter(c => c.id !== camp.id))}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white/50 p-6 hover:bg-zinc-50 hover:border-zinc-300 transition-all min-h-[200px]" onClick={() => setIsModalOpen(true)}>
                            <Plus className="h-5 w-5 text-zinc-400 mb-2" />
                            <span className="text-sm font-bold text-zinc-900">New Custom Automation</span>
                        </button>
                    </div>
                )}

                {activeTab === 'library' && (
                    <div className="space-y-8">
                        {holidayCategories.map(cat => {
                            let items: any[] = [];
                            if (cat.key === 'regional_festivals') {
                                items = Object.values(INDIAN_HOLIDAYS_DATA.regional_festivals).flat();
                            } else if (cat.key === 'national_holidays' || cat.key === 'pan_india_festivals' || cat.key === 'observances') {
                                items = INDIAN_HOLIDAYS_DATA[cat.key as keyof typeof INDIAN_HOLIDAYS_DATA] as any[];
                            }

                            return (
                                <div key={cat.name} className="space-y-4">
                                    <h2 className={cn("text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded w-fit", cat.color)}>{cat.name}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {items.map((item: any) => (
                                            <div key={item.name} className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-300 transition-colors shadow-sm">
                                                <div>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h3 className="text-sm font-bold text-zinc-900">{item.name}</h3>
                                                        <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded font-bold uppercase">
                                                            {item.state ? item.state[0] : 'Pan-India'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 leading-relaxed mb-4">{item.description || `Celebrate ${item.name} with your customers.`}</p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-zinc-400">
                                                        {item.date || item.month || (item.months && item.months[0]) || 'Upcoming'}
                                                    </span>
                                                    <Button size="sm" className="h-8 rounded-full bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 text-[11px] font-bold px-4 transition-all shadow-sm" onClick={() => openEnableDialog(item)}>
                                                        Enable Event
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'calendar' && (
                    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center px-6">
                            <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-widest">Upcoming Event Dates</h3>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-rose-500" /> <span className="text-[10px] font-bold text-zinc-500 uppercase">HIGH PRIORITY</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" /> <span className="text-[10px] font-bold text-zinc-500 uppercase">ACTIVE</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 divide-y divide-zinc-100">
                            {[
                                ...INDIAN_HOLIDAYS_DATA.national_holidays,
                                ...INDIAN_HOLIDAYS_DATA.pan_india_festivals,
                                ...Object.values(INDIAN_HOLIDAYS_DATA.regional_festivals).flat(),
                                ...INDIAN_HOLIDAYS_DATA.observances
                            ].map((item: any, i: number) => {
                                const isEnabled = campaigns.some(c => c.title.includes(item.name));
                                return (
                                    <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors px-6">
                                        <div className="flex items-center gap-6">
                                            <div className={cn("flex flex-col items-center justify-center w-12 h-12 rounded-xl border shrink-0 transition-all", 
                                                isEnabled ? "bg-emerald-50 border-emerald-200 shadow-sm" : "bg-zinc-50 border-zinc-100")}>
                                                <span className={cn("text-[10px] font-bold uppercase", isEnabled ? "text-emerald-700" : "text-zinc-500")}>
                                                    {item.date?.split(' ')[1]?.slice(0,3) || item.month?.slice(0,3) || (item.months && item.months[0]?.slice(0,3)) || 'JAN'}
                                                </span>
                                                <span className={cn("text-lg font-black leading-none", isEnabled ? "text-emerald-600" : "text-zinc-900")}>
                                                    {item.date?.split(' ')[0] || '10'}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-zinc-900">{item.name}</h4>
                                                <p className="text-[11px] text-zinc-500">{item.state ? item.state.join(', ') : 'All India'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {isEnabled ? (
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[10px] font-bold text-emerald-700 uppercase italic">Campaign Live</span>
                                                </div>
                                            ) : (
                                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Available in Library</span>
                                            )}
                                            <Button size="sm" className="h-8 text-[11px] px-4 font-bold bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 border-none rounded-full shadow-sm" onClick={() => isEnabled ? setActiveTab('notifications') : openEnableDialog(item)}>
                                                {isEnabled ? 'Manage' : 'Quick Enable'}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
