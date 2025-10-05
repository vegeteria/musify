import Link from "next/link"
import Image from "next/image"

export default function Card({id, name, artist, album, url, artwork}){
    return(
        <Link href={`/${id}`}>
          <div className="card glass-effect animate-float">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-lg flex items-center justify-center">
                  <Image src={artwork} alt="img" width={64} height={64} className="rounded-md" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{name}</h3>
                  <p className="text-gray-400">{artist + " [" + album + "]"}</p>
                </div>
              </div>
            </div>
        </Link>
    )
}