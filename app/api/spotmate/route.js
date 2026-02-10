import { NextResponse } from 'next/server';

const SPOTMATE_API = 'https://spoti-dlx.vercel.app/api/spotmate';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
        }

        // Validate it's a Spotify URL
        if (!url.includes('spotify.com')) {
            return NextResponse.json({ error: 'Invalid Spotify URL' }, { status: 400 });
        }

        const response = await fetch(`${SPOTMATE_API}?url=${encodeURIComponent(url)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('SpotiDLX API error:', response.status, errorText);
            return NextResponse.json(
                { error: 'SpotiDLX API request failed', details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (data.status !== 'success') {
            return NextResponse.json(
                { error: 'SpotiDLX returned an error', details: data },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('SpotiDLX proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
