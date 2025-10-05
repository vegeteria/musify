"use client";

import { useRef, useState, useEffect } from "react";
import "plyr/dist/plyr.css"; // safe to import CSS
// ❌ don't import Plyr at the top — causes SSR error

export default function Player({ songData }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const audioRef = useRef(null);
  const playerRef = useRef(null);

  const { songUrl, downloadUrl, title, artist, album, artwork } = songData;

  useEffect(() => {
    // ✅ dynamically import Plyr on client only
    if (typeof window === "undefined") return;

    import("plyr").then((module) => {
      const Plyr = module.default || module;

      if (audioRef.current && !playerRef.current) {
        playerRef.current = new Plyr(audioRef.current, {
          controls: [
            "play-large",
            "play",
            "progress",
            "current-time",
            "duration",
            "mute",
            "volume",
          ],
          loadSprite: true,
          iconUrl: "https://cdn.plyr.io/3.7.8/plyr.svg",
        });
      }
    });

    // Optional: Add theme styling dynamically
    const style = document.createElement("style");
    style.innerHTML = `
      .plyr {
      .plyr--audio {
        background-color: #111 !important;
        border-radius: 12px !important;
        border: 1px solid #222 !important;
      }

      .plyr__controls {
        color: #fff !important;
      }

      .plyr__control {
        color: #fff !important;
      }

      .plyr__control:hover,
      .plyr__control:focus {
        background: rgba(255,255,255,0.1) !important;
      }

      .plyr__progress input[type="range"]::-webkit-slider-thumb {
        background: #fff !important;
      }

      .plyr__progress__buffer {
        background: #444 !important;
      }

      .plyr__progress--played {
        background: #888 !important;
      }

      .plyr__time {
        color: #ccc !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Album Art Section */}
      <div className="lg:w-2/5 flex justify-center">
        <div className="relative w-full max-w-md">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20">
            <img
              src={artwork}
              alt={`${title} album artwork`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 rounded-full opacity-20 bg-gradient-to-r from-purple-500 via-transparent to-pink-500 animate-pulse-slow"></div>
        </div>
      </div>

      {/* Player Controls Section */}
      <div className="lg:w-3/5 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          <p className="text-xl text-gray-400 mb-1">{artist}</p>
          <p className="text-lg text-gray-500">{album}</p>
        </div>

        {/* Audio Player */}
        <div className="mb-8">
          <audio ref={audioRef} src={songUrl} className="w-full" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 mb-8">
          {/* Favorite */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`${
              isFavorite ? "text-pink-500" : "text-gray-400"
            } hover:text-white transition-colors`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 ${isFavorite ? "fill-current" : ""}`}
              fill={isFavorite ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {/* Download */}
          <a
            href={downloadUrl}
            download
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
