import { NextResponse } from 'next/server';

// Access the same global progress map used by the download route
const downloadProgress = globalThis.__downloadProgress || new Map();

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const trackId = searchParams.get('trackId');

        if (!trackId) {
            return NextResponse.json({ error: 'Missing trackId parameter' }, { status: 400 });
        }

        const progress = downloadProgress.get(trackId);

        if (!progress) {
            return NextResponse.json({
                progress: 0,
                status: 'not_started',
                message: 'No download in progress',
            });
        }

        const response = {
            progress: progress.progress,
            status: progress.status,
            total: progress.total || 0,
            downloaded: progress.downloaded || 0,
        };

        if (progress.status === 'error') {
            response.error = progress.error || 'Download failed';
        }

        if (progress.status === 'downloading') {
            const downloadedMB = ((progress.downloaded || 0) / 1024 / 1024).toFixed(1);
            const totalMB = ((progress.total || 0) / 1024 / 1024).toFixed(1);
            response.message = progress.total > 0
                ? `Downloading... ${downloadedMB}MB / ${totalMB}MB`
                : `Downloading... ${downloadedMB}MB`;
        } else if (progress.status === 'done') {
            response.message = 'Ready to play!';
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('Progress check error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
