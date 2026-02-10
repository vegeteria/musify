import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { setProgress, getProgress, clearProgress } from '../../lib/progress';

const DOWNLOAD_DIR = path.join(process.cwd(), '.musify-cache');
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

// Use file-based progress tracking to solve multi-process issues
// Legacy globalThis map removed in favor of lib/progress.js

// Lock set to prevent concurrent downloads for the same trackId
if (!globalThis.__downloadLocks) {
    globalThis.__downloadLocks = new Set();
}
const downloadLocks = globalThis.__downloadLocks;

// Ensure download directory exists
function ensureDir() {
    if (!fs.existsSync(DOWNLOAD_DIR)) {
        fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    }
}

// Cleanup files older than 30 minutes
function cleanupOldFiles() {
    try {
        if (!fs.existsSync(DOWNLOAD_DIR)) return;
        const now = Date.now();
        const files = fs.readdirSync(DOWNLOAD_DIR);
        for (const file of files) {
            const filePath = path.join(DOWNLOAD_DIR, file);
            const stat = fs.statSync(filePath);
            if (now - stat.mtimeMs > MAX_AGE_MS) {
                fs.unlinkSync(filePath);
                console.log(`[Cleanup] Deleted old file: ${file}`);
            }
        }
    } catch (err) {
        console.error('[Cleanup] Error:', err);
    }
}

// Check if a cached file exists and is fresh (< 30 min old)
function getCachedFile(trackId) {
    const filePath = path.join(DOWNLOAD_DIR, `${trackId}.mp3`);
    if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (Date.now() - stat.mtimeMs < MAX_AGE_MS) {
            return { filePath, size: stat.size };
        }
        // File is stale, delete it
        fs.unlinkSync(filePath);
    }
    return null;
}

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const trackId = searchParams.get('trackId');

        if (!trackId) {
            return NextResponse.json({ error: 'Missing trackId parameter' }, { status: 400 });
        }

        ensureDir();
        cleanupOldFiles();

        // Check if already cached
        const cached = getCachedFile(trackId);
        if (cached) {
            setProgress(trackId, {
                progress: 100,
                total: cached.size,
                downloaded: cached.size,
                status: 'done',
            });
            return NextResponse.json({ status: 'cached', size: cached.size });
        }

        // Check if already downloading (check file status for multi-process concurrency)
        const currentStatus = getProgress(trackId);
        if (downloadLocks.has(trackId) || (currentStatus && currentStatus.status === 'downloading')) {
            return NextResponse.json({ status: 'already_downloading' });
        }

        // Acquire lock
        downloadLocks.add(trackId);



        // Get download link from SpotiDLX directly to avoid self-referencing SSL issues
        const spotifyUrl = `https://open.spotify.com/track/${trackId}`;
        console.log(`[Download] Fetching info from SpotiDLX for: ${spotifyUrl}`);

        let spotmateData;
        try {
            const spotmateRes = await fetch(`https://spoti-dlx.vercel.app/api/spotmate?url=${encodeURIComponent(spotifyUrl)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            if (!spotmateRes.ok) throw new Error(`SpotiDLX API returned ${spotmateRes.status}`);

            spotmateData = await spotmateRes.json();
            console.log('[Download] SpotiDLX success. Link:', spotmateData.download_link);
        } catch (err) {
            console.error('[Download] SpotiDLX fetch error:', err);
            setProgress(trackId, { progress: 0, status: 'error', error: 'Failed to access SpotiDLX API' });
            downloadLocks.delete(trackId);
            return NextResponse.json({ error: 'Failed to access SpotiDLX API' }, { status: 500 });
        }

        if (spotmateData.status !== 'success' || !spotmateData.download_link) {
            setProgress(trackId, { progress: 0, status: 'error', error: 'Failed to get download link' });
            return NextResponse.json({ error: 'Failed to get download link' }, { status: 500 });
        }

        // Initialize progress
        setProgress(trackId, {
            progress: 0,
            total: 0,
            downloaded: 0,
            status: 'downloading',
        });

        // Start download in the background (don't await)
        downloadFile(trackId, spotmateData.download_link).catch(err => {
            console.error(`[Download] Error for ${trackId}:`, err);
            setProgress(trackId, { progress: 0, status: 'error', error: err.message });
            downloadLocks.delete(trackId);
        });

        return NextResponse.json({ status: 'started' });

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function downloadFile(trackId, downloadLink) {
    const filePath = path.join(DOWNLOAD_DIR, `${trackId}.mp3`);
    // Use unique temp file to avoid race conditions
    const tempPath = path.join(DOWNLOAD_DIR, `${trackId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.tmp`);

    try {
        console.log(`[Download] File start: ${downloadLink}`);
        const response = await fetch(downloadLink, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`Download failed with status: ${response.status}`);
        }

        const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
        const total = contentLength || 0;

        setProgress(trackId, {
            progress: 0,
            total,
            downloaded: 0,
            status: 'downloading',
        });

        // Create a write stream
        const writeStream = fs.createWriteStream(tempPath);
        const reader = response.body.getReader();
        let downloaded = 0;

        let lastUpdate = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            writeStream.write(Buffer.from(value));
            downloaded += value.length;

            const now = Date.now();
            if (now - lastUpdate > 500) { // Throttle updates to 500ms
                lastUpdate = now;
                const progress = total > 0 ? Math.round((downloaded / total) * 100) : 0;

                setProgress(trackId, {
                    progress,
                    total,
                    downloaded,
                    status: 'downloading',
                });
            }
        }

        writeStream.end();

        // Wait for the write stream to finish
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        // Rename temp file to final
        fs.renameSync(tempPath, filePath);

        // Small delay to ensure filesystem has committed the file
        await new Promise(resolve => setTimeout(resolve, 100));

        const finalSize = fs.statSync(filePath).size;
        setProgress(trackId, {
            progress: 100,
            total: finalSize,
            downloaded: finalSize,
            status: 'done',
        });

        console.log(`[Download] Complete: ${trackId} (${(finalSize / 1024 / 1024).toFixed(1)}MB)`);

        // Release lock
        downloadLocks.delete(trackId);

    } catch (error) {
        // Clean up temp file on error
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
        setProgress(trackId, {
            progress: 0,
            status: 'error',
            error: error.message,
        });
        // Release lock
        downloadLocks.delete(trackId);
        throw error;
    }
}
