import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import AudioVisualizer from "./AudioVisualizer"; //@tiagotrindade/audio-visualizer";

import stopIcon from "./stop.svg";
import playIcon from "./play.svg";

import LSATfetch from './lsat';

function Player({songs}) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  // const [currentObjectUrl, setCurrentObjectUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState({});

  const [weblnEnabled, setWeblnEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  //const [audioContext, setAudioContext] = useState(new AudioContext());
  //const [audioAnalyzer, setAudioAnalyzer] = useState(audioContext.createAnalyser());
  const [audioContext, setAudioContext] = useState();
  const [audioAnalyzer, setAudioAnalyzer] = useState();
  const [track, setTrack] = useState();
  const audioRef = useRef();
  const isReady = useRef(false);


  const next = () => {
    if (currentIndex < songs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  }

  /**
   * Get an object URL for the current blob. Will revoke old URL if blob changes.
   * https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
  function useObjectUrl (blob) {
    const url = useMemo(() => URL.createObjectURL(blob), [blob]);
    useEffect(() => () => URL.revokeObjectURL(url), [blob]);
    return url;
  }
  */


  const enablePlayer = () => {
    if (!audioContext) {
      const _audioContext = new AudioContext();
      const _audioAnalyzer = _audioContext.createAnalyser();
      _audioAnalyzer.connect(_audioContext.destination)
      if (_audioContext.state === 'suspended') {
        _audioContext.resume();
      }
      setAudioContext(_audioContext)
      setAudioAnalyzer(_audioAnalyzer);
      isReady.current = true;
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  const stop = () => {
    if (track) {
      track.disconnect();
      setTrack(null);
    }
  }

  const playTrack = (index) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  }

  const play = async (index) => {
    if (loading) { return; } // prevent this from being called while the song is loading
    stop(); // stop the potentially playing song
    const nextSong = songs[index];
    if (!nextSong) { return; }
    //audioRef.current.pause();
    setCurrentSong(nextSong);
    setCurrentIndex(index);
    let response;
    try {
      setLoading(true);
      if (!window.webln || !weblnEnabled) {
        throw new Error("No WebLN available or disabled");
      }
      response = await LSATfetch(nextSong.url, { cache: "no-store" }, window.localStorage);
    } catch(e) {
      // if something goes wrong fetch the song without lsat
      console.error(e);
      response = await fetch(nextSong.url, { cache: "no-store" });
    }
    //response = await fetch(nextSong.url, { cache: "no-store" });

    // https://codepen.io/kslstn/pen/pagLqL?editors=1010
    try {
      const buffer = await response.arrayBuffer();
      const decodedAudio = await audioContext.decodeAudioData(buffer);
      const sound = audioContext.createBufferSource();
      sound.addEventListener('ended', () => {
        next();
      });
      const gainNode = audioContext.createGain();
      sound.connect(gainNode).connect(audioAnalyzer).connect(audioContext.destination);
      audioAnalyzer.connect(audioContext.destination)

      sound.buffer = decodedAudio;
      sound.loop = false;
      sound.start(0);
      setLoading(false);
      setTrack(sound);
    } catch(e) {
      setLoading(false);
      console.error(e);
      alert("Failed to play track: " + e.message);
    }
  }

  useEffect(() => {
    if (!audioContext) {
      return;
    }
    if (isPlaying) {
      play(currentIndex);
    } else {
      stop();
    }
  }, [currentIndex, isPlaying, audioContext]);

  useEffect(() => {
    return () => {
      if (audioAnalyzer) {
        audioAnalyzer.disconnect();
        audioContext.close();
      }
    }
  }, [audioAnalyzer, audioContext]);


  return (
    <div className="w-96 m-auto">
      <div className="text-center">
        {!isPlaying && (<button className="mx-4 text-6xl" onClick={(e) => { enablePlayer(); playTrack(0); }}><img src={playIcon} alt="Play" className="w-20 h-20" /></button>)}
        {isPlaying && (<button className="mx-4 text-6xl" onClick={() => { setIsPlaying(false) } }><img src={stopIcon} alt="Stop" className="w-20 h-20" /></button>)}
      </div>

      {audioAnalyzer && (<AudioVisualizer analyser={audioAnalyzer} className="w-full h-24"></AudioVisualizer>) }
      <ul className="text-gray-900 dark:text-white menu bg-base-100 w-auto max-h-96 overflow-scroll">
        {songs.map((s, index) => {
          return (
            <li key={index} className="bordered">
              <a className={s.id === currentSong.id ? "active" : ""} onClick={(e) => { e.preventDefault(); enablePlayer(); playTrack(index); } }>
                {s.name} ({s.ln_address})
              </a>
            </li>
          );
        })}
      </ul>
      <audio ref={audioRef} crossOrigin="anonymous"></audio>
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Play full songs and pay the artist with sats</span>
          <input type="checkbox" className="toggle toggle-primary" checked={weblnEnabled} onChange={() => { setWeblnEnabled(!weblnEnabled)}} />
        </label>
      </div>
      <p className="text-center text-sm">{loading && "loading..."}</p>
    </div>
  );
}

export default Player;
