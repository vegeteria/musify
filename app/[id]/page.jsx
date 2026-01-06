// app/song/[id]/page.jsx
import { getTrack } from '../lib/Spotify';
import Player from './Player';
import BackButton from './BackButton';

export default async function SongPage({ params }) {
  const { id: songId } = await params;
  const data = await getTrack(songId)
  // console.log(data)
  // Fetch data here if needed (SSR)
  // Fetch cached status locally from Flask API to avoid flash of loading screen
  let isCached = false;
  try {
    const apiUrl = process.env.SPOTDL_API_URL || "http://127.0.0.1:5000";
    const searchRes = await fetch(`${apiUrl}/api/search?query=https://open.spotify.com/track/${songId}`, {
      cache: 'no-store'
    });
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.songs && searchData.songs.length > 0) {
        isCached = searchData.songs[0].cached;
      }
    }
  } catch (err) {
    console.error("Error checking cache status:", err);
  }

  const songData = {
    id: songId,
    title: data?.name,
    artist: data?.artists.map(a => a.name).join(', '),
    album: data?.album?.name,
    // duration: "3:45",
    artwork: data?.album?.images[0]?.url,
    songUrl: `/api/stream?trackId=${songId}`,
    downloadUrl: `/api/stream?trackId=${songId}`,
    cached: isCached
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <BackButton />
        </div>

        {/* Pass props to the Client Component */}
        {/* Pass props to the Client Component */}
        <Player
          key={data?.id}
          songData={songData}
          mainColor='#b52ac9'
          initialCached={songData.cached}
          trackId={songId}
        />
      </div>
    </div>
  );
}
