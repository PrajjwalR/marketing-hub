import { NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

const MOCK_PHOTOS = [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
      name: 'Abstract Fluid',
      author: 'Milad Fakurian'
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800',
      name: 'Colorful Gradient',
      author: 'Gradient Lab'
    },
    {
        id: '3',
        url: 'https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&q=80&w=800',
        name: 'Nature Vista',
        author: 'John Doe'
    },
    {
        id: '4',
        url: 'https://images.unsplash.com/photo-1504333638930-c8787321eba0?auto=format&fit=crop&q=80&w=800',
        name: 'Tech Grid',
        author: 'Future Systems'
    },
    {
        id: '5',
        url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800',
        name: 'Neon Night',
        author: 'Cyber Hunter'
    },
    {
        id: '6',
        url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800',
        name: 'Modern Architecture',
        author: 'City Scape'
    }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  // If no API key, return mocks
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn("UNSPLASH_ACCESS_KEY missing. Returning mock data.");
    const filtered = query 
        ? MOCK_PHOTOS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
        : MOCK_PHOTOS;
    return NextResponse.json(filtered);
  }

  try {
    const endpoint = query 
      ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=30`
      : `https://api.unsplash.com/photos?per_page=30&order_by=popular`;

    const res = await fetch(endpoint, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    if (!res.ok) throw new Error('Unsplash API error');

    const data = await res.json();
    const results = query ? data.results : data;

    const formatted = results.map((photo: any) => ({
      id: photo.id,
      url: photo.urls.regular,
      name: photo.description || photo.alt_description || 'Untitled',
      author: photo.user.name
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Stock API Error:', error);
    return NextResponse.json(MOCK_PHOTOS); // Fallback to mocks on error
  }
}
