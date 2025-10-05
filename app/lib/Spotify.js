// lib/spotify.js
import axios from 'axios';

// The base URLs for the Spotify API
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE_URL = 'https://api.spotify.com/v1';

// Function to get the access token
async function getAccessToken() {
  const authString = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.post(
      TOKEN_URL,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw new Error('Failed to get access token');
  }
}

// Function to get track details

export async function getTrack(trackId) {
  const token = await getAccessToken();

  try {
    const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data
  } catch (error) {
    console.error('Error fetching track:', error.response?.data || error.message);
  }
}


// Function to search for tracks
export default async function searchTrack(query) {
  const token = await getAccessToken();

  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        q: query,
        type: 'track',
        limit: 10 // Get 10 results
      }
    });

    // Map to a simpler, more useful format
    const tracks = response.data.tracks.items.map(t => ({
      id: t.id,
      name: t.name,
      artist: t.artists.map(a => a.name).join(', '),
      album: t.album.name,
      url: t.external_urls.spotify,
      artwork: t.album.images[0]?.url // Use optional chaining for safety
    }));

    return tracks;
  } catch (error) {
    console.error('Error searching track:', error.response?.data || error.message);
    throw new Error('Failed to search for track');
  }
}