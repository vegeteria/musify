import Link from "next/link"

export default function Card({id, name, artist, album, url, artwork}){
    return(
        <div className="card glass-effect animate-float">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-lg flex items-center justify-center">
                  <img src={artwork} alt="img" className="w-16 h-16 rounded-md" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{name}</h3>
                  <p className="text-gray-400">{artist + " [" + album + "]"}</p>
                </div>
              </div>
            </div>
    )
}