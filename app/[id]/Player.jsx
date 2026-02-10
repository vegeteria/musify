"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactHowler from "react-howler";

export default function Player({ songData, mainColor = "#888", trackId }) {
  const { title, artist, album, artwork } = songData;

  const [playing, setPlaying] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("idle"); // idle | downloading | done | error
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadMessage, setDownloadMessage] = useState("");

  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  const playerRef = useRef(null);
  const pollInterval = useRef(null);
  const isMounted = useRef(true);
  const downloadStartTime = useRef(0);

  const songUrl = `/api/stream?trackId=${trackId}`;
  const downloadUrl = `/api/stream?trackId=${trackId}`;

  // Start download on mount
  useEffect(() => {
    isMounted.current = true;

    const startDownload = async () => {
      try {
        setDownloadStatus("downloading");
        setDownloadMessage("Starting download...");
        setDownloadProgress(0);
        downloadStartTime.current = Date.now();

        const response = await fetch(`/api/download?trackId=${trackId}`, {
          method: "POST",
        });
        const data = await response.json();

        if (!isMounted.current) return;

        if (data.status === "cached") {
          // Already downloaded and fresh
          setDownloadStatus("done");
          setDownloadProgress(100);
          setDownloadMessage("Ready to play!");
          setPlaying(true);
          return;
        }

        if (data.status === "started" || data.status === "already_downloading") {
          // Clear any existing interval to prevent leaks
          if (pollInterval.current) {
            clearInterval(pollInterval.current);
          }
          // Start polling for progress
          pollInterval.current = setInterval(checkProgress, 500);
        } else if (data.error) {
          setDownloadStatus("error");
          setDownloadMessage(data.error);
        }
      } catch (error) {
        console.error("Download start error:", error);
        if (isMounted.current) {
          setDownloadStatus("error");
          setDownloadMessage("Failed to start download.");
        }
      }
    };

    startDownload();

    return () => {
      isMounted.current = false;
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
  }, [trackId]);

  const checkProgress = async () => {
    if (!isMounted.current) {
      // Component unmounted, stop polling
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
      return;
    }

    try {
      const res = await fetch(`/api/download/progress?trackId=${trackId}`);
      const data = await res.json();

      if (!isMounted.current) return;

      setDownloadProgress(data.progress || 0);

      // If download hasn't started yet (race condition), keep showing "Starting download..."
      // unless it's been waiting too long (> 10 seconds)
      if (data.status === "not_started") {
        if (Date.now() - downloadStartTime.current > 10000) {
          setDownloadStatus("error");
          setDownloadMessage("Download timed out.");
          if (pollInterval.current) {
            clearInterval(pollInterval.current);
            pollInterval.current = null;
          }
          return;
        }
        setDownloadMessage("Starting download...");
      } else {
        setDownloadMessage(data.message || data.status || "");
      }

      if (data.status === "done") {
        if (pollInterval.current) {
          clearInterval(pollInterval.current);
          pollInterval.current = null;
        }
        setDownloadProgress(100);
        setDownloadMessage("Ready to play!");

        // Small delay to ensure file is fully written to disk
        setTimeout(() => {
          if (isMounted.current) {
            setDownloadStatus("done");
            setPlaying(true);
          }
        }, 500);
      } else if (data.status === "error") {
        if (pollInterval.current) {
          clearInterval(pollInterval.current);
          pollInterval.current = null;
        }
        setDownloadStatus("error");
        setDownloadMessage(data.error || "Download failed");
      }
    } catch (err) {
      console.error("Progress poll error:", err);
      // Stop polling on error
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    }
  };

  // Update seek every 500ms
  useEffect(() => {
    let timer;
    if (playing && !isSeeking && downloadStatus === "done") {
      timer = setInterval(() => {
        if (playerRef.current) {
          const current = playerRef.current.seek();
          if (typeof current === "number") setSeek(current);
        }
      }, 500);
    }
    return () => clearInterval(timer);
  }, [playing, isSeeking, downloadStatus]);

  // Set duration when loaded
  const handleLoad = () => {
    if (playerRef.current) {
      const dur = playerRef.current.duration();
      if (typeof dur === "number") setDuration(dur);
    }
  };

  const handleLoadError = (id, error) => {
    console.error("Audio load error:", error);
    setDownloadStatus("error");
    setDownloadMessage("Failed to load audio. Please try again.");
  };

  // Handle seeking
  const handleSeekChange = (e) => {
    setSeek(parseFloat(e.target.value));
    setIsSeeking(true);
  };

  const handleSeekCommit = () => {
    if (playerRef.current && typeof seek === "number") {
      playerRef.current.seek(seek);
    }
    setIsSeeking(false);
  };

  // Handle volume
  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (muted && newVol > 0) setMuted(false);
  };

  // Format time helper
  const formatTime = (secs) => {
    if (!secs) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Retry handler
  const handleRetry = () => {
    setDownloadStatus("idle");
    setDownloadProgress(0);
    setDownloadMessage("");
    // Re-trigger download
    const restart = async () => {
      try {
        setDownloadStatus("downloading");
        setDownloadMessage("Retrying download...");
        const response = await fetch(`/api/download?trackId=${trackId}`, {
          method: "POST",
        });
        const data = await response.json();
        if (data.status === "cached") {
          setDownloadStatus("done");
          setDownloadProgress(100);
          setPlaying(true);
        } else if (data.status === "started" || data.status === "already_downloading") {
          pollInterval.current = setInterval(checkProgress, 500);
        } else {
          setDownloadStatus("error");
          setDownloadMessage(data.error || "Download failed");
        }
      } catch (err) {
        setDownloadStatus("error");
        setDownloadMessage("Failed to retry download.");
      }
    };
    restart();
  };

  if (downloadStatus === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-red-500">
        <h2 className="text-2xl font-bold mb-4">Error loading song</h2>
        <p className="mb-4">{downloadMessage}</p>
        <button
          onClick={handleRetry}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
      {/* Download Progress Overlay */}
      {downloadStatus === "downloading" && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {Math.round(downloadProgress)}%
          </h2>
          <p className="text-xl text-gray-300 animate-pulse">{downloadMessage}</p>
          <div className="w-64 h-2 bg-gray-700 rounded-full mt-6 overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Album Art */}
      <div className="lg:w-2/5 flex justify-center">
        <div className="relative w-full max-w-md">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20">
            <img
              src={artwork}
              alt={`${title} album artwork`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Player Section */}
      <div className="lg:w-3/5 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          <p className="text-xl text-gray-400 mb-1">{artist}</p>
          <p className="text-lg text-gray-500">{album}</p>
        </div>

        {/* Audio engine - only load when download is complete */}
        {downloadStatus === "done" && (
          <ReactHowler
            src={songUrl}
            playing={playing}
            html5={true}
            format={["mp3"]}
            volume={muted ? 0 : volume}
            ref={playerRef}
            onLoad={handleLoad}
            onLoadError={handleLoadError}
          />
        )}

        {/* Seekbar */}
        <div className="flex flex-col items-center mt-4">
          <input
            type="range"
            min={0}
            max={duration ? duration.toFixed(1) : 0}
            step="0.1"
            value={seek}
            onChange={handleSeekChange}
            onMouseUp={handleSeekCommit}
            onTouchEnd={handleSeekCommit}
            className="w-full cursor-pointer"
            style={{ accentColor: mainColor }}
          />
          <div className="flex justify-between w-full text-gray-400 text-sm mt-1">
            <span>{formatTime(seek)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 space-y-4">
          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 md:gap-6">
            {/* Rewind 10s */}
            <button
              onClick={() => {
                if (playerRef.current) {
                  const current = playerRef.current.seek();
                  playerRef.current.seek(Math.max(0, current - 10));
                }
              }}
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              aria-label="Rewind 10 seconds"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.545 16.849l-4.752-3.564a1 1 0 0 1 0-1.57l4.752-3.564A1 1 0 0 1 12 8.936v7.128a1 1 0 0 1-1.455.885z"></path>
                <path d="M17.545 16.849l-4.752-3.564a1 1 0 0 1 0-1.57l4.752-3.564A1 1 0 0 1 19 8.936v7.128a1 1 0 0 1-1.455.885z"></path>
              </svg>
            </button>

            {/* Play / Pause */}
            <button
              onClick={() => setPlaying(!playing)}
              className="rounded-full bg-white text-black p-3 mx-2 shadow-lg hover:scale-105 transition-transform"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 6h3v12H8V6zm5 0h3v12h-3V6z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 6v12l10-6z"></path>
                </svg>
              )}
            </button>

            {/* Forward 10s */}
            <button
              onClick={() => {
                if (playerRef.current) {
                  const current = playerRef.current.seek();
                  playerRef.current.seek(Math.min(duration, current + 10));
                }
              }}
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              aria-label="Forward 10 seconds"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.455 16.849a1 1 0 0 1-1.455-.885V8.036a1 1 0 0 1 1.455-.885l4.752 3.564a1 1 0 0 1 0 1.57l-4.752 3.564z"></path>
                <path d="M6.455 16.849a1 1 0 0 1-1.455-.885V8.036a1 1 0 0 1 1.455-.885l4.752 3.564a1 1 0 0 1 0 1.57l-4.752 3.564z"></path>
              </svg>
            </button>
          </div>

          {/* Volume and Download Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted(!muted)}
                className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted || volume === 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12A4.5 4.5 0 0 0 14 7.96v8.08A4.5 4.5 0 0 0 16.5 12zM12 4l-4 4H4v8h4l4 4V4zm8.91 3.09L19.5 8.5l-1.41-1.41L16.67 8.5 18.09 9.91 19.5 8.5l1.41 1.41-1.41 1.42 1.41 1.41-1.41 1.42-1.42-1.42-1.41 1.42 1.41 1.41 1.42-1.41 1.41 1.41 1.41-1.41-1.41-1.42 1.41-1.41z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 cursor-pointer"
                style={{ accentColor: mainColor }}
                aria-label="Volume"
              />
            </div>

            {/* Download */}
            <a
              href={downloadUrl}
              download={`${artist} - ${title}.mp3`}
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              aria-label="Download song"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v5h3l-4 4-4-4h3V7z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
