import { useEffect, useState, useRef } from 'react';

export function useSpotifyPlayer(token, onDeviceReady) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Kanye West Fan Site',
        getOAuthToken: (cb) => cb(token),
        volume: 0.8,
      });

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Player ready with device ID:', device_id);
        setDeviceId(device_id);
        if (onDeviceReady) onDeviceReady(device_id);
      });

      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) return;
        setCurrentTrack(state.track_window.current_track);
        setIsPaused(state.paused);
        setPosition(state.position);
        setDuration(state.duration);

        // if track ended (position is 0, paused, and something was playing before)
        if (state.position === 0 && state.paused && state.track_window.previous_tracks.length > 0) {
          spotifyPlayer.nextTrack();
        }

        if (!state.paused) {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => {
            setPosition(prev => prev + 1000);
          }, 1000);
        } else {
          clearInterval(intervalRef.current);
        }
      });

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };

    if (window.Spotify) {
      window.onSpotifyWebPlaybackSDKReady();
    }

    return () => clearInterval(intervalRef.current);
  }, [token]);

  return { player, deviceId, isPaused, currentTrack, position, duration };
}