import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
        }

        const apiUrl = process.env.SPOTDL_API_URL || 'http://localhost:5000';

        // Call the spotDL Flask API
        const response = await axios.post(`${apiUrl}/api/download`, null, {
            params: { url }
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Download error:', error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.error || 'Failed to download song';
        return NextResponse.json({ error: message }, { status });
    }
}
