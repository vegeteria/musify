"use client";

import { useEffect, useRef, useState } from "react";
import ReactHowler from "react-howler";

export default function Player({ songData, mainColor = "#888" }) {
  const { songUrl, downloadUrl, title, artist, album, artwork } = songData;

  const [playing, setPlaying] = useState(true);
  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  const playerRef = useRef(null);

  // 🕓 Update seek every 500ms
  useEffect(() => {
    let timer;
    if (playing && !isSeeking) {
      timer = setInterval(() => {
        if (playerRef.current) {
          const current = playerRef.current.seek();
          if (typeof current === "number") setSeek(current);
        }
      }, 500);
    }
    return () => clearInterval(timer);
  }, [playing, isSeeking]);

  // 🎵 Set duration when loaded
  const handleLoad = () => {
    if (playerRef.current) {
      const dur = playerRef.current.duration();
      if (typeof dur === "number") setDuration(dur);
    }
  };

  // ⏩ Handle seeking
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

  // 🔊 Handle volume
  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (muted && newVol > 0) setMuted(false);
  };

  // 🧠 Helper
  const formatTime = (secs) => {
    if (!secs) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
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

        {/* Audio engine */}
        <ReactHowler
          src={songUrl}
          playing={playing}
          html5={true}
          volume={muted ? 0 : volume}
          ref={playerRef}
          onLoad={handleLoad}
        />

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
            style={{
              accentColor: mainColor,
            }}
          />
          <div className="flex justify-between w-full text-gray-400 text-sm mt-1">
            <span>{formatTime(seek)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mt-6 flex-wrap">
          {/* Rewind 10s */}
          <button
            onClick={() => {
              const current = playerRef.current.seek();
              playerRef.current.seek(Math.max(0, current - 10));
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
            aria-label={playing ? 'Pause' : 'Play'}
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
              const current = playerRef.current.seek();
              playerRef.current.seek(Math.min(duration, current + 10));
            }}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Forward 10 seconds"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.455 16.849a1 1 0 0 1-1.455-.885V8.036a1 1 0 0 1 1.455-.885l4.752 3.564a1 1 0 0 1 0 1.57l-4.752 3.564z"></path>
              <path d="M6.455 16.849a1 1 0 0 1-1.455-.885V8.036a1 1 0 0 1 1.455-.885l4.752 3.564a1 1 0 0 1 0 1.57l-4.752 3.564z"></path>
            </svg>
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              aria-label={muted ? 'Unmute' : 'Mute'}
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
            download
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
  );
}
