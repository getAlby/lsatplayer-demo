import { useEffect, useRef, useState, useCallback } from "react";
import { Toaster } from 'react-hot-toast';
import Player from './Player';
import Upload from './Upload';

import { auth, WebLNProvider } from "alby-js-sdk";

import albyLogo from './alby-logo-figure.svg';
import albyLogoHead from './alby-logo-head.svg';

function App({songsUrl, uploadUrl}) {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    if (window.webln) {
      return;
    }

    let token = {};
    const tokenData = window.localStorage.getItem("albyToken");
    if (tokenData) {
      token = JSON.parse(tokenData);
    }
    const authClient = new auth.OAuth2User({
      client_id: "S08XRny1Iy",
      callback: `${document.location.protocol}//${document.location.host}/callback`,
      scopes: ["payments:send"],
      token: token,
    });
    const provider = new WebLNProvider({auth: authClient});
    provider.on('enable', () => {
      const tokenData = JSON.stringify(provider.auth.token);
      window.localStorage.setItem("albyToken", tokenData);
    });
    provider.on('sendPayment', (result) => {
      console.log('paid: ', result);
    });
    window.webln = provider;
  }, []);

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
          price: entry.Price,
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
        <div className="text-center p-4">
          <p className="text-2xl text-bold mb-2">
            <img src={albyLogoHead} className="w-6 h-6 inline mr-2" />The Alby WebLN Mixtape 🔊
          </p>
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
        <div className="modal-box dark:text-white">
          <Upload url={uploadUrl} />
        </div>
      </div>

    </>
  )

}

export default App;
