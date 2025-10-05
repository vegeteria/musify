"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header(){

      const [query, setQuery] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false)
  // const [loading, setLoading] = useState(false);
  useEffect(()=>{
    if (!query.trim()) return;
    else if(query.length<=2) return;
    setLoading(true)
    const debounce = setTimeout(()=>{
      router.push(`/search?query=${encodeURIComponent(query)}`)
      setLoading(false)
    },200)
    return () => clearTimeout(debounce);
  },[query,router, setLoading])
    return(
        <header className="relative z-10 p-6 flex justify-center items-center">
        <div className="flex items-center justify-center space-x-1">
          <Link href={"/"}>
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h1 className="block text-2xl font-bold header-gradient">Musify</h1>
          </Link>
          
          <input 
                type="text" 
                placeholder="Search for songs"
                className="input-field pl-14"
                onChange={(e) => setQuery(e.target.value)}
              />
        </div>
        
        {/* <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Discover</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Library</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Playlists</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Artists</a>
        </nav> */}
        
        {/* <div className="flex items-center space-x-4">
          <button className="btn-secondary">Sign In</button>
          <button className="btn-primary">Sign Up</button>
        </div> */}
      </header> 
    )
}