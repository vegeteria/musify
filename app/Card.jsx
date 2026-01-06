import Link from "next/link"
import Image from "next/image"

export default function Card({ id, name, artist, album, url, artwork }) {
  return (
    <Link href={`/${id}`}>
      <div className="card glass-effect hover:scale-[1.02] transition-transform duration-200">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
            <Image
              src={artwork}
              alt={name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold truncate">{name}</h3>
            <p className="text-gray-400 truncate">{artist + " [" + album + "]"}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}