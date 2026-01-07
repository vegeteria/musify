import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const trackId = searchParams.get('trackId');

        if (!trackId) {
            return NextResponse.json({ error: 'Missing trackId parameter' }, { status: 400 });
        }

        const apiUrl = process.env.SPOTDL_API_URL || 'http://localhost:5000';

        // 1. Check cache to get song info including path/filename
        const searchResponse = await axios.get(`${apiUrl}/api/search`, {
            params: { query: `https://open.spotify.com/track/${trackId}` }
        });

        if (!searchResponse.data.songs || searchResponse.data.songs.length === 0) {
            return NextResponse.json({ error: 'Song not found' }, { status: 404 });
        }

        let song = searchResponse.data.songs[0];

        if (!song.cached) {
            // Song not in cache - trigger download first
            try {
                const downloadResponse = await axios.post(`${apiUrl}/api/download`, null, {
                    params: { url: `https://open.spotify.com/track/${trackId}` }
                });

                if (downloadResponse.data.status !== 'success') {
                    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
                }

                song = {
                    ...song,
                    cached: true,
                    file_path: downloadResponse.data.file_path
                };
            } catch (downloadError) {
                console.error('Auto-download failed:', downloadError);
                return NextResponse.json({ error: 'Failed to download song' }, { status: 500 });
            }
        }

        const filename = song.file_path.split('/').pop();
        const fileUrl = `${apiUrl}/api/file/${encodeURIComponent(filename)}`;

        // Support Range requests for seeking
        const rangeHeader = request.headers.get('range');
        const requestHeaders = {};

        if (rangeHeader) {
            // Forward Range header to Flask backend
            requestHeaders['Range'] = rangeHeader;
        }

        // Fetch from Flask with range support
        const fileResponse = await fetch(fileUrl, { headers: requestHeaders });

        if (!fileResponse.ok && fileResponse.status !== 206) {
            return NextResponse.json({ error: 'Failed to fetch audio file' }, { status: fileResponse.status });
        }

        const headers = new Headers();
        headers.set('Content-Type', 'audio/mpeg');
        headers.set('Accept-Ranges', 'bytes');

        // Set filename for download (Artist - Title.mp3)
        const downloadFilename = `${song.artist} - ${song.name}.mp3`;
        // Use attachment for download, inline for streaming
        const disposition = request.headers.get('X-Download') === 'true' ? 'attachment' : 'inline';
        headers.set('Content-Disposition', `${disposition}; filename="${downloadFilename}"`);

        // Copy relevant headers from Flask response
        const contentLength = fileResponse.headers.get('Content-Length');
        const contentRange = fileResponse.headers.get('Content-Range');

        if (contentLength) {
            headers.set('Content-Length', contentLength);
        }
        if (contentRange) {
            headers.set('Content-Range', contentRange);
        }

        return new NextResponse(fileResponse.body, {
            status: fileResponse.status, // 200 or 206
            headers: headers
        });

    } catch (error) {
        console.error('Stream error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
