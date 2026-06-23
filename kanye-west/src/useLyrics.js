import { useState, useEffect } from 'react';

export function useLyrics(currentTrack) {
  const [lyrics, setLyrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentTrack) return;
    const artist = currentTrack.artists?.[0]?.name;
    const track = currentTrack.name;
    const album = currentTrack.album?.name;
    const duration = Math.floor(currentTrack.duration_ms / 1000);

    setLyrics(null);
    setLoading(true);

    fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(track)}&album_name=${encodeURIComponent(album)}&duration=${duration}`)
      .then(r => r.json())
      .then(data => {
        if (data.syncedLyrics) {
          setLyrics({ type: 'synced', lines: parseSyncedLyrics(data.syncedLyrics) });
        } else if (data.plainLyrics) {
          setLyrics({ type: 'plain', text: data.plainLyrics });
        } else {
          setLyrics(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setLyrics(null);
        setLoading(false);
      });
  }, [currentTrack?.name]);

  return { lyrics, loading };
}

function parseSyncedLyrics(raw) {
  return raw.split('\n').map(line => {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (!match) return null;
    const minutes = parseInt(match[1]);
    const seconds = parseFloat(match[2]);
    const ms = (minutes * 60 + seconds) * 1000;
    return { ms, text: match[3].trim() };
  }).filter(Boolean);
}