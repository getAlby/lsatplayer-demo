import { useEffect, useRef, useState, useCallback } from "react";
import { Toaster } from 'react-hot-toast';
import Player from './Player';
import Upload from './Upload';

import albyLogo from './alby-logo-figure.svg';
import albyLogoHead from './alby-logo-head.svg';

function App({songsUrl, uploadUrl}) {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    async function fetchSongs() {
      const response = await fetch(songsUrl, {
        cache: "no-store",
        headers : {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
         }
      });
      const json = await response.json();
      setSongs(json.map((entry) => {
        return {
          id: entry.Id,
          name: entry.Name,
          url: entry.URL,
          ln_address: entry.LNAddress,
        }
      }));
    }
    if (songsUrl) {
      fetchSongs();
    } else {
      console.log("Songs API not available");
    }
  }, [songsUrl]);

  return (
    <>
      <div><Toaster/></div>
      <div className="from-primary to-secondary text-primary-content bg-gradient-to-br min-h-screen pt-6">
        <div className="text-center p-4 mb-6">
          <p className="text-2xl text-bold mb-2">
            <img src={albyLogoHead} className="w-6 h-6 inline mr-2" />The Alby WebLN Mixtape 🔊
          </p>
          <p>
            Each song costs max. 210 sats which is paid directly to the artist.
          </p>
          <p>For best experience make sure that you have the <a href="https://getalby.com" target="_blank" className="underline">Alby Browser Extension</a> installed and set a budget.<br /><small className="text-sm">(Without a Lightning enabled browser you can listen for 15 seconds without paying)</small></p>
          <p>
            As an artist <a href="#upload" className="underline">upload your track here</a> 🚀
          </p>
        </div>
        {songs.length > 0 ? <Player songs={songs} /> : <></>}
        <div className="text-center">
          <a href="https://getalby.com" target="_blank"><img src={albyLogo} alt="Powered by Alby" className="inline" /></a>
        </div>
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
