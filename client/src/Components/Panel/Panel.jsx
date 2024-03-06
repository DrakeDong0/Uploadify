import React, { useEffect, useState } from 'react';
import './Panel.css';
import { useNavigate } from 'react-router-dom';
import default_pfp from '../../assets/default_pfp.jpg'

export default function Panel({ token }) {
  
  const [spotifyUsername, setSpotifyUsername] = useState('placeholder');
  const [numberOfPlaylists, setNumberOfPlaylists] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);
  const [playlists, setPlaylists] = useState([]);
  const [checkedPlaylists, setCheckedPlaylists] = useState({});
  const [spotifyProfileImage, setSpotifyProfileImage] = useState('');
  const [spotifyUserID, setspotifyUserID] = useState('');
  const [checkedAll, setCheckedAll] = useState(false);
  const [playlistTracks, setPlaylistTracks] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [upload_playlists, setUploadPlaylists] = useState('');
  const [upload_tracks, setUploadTracks] = useState('');
  const navigate = useNavigate();

  const handleDelete = () => {
    const remainingPlaylists = playlists.filter(playlist => !checkedPlaylists[playlist.id]);
    setPlaylists(remainingPlaylists);
    const resetCheckedPlaylists = {};
    remainingPlaylists.forEach(playlist => {
        resetCheckedPlaylists[playlist.id] = false;
    });
    setCheckedPlaylists(resetCheckedPlaylists);
    setCheckedAll(false);
};

const handleCheckboxChange = (id, checked) => {
    setCheckedPlaylists(prev => ({
        ...prev,
        [id]: checked
    }));
};

const handleCheckedAll = () => {
    const newCheckedPlaylists = {};
    playlists.forEach(playlist => {
        newCheckedPlaylists[playlist.id] = !checkedAll;
    });
    setCheckedPlaylists(newCheckedPlaylists);
    setCheckedAll(!checkedAll); 
};

const uploadAndAddPlaylists = (event) => {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const result = e.target.result;
        const importedPlaylists = JSON.parse(result);
        let updatedPlaylists = [];
        importedPlaylists.forEach(importedPlaylist => {
            const base64Image = importedPlaylist.image; 
            const newPlaylist = {
                ...importedPlaylist,
                base64Image: base64Image, 
            };
            updatedPlaylists.push(newPlaylist);
        });
        setPlaylists(updatedPlaylists); 

    };

    reader.readAsText(file);
};

async function convertImageToBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

function handleLogout() {
    navigate('/'); 
}
  
