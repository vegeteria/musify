// app/song/[id]/page.jsx
import { getTrack } from '../lib/Spotify';
import Player from './Player';
import BackButton from './BackButton';

export default async function SongPage({ params }) {
  const { id: songId } = await params;
  const data = await getTrack(songId);

  const songData = {
    id: songId,
    title: data?.name,
    artist: data?.artists.map(a => a.name).join(', '),
    album: data?.album?.name,
    artwork: data?.album?.images[0]?.url,
    songUrl: `/api/stream?trackId=${songId}`,
    downloadUrl: `/api/stream?trackId=${songId}`,
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <BackButton />
        </div>

        {/* Pass props to the Client Component */}
        <Player
          key={data?.id}
          songData={songData}
          mainColor='#b52ac9'
          trackId={songId}
        />
      </div>
    </div>
  );
}
