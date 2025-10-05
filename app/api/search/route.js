import { NextResponse } from "next/server"
import searchTrack from "../../lib/Spotify"

export async function GET(req){
    const {searchParams} = new URL(req.url)
    const query = searchParams.get("query")
    const data = await searchTrack(query)
    // console.log(data)
return NextResponse.json(data)
}