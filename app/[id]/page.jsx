// app/song/[id]/page.jsx
import Link from 'next/link';
import { getTrack } from '../lib/Spotify';
import Player from './Player';

export default async function SongPage({ params }) {
  const { id: songId } = await params;
  const data = await getTrack(songId)
  // console.log(data)
  // Fetch data here if needed (SSR)
  const songData = {
    id: songId,
    title: data?.name,
    artist: data?.artists.map(a => a.name).join(', '),
    album: data?.album?.name,
    // duration: "3:45",
    artwork: data?.album?.images[0]?.url,
    songUrl: `https://spotmp3.app/api/direct-download?url=https://open.spotify.com/track/${songId}`,
    downloadUrl: `https://spotmp3.app/api/direct-download?url=https://open.spotify.com/track/${songId}`,
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/">
          <button className="flex items-center text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          </Link>
        </div>

        {/* Pass props to the Client Component */}
        <Player key={data?.id} songData={songData} mainColor='#b52ac9' />
      </div>
    </div>
  );
}
