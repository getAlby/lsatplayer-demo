import { useEffect, useRef, useState, useCallback } from "react";
import AudioVisualizer from "@tiagotrindade/audio-visualizer";

import LSATfetch from './lsat';

function Player({songs}) {
  const [currentObjectUrl, setCurrentObjectUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState({});
  const audioRef = useRef();
  const intervalRef = useRef();
  const isReady = useRef(false);

  const startTimer = () => {
    // Clear any timers already running
    clearInterval(intervalRef.current);

    // check if the currenty track ended and play the next song
    intervalRef.current = setInterval(() => {
      if (audioRef.current.ended) {
        //URL.revokeObjectURL(currentObjectUrl);
        next();
      }
    }, [1000]);
  }


  const next = useCallback(() => {
    if (currentIndex < songs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  }, [currentIndex, songs.length]);


  const play = useCallback(async (index) => {
    console.log("play");
    const nextSong = songs[index];
    if (!nextSong) { return; }
    audioRef.current.pause();
    setCurrentSong(nextSong);
    let response;
    try {
      if (!window.webln) {
        throw new Error("No webln available");
      }
      response = await LSATfetch(nextSong.url, { cache: "no-store" }, window.localStorage);

    } catch(e) {
      // if something goes wrong fetch the song without lsat
      console.error(e);
      response = await fetch(nextSong.url, { cache: "no-store" });
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    setCurrentObjectUrl(objectUrl);
    audioRef.current.src = objectUrl;
    audioRef.current.load();
    audioRef.current.play();

    // Clear any timers already running
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (audioRef.current.ended) {
        next();
      }
    }, [1000]);

  }, [songs, next]);


  useEffect(() => {
    if (isPlaying) {
      play(currentIndex);
      //audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isReady.current) {
      setIsPlaying(true);
      play(currentIndex);
    } else {
      // Set the isReady ref as true for the next pass
      isReady.current = true;
    }
  }, [currentIndex, play]);

  return (
    <div className="w-96 m-auto">
      <div className="text-center">
        <button className="btn primary mx-4" onClick={() => { setIsPlaying(true) }}>Play</button>
        <button className="btn primary mx-4" onClick={() => { setIsPlaying(false) } }>Stop</button>
      </div>
      <AudioVisualizer audio={audioRef} className="w-full h-24" />
      <ul className="text-gray-900 dark:text-white menu bg-base-100 w-auto max-h-96 overflow-scroll">
        {songs.map((s, index) => {
          return (
            <li key={index} className="bordered">
              <a className={s.id === currentSong.id ? "active" : ""} onClick={(e) => { e.preventDefault(); setCurrentIndex(index); setIsPlaying(true); } }>
                {s.name} ({s.ln_address})
              </a>
            </li>
          );
        })}
      </ul>
      <audio ref={audioRef}></audio>
    </div>
  );
}

export default Player;
