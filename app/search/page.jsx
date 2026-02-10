import Card from "../Card"
import searchTrack from "../../lib/Spotify"


export default async function SearchPage({ searchParams }) {
    const { query } = await searchParams || ""
    // console.log(query)
    const results = await searchTrack(query)
    // console.log(results)
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 mx-8 max-sm:mx-2">
            {results.map((item) => (
                <Card
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    artist={item.artist}
                    album={item.album}
                    url={item.url}
                    artwork={item.artwork}
                />
            ))}
        </div>
    )
}