'use client';

import { Button } from "@/components/ui/button";
import { Search, Sparkles, ChevronDown, Bell, Calendar, MapPin, UserCheck, Plus, Trash2, Ghost, Clock, Info, Edit2, TrendingUp, Dumbbell, Gem, ShoppingBag, CheckCircle2, Building2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";

import { INDIAN_HOLIDAYS_DATA } from "@/lib/indian-holidays";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

const NICHE_IMPORTANCE = {
    "ecommerce": ["Diwali", "Dussehra (Vijayadashami)", "Navratri", "Christmas", "Eid ul-Fitr", "Eid ul-Adha (Bakrid)", "Raksha Bandhan", "Karva Chauth", "Onam", "Baisakhi", "Durga Puja", "Pongal", "Makar Sankranti", "Valentine's Day", "New Year"],
    "gym": ["New Year", "Makar Sankranti", "Maha Shivaratri", "Ramadan", "Navratri", "International Yoga Day"],
    "jewellery": ["Akshaya Tritiya", "Dhanteras", "Diwali", "Karva Chauth", "Navratri", "Durga Puja", "Gudi Padwa", "Ugadi", "Onam", "Makar Sankranti", "Baisakhi", "Wedding Season (General)"]
};

// RENAMED: Standardized personal labels instead of "E-commerce Priority"
const NICHE_CONFIG: Record<string, { label: string, Icon: any, color: string }> = {
    "ecommerce": { label: "Strategically Important for You", Icon: ShoppingBag, color: "bg-purple-50 text-purple-600 border-purple-200" },
    "jewellery": { label: "Strategically Important for You", Icon: Gem, color: "bg-amber-50 text-amber-600 border-amber-200" },
    "gym": { label: "Strategically Important for You", Icon: Dumbbell, color: "bg-indigo-50 text-indigo-600 border-indigo-200" }
};

const holidayCategories = [
    { name: 'National Holidays', key: 'national_holidays', color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { name: 'Pan-India Festivals', key: 'pan_india_festivals', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { name: 'Regional Festivals', key: 'regional_festivals', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { name: 'Observances', key: 'observances', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const getDaysRemaining = (dateStr: string) => {
    if (!dateStr || dateStr === 'Annual') return null;
    const cleanStr = dateStr.split('-')[0].trim();
    const parts = cleanStr.split(' ');
    let day = 1; let monthName = '';
    if (parts.length >= 2) { day = parseInt(parts[0]) || 1; monthName = parts[1]; } else { monthName = parts[0]; }
    const monthIndex = MONTHS.findIndex(m => m.toLowerCase().includes(monthName.toLowerCase()));
    if (monthIndex === -1) return null;
    const today = new Date(2026, 3, 4); // April 4, 2026
    let eventDate = new Date(2026, monthIndex, day);
    if (eventDate < today) eventDate = new Date(2027, monthIndex, day);
    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function EventsPage() {
    const { user } = useAuth();
    const [userVertical, setUserVertical] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'notifications' | 'library' | 'calendar'>('notifications');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLibraryItem, setSelectedLibraryItem] = useState<any>(null);
    const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
    
    // Config state
    const [config, setConfig] = useState({ title: '', type: 'Holiday', subType: 'Today', message: '', schedule: 'Daily at 9:00 AM', leadTime: 0, customDate: '', niches: [] as string[] });

    const fetchUserVertical = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('users')
            .select('business_vertical')
            .eq('user_id', user.uid)
            .maybeSingle();
        
        if (!error && data?.business_vertical) {
            setUserVertical(data.business_vertical.toLowerCase());
        } else {
            setUserVertical('ecommerce'); // FALLBACK FOR TEST: set as ecommerce
        }
    };

    const fetchAutomations = async () => {
        try {
            const res = await fetch('/api/crm/automations');
            if (res.ok) {
                const data = await res.json();
                const allHolidays = [...INDIAN_HOLIDAYS_DATA.national_holidays, ...INDIAN_HOLIDAYS_DATA.pan_india_festivals, ...Object.values(INDIAN_HOLIDAYS_DATA.regional_festivals).flat(), ...INDIAN_HOLIDAYS_DATA.observances];
                setCampaigns(data.map((d: any) => {
                    const match = allHolidays.find(h => h.name === d.event_name);
                    const eventDate = match ? (match.date || match.month || (match.months && match.months[0])) : (d.custom_date || null);
                    let niches: string[] = [];
                    try { if (d.category?.startsWith('[')) niches = JSON.parse(d.category); } catch (e) {}
                    return { ...d, trigger: d.lead_time_days > 0 ? `${d.trigger_type} (Starts ${d.lead_time_days} days before)` : `${d.trigger_type} (On Date)`, displayDate: eventDate, niches: niches };
                }));
            }
        } finally { setIsLoading(false); }
    };

    useEffect(() => { if (user) { fetchUserVertical(); fetchAutomations(); } }, [user]);

    const handleCreateOrUpdate = async () => {
        if (!config.title || !config.message) { alert('Please fill in both title and message'); return; }
        const payload = { title: config.title, event_name: selectedLibraryItem?.name || config.title, trigger_type: config.type, lead_time_days: config.leadTime, message: config.message, category: JSON.stringify(config.niches), status: 'Active' };
        const method = editingCampaignId ? 'PUT' : 'POST';
        const url = editingCampaignId ? `/api/crm/automations?id=${editingCampaignId}` : '/api/crm/automations';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) { fetchAutomations(); closeSheet(); }
    };

    const openSheet = (item: any, isEdit = false) => {
        const eventName = item?.name || item?.event_name || '';
        const activeCamp = campaigns.find(c => c.event_name === eventName);
        const isActuallyImportant = userVertical && NICHE_IMPORTANCE[userVertical as keyof typeof NICHE_IMPORTANCE]?.some(n => eventName.includes(n));
        const defaultNiches = activeCamp ? activeCamp.niches : (isActuallyImportant && userVertical ? [userVertical] : []);

        if (isEdit) {
            setEditingCampaignId(activeCamp?.id || null); 
            setSelectedLibraryItem(item); 
            setConfig({ title: activeCamp?.title || `${eventName} Campaign`, type: activeCamp?.trigger_type || 'Holiday', subType: 'Today', message: activeCamp?.message || `Wishing you a Happy ${eventName}!`, schedule: 'Daily at 9:00 AM', leadTime: activeCamp?.lead_time_days || 7, customDate: item.date || item.month || (item.months && item.months[0]) || '', niches: defaultNiches }); 
            setIsModalOpen(true);
        } else {
            setSelectedLibraryItem(null); setEditingCampaignId(null);
            setConfig({ title: '', type: 'Holiday', subType: 'Today', message: '', schedule: 'Daily at 9:00 AM', leadTime: 0, customDate: '', niches: [] }); setIsModalOpen(true);
        }
    };

    const closeSheet = () => { setIsModalOpen(false); setEditingCampaignId(null); setSelectedLibraryItem(null); setConfig({ title: '', type: 'Holiday', subType: 'Today', message: '', schedule: 'Daily at 9:00 AM', leadTime: 0, customDate: '', niches: [] }); };

    const toggleNiche = (niche: string) => { setConfig(prev => ({ ...prev, niches: prev.niches.includes(niche) ? [] : [niche] })); };

    const handleDelete = async (id: string) => { if (!id || id.startsWith('temp-')) return; setCampaigns(prev => prev.filter(c => c.id !== id)); const res = await fetch(`/api/crm/automations?id=${id}`, { method: 'DELETE' }); if (res.ok) fetchAutomations(); };

    const onToggle = async (item: any, checked: boolean) => {
        if (checked) {
            const eventName = item.name;
            const isActuallyImportant = userVertical && NICHE_IMPORTANCE[userVertical as keyof typeof NICHE_IMPORTANCE]?.some(n => eventName.includes(n));
            const niches = isActuallyImportant && userVertical ? [userVertical] : [];
            const payload = { title: `${item.name} Campaign`, event_name: item.name, trigger_type: 'Holiday', lead_time_days: 7, message: `Wishing you a very Happy ${item.name}! Celebrate with us.`, category: JSON.stringify(niches), status: 'Active' };
            setCampaigns(prev => [...prev, { ...payload, id: 'temp-' + Date.now(), niches }]);
            const res = await fetch('/api/crm/automations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (res.ok) fetchAutomations();
        } else { const camp = campaigns.find(c => c.event_name === item.name); if (camp) handleDelete(camp.id); }
    };

    const filterList = (list: any[]) => {
        if (!search) return list;
        const s = search.toLowerCase();
        return list.filter(item => item.name?.toLowerCase().includes(s) || item.title?.toLowerCase().includes(s) || item.date?.toLowerCase().includes(s) || item.month?.toLowerCase().includes(s) || (item.months && item.months.some((m: string) => m.toLowerCase().includes(s))));
    };

    const UnifiedCard = ({ item, isAutomation = false }: { item: any, isAutomation?: boolean }) => {
        const activeCamp = campaigns.find(c => c.event_name === (item.event_name || item.name));
        const isEnabled = !!activeCamp;
        const displayDate = item.displayDate || item.date || item.month || (item.months && item.months[0]) || 'Annual';
        const daysRemaining = getDaysRemaining(displayDate);
        const eventName = item.event_name || item.name;

        // VISIBILITY LOGIC: Proactive suggestion + manual selection sync
        const isNaturallyImportant = userVertical && NICHE_IMPORTANCE[userVertical as keyof typeof NICHE_IMPORTANCE]?.some(n => eventName.includes(n));
        const isManuallyImportant = activeCamp?.niches?.includes(userVertical);
        const shouldShowBadge = isManuallyImportant || (isNaturallyImportant && (!activeCamp || activeCamp.niches?.includes(userVertical)));

        const myConfig = userVertical ? NICHE_CONFIG[userVertical] : null;
        const MyIcon = myConfig?.Icon;

        return (
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col justify-between hover:border-[#f2d412]/50 hover:shadow-xl hover:shadow-[#f2d412]/5 transition-all duration-300 relative group border-b-4 uppercase tracking-tight">
                <div>
                   <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1.5">
                            <h3 className="text-sm font-black text-zinc-900 tracking-tight leading-none uppercase pr-8 overflow-hidden">{item.title || item.name}</h3>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {shouldShowBadge && myConfig && MyIcon && (
                                    <span className={cn("flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded-md border uppercase tracking-tighter shadow-sm", myConfig.color)}>
                                        <MyIcon className="h-2 w-2" /> {myConfig.label}
                                    </span>
                                )}
                            </div>
                        </div>
                        {isEnabled && <div className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-100 italic">Sync Active</div>}
                    </div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 uppercase tracking-widest w-fit">{displayDate}</span>
                        {daysRemaining !== null ? (
                            <div className="flex items-center gap-1.5 pl-1 text-zinc-400 font-bold"><Clock className="h-3 w-3" /><span className={cn("text-[9px] uppercase", daysRemaining <= 7 ? "text-rose-500 animate-pulse font-black" : "")}>{daysRemaining} Days Left</span></div>
                        ) : (
                             <div className="flex items-center gap-1.5 pl-1 text-zinc-300 font-bold"><Clock className="h-3 w-3" /><span className="text-[8px] opacity-50 uppercase tracking-tighter">Recurring</span></div>
                        )}
                    </div>
                    <div className="flex items-center gap-4 pl-2">
                        <div className="flex flex-col items-end text-right"><span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-1.5">Enable</span><Switch checked={isEnabled} onCheckedChange={() => onToggle(isAutomation ? { ...item, name: item.event_name } : item, !isEnabled)} className="data-[state=checked]:bg-[#f2d412] scale-90" /></div>
                        <div className="flex gap-2">
                            <button onClick={() => openSheet(item, true)} className={cn("h-10 w-10 flex items-center justify-center rounded-2xl bg-zinc-50 transition-all", isEnabled ? "text-zinc-900 shadow-sm border border-zinc-100" : "text-zinc-200 opacity-50")} disabled={!isEnabled}><Edit2 className="h-4 w-4" /></button>
                            {isAutomation && (<button onClick={() => handleDelete(item.id)} className="h-10 w-10 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>)}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const groupedByMonth = useMemo(() => {
        const all = [...INDIAN_HOLIDAYS_DATA.national_holidays, ...INDIAN_HOLIDAYS_DATA.pan_india_festivals, ...Object.values(INDIAN_HOLIDAYS_DATA.regional_festivals).flat(), ...INDIAN_HOLIDAYS_DATA.observances];
        const filtered = filterList(all);
        const result: Record<string, any[]> = {}; MONTHS.forEach(m => result[m] = []);
        filtered.forEach(h => {
             const dateStr = h.date || h.month || (h.months && h.months[0]) || '';
             const foundMonth = MONTHS.find(m => dateStr.toLowerCase().includes(m.toLowerCase()));
             if (foundMonth) result[foundMonth].push(h);
        });
        return result;
    }, [search]);

    const myCurrentConfig = userVertical ? NICHE_CONFIG[userVertical] : null;
    const CurrentVerticalIcon = myCurrentConfig?.Icon;

    return (
        <div className="flex flex-col min-h-full bg-zinc-50/50">
            <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                <SheetContent side="right" className="sm:max-w-md p-0 flex flex-col bg-white">
                    <SheetHeader className="p-6 border-b border-zinc-200 text-left">
                        <SheetTitle className="text-lg font-black flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#f2d412]" />Settings: Customized Focus</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-6 space-y-10">
                        {userVertical && myCurrentConfig && (
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Industry Importance</label>
                                <button onClick={() => toggleNiche(userVertical)} className={cn("flex items-center gap-4 p-5 rounded-3xl border-2 transition-all text-left w-full", config.niches.includes(userVertical) ? myCurrentConfig.color + " border-current shadow-lg shadow-current/10" : "bg-white border-zinc-100 text-zinc-300")}>
                                    <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white/50"><CurrentVerticalIcon className="h-5 w-5" /></div>
                                    <div className="flex-1 text-[11px] font-black uppercase tracking-widest">Mark as: Strategically Important for You</div>
                                    {config.niches.includes(userVertical) && <CheckCircle2 className="h-5 w-5" />}
                                </button>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase leading-relaxed">This event is highly relevant for your domain. Toggling this will highlight the strategic value on your dashboard.</p>
                            </div>
                        )}
                        <div className="space-y-2"><label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Campaign Label</label><input type="text" className="w-full h-11 border border-zinc-200 rounded-xl px-4 text-sm font-medium" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Automation Message</label><textarea className="w-full h-40 border border-zinc-200 rounded-xl p-4 text-sm font-medium focus:ring-0 italic" value={config.message} onChange={e => setConfig({...config, message: e.target.value})} /></div>
                    </div>
                    <SheetFooter className="p-6 bg-zinc-50 border-t border-zinc-200">
                        <Button className="w-full h-11 bg-[#f2d412] text-zinc-900 font-bold rounded-full shadow-lg" onClick={handleCreateOrUpdate}>Update Strategy</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 shadow-sm z-10 font-bold">
                <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center"><Bell className="h-5 w-5 text-orange-600" /></div><div><h1 className="text-lg font-black text-zinc-900 tracking-tight leading-none mb-1 uppercase">CRM Campaigns</h1><p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest leading-none">Automated Roadmap Intelligence</p></div></div>
                <div className="flex items-center gap-4 flex-1 max-w-xl mx-8 relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" /><input type="text" placeholder="Search events..." className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-full pl-11 shadow-inner text-[13px] font-bold" value={search} onChange={e => setSearch(e.target.value)} /></div>
                <Button onClick={() => openSheet({name: 'New Event'}, false)} className="h-10 bg-[#f2d412] text-zinc-900 font-bold px-6 rounded-full shadow-lg gap-2 active:scale-95 border-b-2 border-orange-200 uppercase tracking-widest"><Plus className="h-4 w-4" /> Custom</Button>
            </div>

            <div className="flex border-b border-zinc-200 bg-white px-6 space-x-12 uppercase">
                {['notifications', 'library', 'calendar'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)} className={cn("py-4 text-[13px] font-black transition-all border-b-2 tracking-widest", activeTab === tab ? "text-zinc-900 border-[#f2d412]" : "text-zinc-400 border-transparent hover:text-zinc-600")}>{tab === 'notifications' ? `Automations (${campaigns.length})` : tab.replace('_', ' ')}</button>
                ))}
            </div>

            <div className="flex-1 p-8 overflow-y-auto font-medium">
                {activeTab === 'notifications' ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{isLoading ? (<div className="col-span-full py-20 text-center text-zinc-400 font-black italic uppercase">Synchronizing Roadmap...</div>) : filterList(campaigns).length === 0 ? (<div className="col-span-full py-40 text-center opacity-30"><Ghost className="h-16 w-16 mx-auto mb-4" /><p className="text-sm font-black uppercase tracking-widest">No Active Workflows</p></div>) : filterList(campaigns).map((camp, i) => (<UnifiedCard key={i} item={camp} isAutomation />))}</div>
                ) : activeTab === 'library' ? (
                   <div className="space-y-16 pb-12 uppercase">{holidayCategories.map(cat => {
                       const items = filterList(cat.key === 'regional_festivals' ? Object.values(INDIAN_HOLIDAYS_DATA.regional_festivals).flat() : INDIAN_HOLIDAYS_DATA[cat.key as keyof typeof INDIAN_HOLIDAYS_DATA] as any[]);
                       if (items.length === 0) return null;
                       return (<div key={cat.name} className="space-y-8"><div className="flex items-center gap-4"><div className={cn("h-4 w-1.5 rounded-full shadow-sm", cat.color.split(' ')[1])} /><h2 className={cn("text-[13px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-xl border-b-2 shadow-sm", cat.color)}>{cat.name}</h2></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{items.map((item: any, i) => <UnifiedCard key={i} item={item} />)}</div></div>);
                   })}</div>
                ) : (
                   <div className="space-y-16 pb-12 uppercase">{MONTHS.map(m => {
                       const items = groupedByMonth[m] || [];
                       if (items.length === 0) return null;
                       return (<div key={m} className="space-y-8"><div className="flex items-center gap-6"><h2 className="text-[18px] font-black text-zinc-900 tracking-tighter uppercase px-2">{m}</h2><div className="h-[1px] flex-1 bg-zinc-200/60" /></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{items.map((item: any, i) => <UnifiedCard key={i} item={item} />)}</div></div>);
                   })}</div>
                )}
            </div>
        </div>
    );
}
