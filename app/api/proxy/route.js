import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
    return handleProxy(request, 'GET');
}

export async function POST(request) {
    return handleProxy(request, 'POST');
}

async function handleProxy(request, method) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get('path');

        // Construct target URL
        // Explicitly handle nested paths like download/progress
        // path param comes from /api/proxy?path=download/progress
        const apiUrl = process.env.SPOTDL_API_URL || 'http://localhost:5000';
        const targetUrl = `${apiUrl}/api/${path}`;

        // Forward query params (excluding 'path')
        const params = {};
        searchParams.forEach((value, key) => {
            if (key !== 'path') params[key] = value;
        });

        const config = {
            method,
            url: targetUrl,
            params,
            validateStatus: () => true // Handle all status codes
        };

        if (method === 'POST') {
            // For now we don't send body in Player.jsx, but good to handle
            // config.data = await request.json(); 
        }

        const response = await axios(config);

        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Proxy failed', details: error.message }, { status: 500 });
    }
}
