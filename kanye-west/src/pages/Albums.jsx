import { useState, useEffect } from 'react'
import { searchTrack, playTrack } from '../spotify'


const FALLBACK_COVERS = {
  'Watch The Throne': 'https://upload.wikimedia.org/wikipedia/en/7/74/Watch_The_Throne.png',
  'Cruel Summer': 'https://upload.wikimedia.org/wikipedia/en/a/ab/CruelSummercover.jpg',
  'Kids See Ghosts': 'https://upload.wikimedia.org/wikipedia/en/3/35/Kids_See_Ghosts_-_Kids_See_Ghosts.png',
  'Donda 2': 'https://upload.wikimedia.org/wikipedia/en/6/6d/Donda_2_cover.png',
  'Vultures 1': 'https://upload.wikimedia.org/wikipedia/en/3/3a/Vultures_1_album_cover.jpg',
}

async function fetchAlbumCovers(token, albumData) {
  const results = await Promise.all(
    albumData.map(async (album) => {
      try {
        const res = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(album.name + ' Kanye West')}&type=album&limit=1`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        )
        const data = await res.json()
        const spotifyAlbum = data.albums?.items?.[0]
        const cover = spotifyAlbum?.images?.[0]?.url || FALLBACK_COVERS[album.name] || null
        return { ...album, cover }
      } catch {
        return { ...album, cover: FALLBACK_COVERS[album.name] || null }
      }
    })
  )
  return results
}

function Albums({ token, deviceId }) {
  const rawAlbumData = [
    { name: 'The College Dropout', year: '2004', tracks: ['We Don\'t Care', 'Graduation Day', 'All Falls Down', 'I\'ll Fly Away', 'Spaceship', 'Jesus Walks', 'Never Let Me Down', 'Get Em High', 'Workout Plan', 'The New Workout Plan', 'Slow Jamz', 'Breathe In Breathe Out', 'School Spirit', 'Two Words', 'Through The Wire', 'Family Business', 'Last Call'] },
    { name: 'Late Registration', year: '2005', tracks: ['Wake Up Mr. West', 'Heard \'Em Say', 'Touch The Sky', 'Gold Digger', 'Drive Slow', 'My Way Home', 'Crack Music', 'Roses', 'Gone', 'Diamonds From Sierra Leone', 'We Major', 'Hey Mama', 'Celebration', 'Gone', 'Diamonds'] },
    { name: 'Graduation', year: '2007', tracks: ['Good Morning', 'Champion', 'Stronger', 'I Wonder', 'Good Life', 'Can\'t Tell Me Nothing', 'Barry Bonds', 'Drunk And Hot Girls', 'Flashing Lights', 'Everything I Am', 'The Glory', 'Homecoming', 'Big Brother'] },
    { name: '808s & Heartbreak', year: '2008', tracks: ['Say You Will', 'Welcome To Heartbreak', 'Heartless', 'Amazing', 'Love Lockdown', 'Paranoid', 'RoboCop', 'Street Lights', 'Bad News', 'See You In My Nightmares', 'Coldest Winter', 'Pinocchio Story'] },
    { name: 'My Beautiful Dark Twisted Fantasy', year: '2010', tracks: ['Dark Fantasy', 'Gorgeous', 'Power', 'All Of The Lights', 'Monster', 'So Appalled', 'Devil In A New Dress', 'Runaway', 'Hell Of A Life', 'Blame Game', 'Lost In The World', 'Who Will Survive In America'] },
    { name: 'Watch The Throne', year: '2011', tracks: ['No Church In The Wild', 'Lift Off', 'Niggas In Paris', 'Otis', 'Gotta Have It', 'New Day', 'That\'s My Bitch', 'Welcome To The Jungle', 'Who Gon Stop Me', 'Murder To Excellence', 'Sweet Baby Jesus', 'Why I Love You'] },
    { name: 'Cruel Summer', year: '2012', tracks: ['To The World', 'Clique', 'Mercy', 'New God Flow', 'Cold', 'Cruel Summer', 'Don\'t Like', 'Mercy', 'Big Sean'] },
    { name: 'Yeezus', year: '2013', tracks: ['On Sight', 'Black Skinhead', 'I Am A God', 'New Slaves', 'Hold My Liquor', 'I\'m In It', 'Blood On The Leaves', 'Guilt Trip', 'Send It Up', 'Bound 2'] },
    { name: 'The Life of Pablo', year: '2016', tracks: ['Ultralight Beam', 'Father Stretch My Hands Pt. 1', 'Father Stretch My Hands Pt. 2', 'Famous', 'Feedback', 'Low Lights', 'Highlights', 'Freestyle 4', 'I Love Kanye', 'Waves', 'FML', 'Real Friends', 'Wolves', 'Frank\'s Track', 'Siiiiiiinnnnnnn', 'Fade'] },
    { name: 'ye', year: '2018', tracks: ['I Thought About Killing You', 'Yikes', 'All Mine', 'Wouldn\'t Leave', 'No Mistakes', 'Ghost Town', 'Violent Crimes'] },
    { name: 'Kids See Ghosts', year: '2018', tracks: ['Feel The Love', 'Fire', 'Four Doors', 'Freee', 'Kids See Ghosts', '0-100', 'Cudi Montage'] },
    { name: 'Jesus Is King', year: '2019', tracks: ['Every Hour', 'Closed On Sunday', 'Follow God', 'On God', 'Everything We Need', 'Water', 'God Is', 'Hands On', 'Use This Gospel', 'Jesus Is Lord'] },
    { name: 'Donda', year: '2021', tracks: ['Donda Chant', 'Jail', 'God Breathed', 'Off The Grid', 'Hurricane', 'Praise God', 'Jonah', 'Ok Ok', 'Junya', 'Believe What I Say', 'Sunday 12:22', 'Pure Souls', 'Come To Life', 'No Child Left Behind'] },
    { name: 'Donda 2', year: '2022', tracks: ['True Love', 'Broken Road', 'Get Lost', 'Happy', 'Flowers', 'Security', 'Too Easy', 'Crown', 'Pablo', 'Sci-Fi'] },
    { name: 'Vultures 1', year: '2024', tracks: ['Stars', 'Keys To My Life', 'Vultures', 'Paid', 'Hoodrat', 'Burn', 'Beautiful', 'Problematic', 'Gun Road', 'Good (Don\'t Die)', 'Paperwork', 'Carnival', 'Talking'] },
  ]

  const [albumData, setAlbumData] = useState(rawAlbumData)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [playingTrack, setPlayingTrack] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    fetchAlbumCovers(token, rawAlbumData).then(setAlbumData)
  }, [token])

  const handleTrackClick = async (track, album) => {
    if (!token || !deviceId) return
    setLoading(true)
    setPlayingTrack(track)
    const allUris = await Promise.all(
      album.tracks.map(t => searchTrack(t, 'Kanye West', token))
    )
    const filteredUris = allUris.filter(Boolean)
    const trackUri = await searchTrack(track, 'Kanye West', token)
    if (trackUri) await playTrack(deviceId, trackUri, token, filteredUris)
    setLoading(false)
  }

  return (
    <div className="albums-page">
      <h2 className="page-title">Discography</h2>
      <div className={`albums-container ${selectedAlbum ? 'split' : ''}`}>
        <div className="albums-grid">
          {albumData.map((album, i) => (
            <div className="album-card" key={i} onClick={() => setSelectedAlbum(album)}>
              <div
                className="album-cover"
                style={album.cover ? { backgroundImage: `url(${album.cover})` } : { background: '#1a1a1a' }}
              ></div>
              <p className="album-name">{album.name}</p>
              <p className="album-year">{album.year}</p>
            </div>
          ))}
        </div>
        {selectedAlbum && (
          <div className="tracklist">
            <h3 className="tracklist-title">{selectedAlbum.name}</h3>
            <div className="tracklist-tracks">
              {selectedAlbum.tracks.map((track, i) => (
                <p
                  className={`track-item ${playingTrack === track ? 'active' : ''}`}
                  key={i}
                  onClick={() => handleTrackClick(track, selectedAlbum)}
                >
                  <span className="track-num">{loading && playingTrack === track ? '⏳' : i + 1}</span>
                  {track}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Albums