import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.musify-cache');

function ensureDir() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
}

const progressCache = new Map();

export function setProgress(trackId, data) {
    if (!trackId) return;

    // Always keep in memory for same-process reads
    progressCache.set(trackId, data);

    try {
        ensureDir();
        const filePath = path.join(CACHE_DIR, `${trackId}.json`);
        // Write to file for multi-process reads
        // Use atomic write if possible, or just overwrite
        fs.writeFileSync(filePath, JSON.stringify(data));
    } catch (err) {
        console.error('Failed to write progress file:', err);
    }
}

export function getProgress(trackId) {
    if (!trackId) return null;

    // First try memory (fastest)
    if (progressCache.has(trackId)) {
        return progressCache.get(trackId);
    }

    // Fallback to file system (for other processes)
    try {
        const filePath = path.join(CACHE_DIR, `${trackId}.json`);
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            // Cache it? Maybe not, it might be stale if other process wrote it.
            return data;
        }
    } catch (err) {
        // Ignore read errors
    }

    return null;
}

export function clearProgress(trackId) {
    if (!trackId) return;
    progressCache.delete(trackId);
    try {
        const filePath = path.join(CACHE_DIR, `${trackId}.json`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error('Failed to clear progress file:', err);
    }
}
