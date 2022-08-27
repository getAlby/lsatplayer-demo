import { useEffect, useRef, useState, useCallback } from "react";
import { Toaster } from 'react-hot-toast';
import Player from './Player';
import Upload from './Upload';

function App({songsUrl, uploadUrl}) {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    async function fetchSongs() {
      const response = await fetch(songsUrl);
      const json = await response.json();
      console.log(json);
      setSongs(json.map((entry) => {
        return {
          id: entry.Id,
          name: entry.Name,
          url: entry.URL,
          ln_address: entry.LNAddress,
        }
      }));
    }
    fetchSongs();
  }, [songsUrl]);

  return (
    <>
      <div><Toaster/></div>
      <div className="from-primary to-secondary text-primary-content bg-gradient-to-br min-h-screen pt-6">
        <div className="text-center p-4 mb-6">
          <p className="text-2xl text-bold mb-2">
            🔊 The Alby WebLN Mixtape
          </p>
          <p>
            Each song costs max. 210 sats which is paid directly to the artist.
          </p>
          <p>Make sure that you have <a href="https://getalby.com" target="_blank" className="underline">Alby</a> installed.<br /><small className="text-sm">(Without a Lightning enabled browser you can listen for 15 seconds without paying)</small></p>
          <p>
            As an artist <a href="#upload" className="underline">upload your track here</a> 🚀
          </p>
        </div>
        {songs.length > 0 ? <Player songs={songs} /> : <></>}
      </div>
      <div className="modal" id="upload">
        <div className="modal-box">
          <Upload url={uploadUrl} />
        </div>
      </div>
    </>
  )

}

export default App;
