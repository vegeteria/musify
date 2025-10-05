import Image from 'next/image';

export default function SongPage({ params }) {
  // Using params.id to get the song id from the URL
  const songId = params.id;
  
  // Placeholder data for the song
  const songData = {
    title: "Song Title",
    artist: "Artist Name",
    album: "Album Name",
    duration: "3:45",
    artwork: "https://placehold.co/400x400/1a1a1a/ffffff?text=Album+Art",
    audioSrc: "#", // This will be replaced with actual audio source
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <button className="flex items-center text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Album Art Section */}
          <div className="lg:w-2/5 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20">
                {/* <Image
                  src={songData.artwork}
                  alt={`${songData.title} album artwork`}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                /> */}
              </div>
              
              {/* Vinyl effect for album art */}
              <div className="absolute inset-0 rounded-full opacity-20 bg-gradient-to-r from-purple-500 via-transparent to-pink-500 animate-pulse-slow"></div>
            </div>
          </div>

          {/* Player Controls Section */}
          <div className="lg:w-3/5 flex flex-col">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{songData.title}</h1>
              <p className="text-xl text-gray-400 mb-1">{songData.artist}</p>
              <p className="text-lg text-gray-500">{songData.album}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>1:23</span>
                <span>{songData.duration}</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500" 
                  style={{ width: '35%' }}
                ></div>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center space-x-6 mb-6">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                </button>
                
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-4 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                <button className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>

              {/* Additional controls */}
              <div className="flex items-center space-x-6">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                
                <button className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                
                <button className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a9 9 0 100 12 9 9 0 000-12zm0 0V3m0 18v-3" />
                  </svg>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="80"
                    className="w-24 accent-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Song queue/list */}
            <div className="mt-auto">
              <h2 className="text-xl font-semibold mb-4">Up next</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center p-3 rounded-lg hover:bg-gray-900 transition-colors cursor-pointer">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-10 h-10 rounded flex items-center justify-center mr-4">
                      <span className="text-xs">0{item}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Related Song Title {item}</p>
                      <p className="text-sm text-gray-400">Artist Name</p>
                    </div>
                    <span className="text-gray-500">2:4{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}