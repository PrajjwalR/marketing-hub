import { supabaseAdmin } from '@/lib/supabase';
import { INDIAN_HOLIDAYS_DATA } from '@/lib/indian-holidays';
import { NextRequest, NextResponse } from 'next/server';
import { format, addDays } from 'date-fns';

export async function GET(req: NextRequest) {
    // This route would be called by a CRON job (e.g., Vercel Cron or GitHub Actions)
    const today = new Date();
    const todayStr = format(today, 'dd MMMM'); // "26 January"
    const todayMonthStr = format(today, 'MMMM');

    try {
        // 1. Fetch all Active Automations
        const { data: automations, error: autoError } = await supabaseAdmin
            .from('crm_automations')
            .select('*')
            .eq('status', 'Active');

        if (autoError) throw autoError;

        // 2. Fetch all Active Contacts
        const { data: contacts, error: contactError } = await supabaseAdmin
            .from('contacts')
            .select('*')
            .eq('status', 'Active');

        if (contactError) throw contactError;

        let triggeredCount = 0;

        for (const automation of automations) {
            // --- LOGIC A: BIRTHDAYS ---
            if (automation.trigger_type === 'Birthday') {
                const birthdayContacts = contacts.filter(c => {
                    if (!c.birthday) return false;
                    const bDay = new Date(c.birthday);
                    return bDay.getMonth() === today.getMonth() && bDay.getDate() === today.getDate();
                });

                for (const contact of birthdayContacts) {
                    console.log(`[TRIGGER] Birthday wish for ${contact.name}: ${automation.message}`);
                    // Here we would call the WhatsApp/Email provider API
                    triggeredCount++;
                }
            }

            // --- LOGIC B: HOLIDAYS WITH LEAD TIME ---
            if (automation.trigger_type === 'Holiday') {
                // Check if today matches the event date minus the lead time
                // We'll check the holiday library for the event name
                const targetDay = addDays(today, automation.lead_time_days);
                const targetDayStr = format(targetDay, 'd MMMM'); // e.g. "26 January"
                
                // Flatten library to search
                const allHolidays = [
                    ...INDIAN_HOLIDAYS_DATA.national_holidays,
                    ...INDIAN_HOLIDAYS_DATA.pan_india_festivals,
                    ...Object.values(INDIAN_HOLIDAYS_DATA.regional_festivals).flat(),
                    ...INDIAN_HOLIDAYS_DATA.observances
                ];

                const matchingHoliday = allHolidays.find(h => 
                    h.name === automation.event_name && 
                    (h.date === targetDayStr || (h.month === todayMonthStr && automation.lead_time_days === 0))
                );

                if (matchingHoliday) {
                    console.log(`[TRIGGER] Holiday Campaign for ${matchingHoliday.name} starting ${automation.lead_time_days} days early.`);
                    // Logic to send to all contacts or specific regional contacts
                    triggeredCount += contacts.length;
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Recurring check completed. ${triggeredCount} notifications triggered.`,
            check_time: new Date().toISOString()
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
