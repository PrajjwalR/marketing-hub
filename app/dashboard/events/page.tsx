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

const holidayEvents = [
    { date: 'Jan 1', name: 'New Year 2026', status: 'Scheduled', type: 'Holiday' },
    { date: 'Jan 14', name: 'Makar Sankranti', status: 'Scheduled', type: 'Holiday' },
    { date: 'Mar 14', name: 'Holi Festival', status: 'Draft', type: 'Holiday' },
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
        color: 'bg-purple-50 text-purple-700 border-purple-100'
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
        color: 'bg-orange-50 text-orange-700 border-orange-100'
    },
    {
        id: 3,
        title: 'Recent Buyer Follow-up',
        trigger: 'Purchase (Last 30 Days)',
        message: 'Thanks for your purchase! Hope you are enjoying it.',
        target: 'Recent Buyers',
        schedule: 'Daily at 9:00 AM',
        status: 'Paused',
        icon: UserCheck,
        color: 'bg-blue-50 text-blue-700 border-blue-100'
    }
];

export default function EventsPage() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'notifications' | 'calendar'>('notifications');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState(initialCampaigns);
    const [config, setConfig] = useState({
        title: '',
        type: 'Birthday',
        subType: 'Current Month',
        message: '',
        schedule: '1st of every month'
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
            'Holiday': Calendar
        };

        const colorMap = {
            'Birthday': 'bg-purple-50 text-purple-700 border-purple-100',
            'Location': 'bg-orange-50 text-orange-700 border-orange-100',
            'Purchase': 'bg-blue-50 text-blue-700 border-blue-100',
            'Holiday': 'bg-emerald-50 text-emerald-700 border-emerald-100'
        };

        const newCamp = {
            id: Date.now(),
            title: config.title,
            trigger: `${config.type} (${config.subType})`,
            message: config.message,
            target: config.type === 'Location' ? `${config.subType} Customers` : 'All Customers',
            schedule: config.schedule,
            status: 'Active',
            icon: iconMap[config.type as keyof typeof iconMap] || Bell,
            color: colorMap[config.type as keyof typeof colorMap] || 'bg-zinc-50 text-zinc-700 border-zinc-100'
        };

        setCampaigns([newCamp, ...campaigns]);
        setIsModalOpen(false);
        setConfig({ title: '', type: 'Birthday', subType: 'Current Month', message: '', schedule: '1st of every month' });
    };

    return (
        <div className="flex flex-col min-h-full bg-zinc-50/50">
            {/* New Automation Sidebar */}
            <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                <SheetContent side="right" className="sm:max-w-md p-0 gap-0 border-l border-zinc-200 flex flex-col bg-white">
                    <SheetHeader className="shrink-0 border-b border-zinc-200 px-6 py-5 text-left space-y-1">
                        <SheetTitle className="text-[17px] font-bold flex items-center gap-2 text-zinc-900">
                            <Sparkles className="h-4.5 w-4.5 text-[#f2d412]" />
                            New Automation
                        </SheetTitle>
                        <SheetDescription className="text-zinc-500 text-xs font-normal">
                            Configure your event trigger and notification message
                        </SheetDescription>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Title Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Automation Title</label>
                            <input 
                                type="text"
                                placeholder="e.g. Monthly Birthday Voucher"
                                className="w-full h-11 bg-white border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f2d412]/50 shadow-sm"
                                value={config.title}
                                onChange={e => setConfig({...config, title: e.target.value})}
                            />
                        </div>

                        {/* Trigger Type Selection */}
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

                        {/* Dropdowns */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Event Details</label>
                                <div className="relative">
                                    <select 
                                        value={config.subType}
                                        onChange={e => setConfig({...config, subType: e.target.value})}
                                        className="w-full h-11 bg-white border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f2d412]/50 appearance-none shadow-sm"
                                    >
                                        {config.type === 'Birthday' && ['Today', 'Current Week', 'Current Month'].map(o => <option key={o}>{o}</option>)}
                                        {config.type === 'Location' && ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi'].map(o => <option key={o}>{o}</option>)}
                                        {config.type === 'Purchase' && ['Recent Buyers (30d)', 'Repeat Buyers', 'Inactive Customers'].map(o => <option key={o}>{o}</option>)}
                                        {config.type === 'Holiday' && ['New Year', 'Holi', 'Diwali', 'Independence Day'].map(o => <option key={o}>{o}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Scheduling</label>
                                <div className="relative">
                                    <select 
                                        value={config.schedule}
                                        onChange={e => setConfig({...config, schedule: e.target.value})}
                                        className="w-full h-11 bg-white border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f2d412]/50 appearance-none shadow-sm"
                                    >
                                        <option>Instant</option>
                                        <option>Daily at 9:00 AM</option>
                                        <option>Weekly on Mondays</option>
                                        <option>1st of every month</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Message Area */}
                        <div className="space-y-2 pb-6">
                            <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Notification Message</label>
                            <textarea 
                                className="w-full h-32 bg-white border border-zinc-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f2d412]/50 resize-none italic shadow-sm"
                                placeholder="Enter the message customers will receive..."
                                value={config.message}
                                onChange={e => setConfig({...config, message: e.target.value})}
                            />
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest opacity-60">Supports {`{name}`} variable</span>
                                <span className={cn("text-[10px] font-bold", config.message.length > 250 ? "text-rose-500" : "text-zinc-400")}>
                                    {config.message.length}/280
                                </span>
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="shrink-0 bg-zinc-50 px-6 py-4 border-t border-zinc-200 mt-0">
                       <div className="flex w-full gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsModalOpen(false)} 
                                className="flex-1 h-11 text-sm font-bold text-zinc-600 border-zinc-200 px-6 rounded-full"
                            >
                                Cancel
                            </Button>
                            <Button 
                                className="flex-1 h-11 bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 font-bold text-sm px-6 rounded-full shadow-md transition-all"
                                onClick={handleCreate}
                            >
                                Activate Event
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
                    <Button variant="outline" className="h-9 px-4 text-xs font-medium gap-2 border-zinc-200 hover:bg-zinc-50">
                        <Settings className="h-3.5 w-3.5" />
                        Settings
                    </Button>
                    <Button 
                        onClick={() => setIsModalOpen(true)}
                        className="h-9 bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 font-bold text-xs px-5 rounded-full shadow-md gap-2 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        New Automation
                    </Button>
                </div>
            </div>

            {/* Sub Nav */}
            <div className="flex border-b border-zinc-200 bg-white px-6">
                <button 
                    onClick={() => setActiveTab('notifications')}
                    className={cn(
                        "py-3 text-[13px] font-bold transition-colors mr-6 border-b-2",
                        activeTab === 'notifications' ? "text-zinc-900 border-zinc-900" : "text-zinc-400 border-transparent hover:text-zinc-600"
                    )}
                >
                    Customer Notifications
                </button>
                <button 
                    onClick={() => setActiveTab('calendar')}
                    className={cn(
                        "py-3 text-[13px] font-bold transition-colors border-b-2",
                        activeTab === 'calendar' ? "text-zinc-900 border-zinc-900" : "text-zinc-400 border-transparent hover:text-zinc-600"
                    )}
                >
                    Holiday Calendar
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <div className="flex items-center justify-between">
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
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 font-medium tracking-wide uppercase px-2">Sort by:</span>
                        <Button variant="ghost" className="h-8 text-xs font-bold text-zinc-600 gap-1.5 px-2">
                            Recent <ChevronDown className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {activeTab === 'notifications' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.map((camp, i) => (
                            <div key={i} className="group relative rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md transition-all border-l-4" style={{borderLeftColor: camp.color.split(' ')[1].replace('text-', '')}}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn("p-2 rounded-lg", camp.color)}>
                                        <camp.icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                            camp.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                                        )}>
                                            {camp.status}
                                        </span>
                                    </div>
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
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-50">
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-md hover:bg-rose-50">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add New Card (Empty State Placeholder) */}
                        <button className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white/50 p-6 hover:bg-zinc-50 hover:border-zinc-300 transition-all min-h-[220px]">
                            <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                                <Plus className="h-5 w-5 text-zinc-400" />
                            </div>
                            <span className="text-sm font-bold text-zinc-900">Create new automation</span>
                            <p className="text-[11px] text-zinc-400 mt-1 max-w-[150px] text-center">Set up a birthay or location based trigger</p>
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                        <div className="grid grid-cols-1 divide-y divide-zinc-100">
                            {holidayEvents.map((event, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors px-6">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 shrink-0">
                                            <span className="text-[10px] font-bold text-orange-600 uppercase leading-none mb-0.5">
                                                {event.date.split(' ')[0]}
                                            </span>
                                            <span className="text-sm font-black text-orange-700 leading-none">
                                                {event.date.split(' ')[1]}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-zinc-900">{event.name}</h4>
                                            <p className="text-[11px] text-zinc-500">Universal Calendar Event</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                            event.status === 'Scheduled' ? "bg-orange-50 text-orange-600" : "bg-zinc-100 text-zinc-500"
                                        )}>
                                            {event.status}
                                        </span>
                                        <Button variant="outline" className="h-8 text-xs px-3 font-bold border-zinc-200">
                                            Manage Message
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-zinc-50/50 p-4 border-t border-zinc-100 text-center">
                            <p className="text-[11px] text-zinc-500 font-medium mb-2">Want to add custom company-wide holidays?</p>
                            <Button variant="ghost" className="h-7 text-[11px] font-bold text-zinc-600 hover:bg-zinc-100 px-3">
                                Import more events <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

