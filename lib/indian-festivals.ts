export const INDIAN_FESTIVALS_2026 = [
    { id: 'fest-1', title: 'Makar Sankranti', date: '2026-01-14', description: 'Harvest festival – Great for fresh start campaigns' },
    { id: 'fest-2', title: 'Republic Day', date: '2026-01-26', description: 'Indian Republic Day – Civic pride & patriotism' },
    { id: 'fest-3', title: 'Holi', date: '2026-03-03', description: 'Festival of Colors – Vibrant, energetic visual content' },
    { id: 'fest-4', title: 'Gudi Padwa', date: '2026-03-19', description: 'Regional New Year – Auspicious for new launches' },
    { id: 'fest-5', title: 'Eid al-Fitr', date: '2026-03-20', description: 'End of Ramadan – Community and gratitude campaigns' },
    { id: 'fest-6', title: 'Independence Day', date: '2026-08-15', description: 'Indian Independence Day – Offers & patriotic themes' },
    { id: 'fest-7', title: 'Raksha Bandhan', date: '2026-08-28', description: 'Sibling festival – Focus on gifting and bonds' },
    { id: 'fest-8', title: 'Ganesh Chaturthi', date: '2026-09-14', description: 'Lord Ganesha festival – Removal of obstacles, new beginnings' },
    { id: 'fest-9', title: 'Navratri Starts', date: '2026-10-10', description: 'Nine nights of Goddess Durga – 9-day consecutive campaigns' },
    { id: 'fest-10', title: 'Dussehra', date: '2026-10-19', description: 'Victory of good over evil – Strategic wins and triumph' },
    { id: 'fest-11', title: 'Diwali', date: '2026-11-08', description: 'Festival of Lights – Biggest shopping season of the year!' },
    { id: 'fest-12', title: 'Christmas', date: '2026-12-25', description: 'Christmas Day – Year-end sales and holiday spirit' },
];

export function getIndianFestivalsAsEvents() {
    return INDIAN_FESTIVALS_2026.map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        type: 'festival',
        platform: null,
        account_id: null,
        media_url: null,
        color: '#f97316', // orange
        scheduled_at: `${f.date}T00:00:00.000Z`,
        end_at: null,
        status: 'system',
        created_at: new Date().toISOString(),
        video_id: null,
        series_id: null,
        labels: [],
        post_labels: [],
    }));
}
