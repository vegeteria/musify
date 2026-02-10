import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DOWNLOAD_DIR = path.join(process.cwd(), '.musify-cache');

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const trackId = searchParams.get('trackId');

        if (!trackId) {
            return NextResponse.json({ error: 'Missing trackId parameter' }, { status: 400 });
        }

        const filePath = path.join(DOWNLOAD_DIR, `${trackId}.mp3`);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found. Song may not be downloaded yet.' }, { status: 404 });
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;

        const rangeHeader = request.headers.get('range');

        if (rangeHeader) {
            // Parse Range header: "bytes=start-end"
            const parts = rangeHeader.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            if (start >= fileSize || end >= fileSize || start > end) {
                return new NextResponse(null, {
                    status: 416,
                    headers: {
                        'Content-Range': `bytes */${fileSize}`,
                    },
                });
            }

            const chunkSize = end - start + 1;
            const fileStream = fs.createReadStream(filePath, { start, end });

            // Convert Node.js ReadStream to Web ReadableStream
            const webStream = new ReadableStream({
                start(controller) {
                    fileStream.on('data', (chunk) => controller.enqueue(chunk));
                    fileStream.on('end', () => controller.close());
                    fileStream.on('error', (err) => controller.error(err));
                },
            });

            return new NextResponse(webStream, {
                status: 206,
                headers: {
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': chunkSize.toString(),
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Cache-Control': 'no-cache',
                },
            });
        }

        // Full file response (no Range header)
        const fileStream = fs.createReadStream(filePath);
        const webStream = new ReadableStream({
            start(controller) {
                fileStream.on('data', (chunk) => controller.enqueue(chunk));
                fileStream.on('end', () => controller.close());
                fileStream.on('error', (err) => controller.error(err));
            },
        });

        return new NextResponse(webStream, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': fileSize.toString(),
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'no-cache',
            },
        });

    } catch (error) {
        console.error('Stream error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
