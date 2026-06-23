const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = "streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state";
const BACKEND_URL = "https://kanye-west-mtku.onrender.com";

export function loginWithSpotify() {
  const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
  window.location.href = url;
}

export async function exchangeCodeForToken(code) {
  const response = await fetch(`${BACKEND_URL}/callback?code=${code}`);
  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    const expiresAt = Date.now() + (data.expires_in - 60) * 1000;
    localStorage.setItem('token_expires_at', expiresAt);
    return data.access_token;
  }
  return null;
}

export async function refreshAccessToken() {
  const refresh_token = localStorage.getItem('refresh_token');
  if (!refresh_token) return null;
  const response = await fetch(`${BACKEND_URL}/refresh?refresh_token=${refresh_token}`);
  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    const expiresAt = Date.now() + (data.expires_in - 60) * 1000;
    localStorage.setItem('token_expires_at', expiresAt);
    return data.access_token;
  }
  return null;
}

export function getStoredToken() {
  return localStorage.getItem('access_token');
}

export function isTokenExpired() {
  const expiresAt = localStorage.getItem('token_expires_at');
  if (!expiresAt) return true;
  return Date.now() > parseInt(expiresAt);
}

export async function getValidToken() {
  if (isTokenExpired()) {
    return await refreshAccessToken();
  }
  return getStoredToken();
}

export async function playTrack(deviceId, trackUri, token) {
  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [trackUri] }),
  });
}

export async function searchTrack(trackName, artistName, token) {
  const query = encodeURIComponent(`track:${trackName} artist:${artistName}`);
  const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  return data.tracks?.items[0]?.uri || null;
}

export async function getSpotifyProfile(token) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return await response.json();
}

export async function fetchAlbumById(albumId, token) {
  const res = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await res.json()
  return data.images?.[0]?.url || null
}