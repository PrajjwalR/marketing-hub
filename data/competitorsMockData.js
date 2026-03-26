// Helper to generate 7 days of recent content data
const generateRecentContent = (base) => [
  { date: '2025-03-15', engagement: Math.round(base * 0.9) },
  { date: '2025-03-16', engagement: Math.round(base * 1.05) },
  { date: '2025-03-17', engagement: Math.round(base * 1.2) },
  { date: '2025-03-18', engagement: Math.round(base * 0.85) },
  { date: '2025-03-19', engagement: Math.round(base * 1.3) },
  { date: '2025-03-20', engagement: Math.round(base * 1.5) },
  { date: '2025-03-21', engagement: Math.round(base * 1.6) },
];

export const competitorsMockData = [
  {
    id: 'our-company',
    name: 'Our Company',
    isOurs: true,
    category: ['fashion', 'lifestyle'],
    avatarInitials: 'OC',
    avatarColor: '#1d4e9f',
    accounts: [
      {
        platform: 'YouTube',
        stats: { subscribers: 125000, totalVideosPosts: 44, avgLikes: 3500, avgComments: 180, engagementRate: 4.2, reach: 500000 },
        recentContent: generateRecentContent(3500)
      },
      {
        platform: 'Instagram',
        stats: { subscribers: 85000, totalVideosPosts: 60, avgLikes: 4100, avgComments: 210, engagementRate: 5.8, reach: 350000 },
        recentContent: generateRecentContent(4100)
      },
      {
        platform: 'Facebook',
        stats: { subscribers: 35000, totalVideosPosts: 20, avgLikes: 900, avgComments: 30, engagementRate: 2.8, reach: 350000 },
        recentContent: generateRecentContent(900)
      },
      {
        platform: 'X',
        stats: { subscribers: 55000, totalVideosPosts: 320, avgLikes: 1200, avgComments: 140, engagementRate: 2.2, reach: 410000 },
        recentContent: generateRecentContent(1200)
      }
    ]
  },
  {
    id: 'nova-brand',
    name: 'NovaBrand Co.',
    isOurs: false,
    category: ['fashion', 'lifestyle'],
    avatarInitials: 'NB',
    avatarColor: '#e85d4a',
    accounts: [
      {
        platform: 'YouTube',
        stats: { subscribers: 128500, totalVideosPosts: 48, avgLikes: 3240, avgComments: 187, engagementRate: 4.8, reach: 450000 },
        recentContent: generateRecentContent(3240)
      },
      {
        platform: 'Instagram',
        stats: { subscribers: 210000, totalVideosPosts: 135, avgLikes: 6500, avgComments: 340, engagementRate: 3.5, reach: 850000 },
        recentContent: generateRecentContent(6500)
      },
      {
        platform: 'X',
        stats: { subscribers: 82000, totalVideosPosts: 450, avgLikes: 2100, avgComments: 310, engagementRate: 2.6, reach: 600000 },
        recentContent: generateRecentContent(2100)
      }
    ]
  },
  {
    id: 'trendforge',
    name: 'TrendForge',
    isOurs: false,
    category: ['footwear', 'streetwear'],
    avatarInitials: 'TF',
    avatarColor: '#2f80ed',
    accounts: [
      {
        platform: 'Facebook',
        stats: { subscribers: 84200, totalVideosPosts: 62, avgLikes: 1540, avgComments: 98, engagementRate: 3.7, reach: 280000 },
        recentContent: generateRecentContent(1540)
      },
      {
        platform: 'Instagram',
        stats: { subscribers: 145000, totalVideosPosts: 85, avgLikes: 4200, avgComments: 215, engagementRate: 4.1, reach: 510000 },
        recentContent: generateRecentContent(4200)
      }
    ]
  },
  {
    id: 'aura-lifestyle',
    name: 'Aura Lifestyle',
    isOurs: false,
    category: ['lifestyle', 'wellness'],
    avatarInitials: 'AL',
    avatarColor: '#ec4899',
    accounts: [
      {
        platform: 'YouTube',
        stats: { subscribers: 310000, totalVideosPosts: 150, avgLikes: 8200, avgComments: 510, engagementRate: 3.1, reach: 1100000 },
        recentContent: generateRecentContent(8200)
      },
      {
        platform: 'Instagram',
        stats: { subscribers: 415000, totalVideosPosts: 290, avgLikes: 15200, avgComments: 850, engagementRate: 6.9, reach: 1800000 },
        recentContent: generateRecentContent(15200)
      },
      {
        platform: 'Facebook',
        stats: { subscribers: 120000, totalVideosPosts: 310, avgLikes: 2100, avgComments: 140, engagementRate: 1.9, reach: 600000 },
        recentContent: generateRecentContent(2100)
      },
      {
        platform: 'X',
        stats: { subscribers: 195000, totalVideosPosts: 850, avgLikes: 4200, avgComments: 630, engagementRate: 2.2, reach: 1400000 },
        recentContent: generateRecentContent(4200)
      }
    ]
  },
  {
    id: 'streetvibe',
    name: 'StreetVibe',
    isOurs: false,
    category: ['streetwear', 'fashion'],
    avatarInitials: 'SV',
    avatarColor: '#10b981',
    accounts: [
      {
        platform: 'YouTube',
        stats: { subscribers: 61000, totalVideosPosts: 85, avgLikes: 2100, avgComments: 115, engagementRate: 3.4, reach: 150000 },
        recentContent: generateRecentContent(2100)
      },
      {
        platform: 'Facebook',
        stats: { subscribers: 45000, totalVideosPosts: 120, avgLikes: 850, avgComments: 45, engagementRate: 2.1, reach: 95000 },
        recentContent: generateRecentContent(850)
      }
    ]
  }
];