function confirmCopy(){
    document.getElementById('confirm-bg').classList.remove('hidden');
    let totalUploadTracks = 0;
    let totalUploadPlaylists = 0;
    for( const playlistId in checkedPlaylists){
        if(checkedPlaylists[playlistId]){
            totalUploadPlaylists++;
            const playlistU = playlists.find(p => p.id.toString() === playlistId);
            if (playlistU) {
                totalUploadTracks += playlistU.tracks.length;
            }
        }
    }
    setUploadPlaylists(totalUploadPlaylists);
    setUploadTracks(totalUploadTracks);
} 
function cancelConfirm(){
    setUploadPlaylists(0);
    setUploadTracks(0);
    document.getElementById('confirm-bg').classList.add('hidden');
}
async function copyPlaylistsToUserAccount() {
    for (const playlistId of Object.keys(checkedPlaylists)) {
        if (checkedPlaylists[playlistId]) {
            const playlist = playlists.find(p => p.id === playlistId);
            if (playlist) {
                try {
                    const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${spotifyUserID}/playlists`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: playlist.name,
                            description: '', 
                            public: false, 
                        }),
                    });
                    const createdPlaylist = await createPlaylistResponse.json();
                    const trackUris = playlist.tracks.map(track => track.track.uri);
                    const batchSize = 100;
                    for (let i = 0; i < trackUris.length; i += batchSize) {
                        const batch = trackUris.slice(i, i + batchSize);
                        await fetch(`https://api.spotify.com/v1/playlists/${createdPlaylist.id}/tracks`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                uris: batch,
                            }),
                        });
                    }
                    alert(`Playlist "${playlist.name}" copied successfully.`);
                } catch (error) {
                    console.error(`Error copying playlist "${playlist.name}": ${error.message}`);
                }
            }
        }
    }
}

  useEffect(() => {
    if (!token) return;
    const getTotalTracks = async () => {
      const fetchOptions = {
          method: 'GET',
          headers: { 'Authorization': 'Bearer ' + token }
      };
      let total = 0;
      let offset = 0;
      let hasMore = true;
      while (hasMore) {
          let response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=50&offset=${offset}`, fetchOptions);
          let data = await response.json();
          if (!data.items || data.items.length === 0) {
              hasMore = false;
              break;
          }
          for (let playlist of data.items) {
              total += playlist.tracks.total;
              setTotalTracks(total);
              await new Promise(resolve => setTimeout(resolve, 300));
          }
          offset += data.items.length;
          hasMore = data.items.length === 50;
      }
  };

  const fetchPlaylistTracks = async (playlistId) => {
    let tracks = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&offset=${offset}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            hasMore = false;
            break;
        }

        tracks = tracks.concat(data.items);
        offset += data.items.length;
        hasMore = data.items.length === 100;
    }

    return tracks;
}

    const fetchSpotifyProfile = async () => {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setSpotifyUsername(data.display_name);
      setSpotifyProfileImage(data.images[0]?.url || '');
      setspotifyUserID(data.id);
    };

    const fetchPlaylists = async () => {
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        setNumberOfPlaylists(data.total);
      
        for (const playlist of data.items) {
          let base64Image = ''; 
          if (playlist.images.length > 0) {
            base64Image = await convertImageToBase64(playlist.images[0].url);
          }
      
          const tracks = await fetchPlaylistTracks(playlist.id);
          const newPlaylist = {
              ...playlist,
              base64Image, 
              tracks,
          };
          setPlaylists(prevPlaylists => {
              if (prevPlaylists.some(p => p.id === newPlaylist.id)) {
                  return prevPlaylists;
              }
              return [...prevPlaylists, newPlaylist];
          });
          setPlaylistTracks(prevTracks => ({
              ...prevTracks,
              [playlist.id]: tracks
          }));
        }
      };
      
      

    fetchSpotifyProfile();
    fetchPlaylists();
    getTotalTracks();

  }, [token]);

function handleChange(event) {
    setSearchQuery(event.target.value.toLowerCase());
}
const filteredPlaylists = searchQuery
? playlists.filter(playlist => playlist.name.toLowerCase().includes(searchQuery))
: playlists;

function downloadSelectedPlaylists() {
    const selectedPlaylists = playlists.filter(playlist => checkedPlaylists[playlist.id]);
  
    const dataToDownload = selectedPlaylists.map(playlist => {
      return {
        id: playlist.id,
        name: playlist.name,
        image: playlist.base64Image,
        tracks: playlistTracks[playlist.id]
      };
    });
  
    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'selected-playlists.json'; 
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link); 
  }


return (
    <>
        <div id="confirm-bg" className="hidden">
            <div className="confirm-text">
                <button onClick={cancelConfirm}className="cancel-btn">X</button>
                <p>Confirm the upload of {upload_playlists} playlists and {upload_tracks} tracks?</p>
                <button onClick={copyPlaylistsToUserAccount} className="confirm-btn">Confirm</button>
            </div>
        </div>

        <div className="Left-Panel">
            <div className="Left-Top-Container">
                {spotifyUsername && <h1 id="name">Welcome, {spotifyUsername}</h1>}
                <div className="import-export-buttons">
                    <label htmlFor="file-upload" className="export">Import JSON</label>
                    <input id="file-upload" type="file" accept="application/json" onChange={uploadAndAddPlaylists} style={{display: 'none'}} />
                    <button className="export" onClick={downloadSelectedPlaylists}>Export as JSON</button>
                </div>
                <h1>Summary:</h1>
                <div className="summary-text">
                    <div>Playlists Imported: {numberOfPlaylists}</div>
                    <div>Songs imported: {totalTracks}</div>
                </div>
                <p className="fade-text">Edits here are only saved once you hit the button below.</p>
                <button onClick={confirmCopy} className="save-btn">Save to Account</button>
            </div>
        </div>
        <div className="Right-Panel"></div>
        <div className="playlist-container">
            {filteredPlaylists.map(playlist => (
                <div key={playlist.id} className={`playlist-block ${checkedPlaylists[playlist.id] ? 'checked' : ''}`}>
                <div className="playlist-details-container">
                    {playlist.base64Image ? (
                        <img src={playlist.base64Image} alt={`${playlist.name}`} className="playlist-image" />)
                        : <div className="placeholder-image">Image Not Available</div>     
                    }
                    <div className="playlist-info">
                        <div className='info-row'>
                            <span className="playlist-name">{playlist.name}</span>
                            <input type="checkbox" className="playlist-checkbox" checked={!!checkedPlaylists[playlist.id]} onChange={(e) => handleCheckboxChange(playlist.id, e.target.checked)} />
                        </div>
                        <span className="playlist-length">Tracks: {playlist.tracks?.length || 'Loading...'}</span>
                    </div>
                </div>

                <div className="div-line"></div>
                <div className="tracks-container">
                    {playlistTracks[playlist.id] && playlistTracks[playlist.id].map((track, index) => (
                        <div key={index} className="track">{track.track.name} - {track.track.artists.map(artist => artist.name).join(', ')}</div>
                    ))}
                </div>
            </div>
            ))}
            </div>

            <div className='header-container'>
                <form>
                    <div className="search-bar">
                        <span className="search-icon material-symbols-outlined">search</span>
                        <input className="search-input" type="search" placeholder="Search" onChange={handleChange} />
                    </div>
                </form>
                <div className="checkbox-container">
                    <input id="select=all" type="checkbox" onChange={handleCheckedAll} checked={checkedAll}/>
                    <label htmlFor="select-all">Select All</label>
                </div>
                <div className="vertical-line"></div>
                <button class="delete-button" onClick={handleDelete} type="button">
                    <span className="material-symbols-outlined">delete</span>
                    <p>Delete</p>
                </button>
                <div className="vertical-line"></div>
                <button className="logout-button" onClick={handleLogout} type="button">
                    <span class="material-symbols-outlined">logout</span>
                    <p>Logout</p>
                </button>
                <div className="vertical-line"></div>
                {
                spotifyProfileImage ? (
                    <a target="_blank" href={`https://open.spotify.com/user/${spotifyUserID}`}>
                        <img id="pfp" src={spotifyProfileImage} alt="Spotify Profile" />
                    </a>
                    ) : (
                        <img id="pfp" src={default_pfp} alt="Default Profile" />
                    )}
            </div>
    </>
);
}
