import React, { useState, useRef, useEffect } from "react";
import "./MusicPlayer.css";

const MusicPlayer = () => {
  // Şarkı listesi - public klasöründeki dosyalar
  const playlist = [
    { id: 1, name: "Ran Raiten - Keeping Routine", src: "/music/track1.mp3" },
    { id: 2, name: "Track 2", src: "/music/track2.mp3" },
    { id: 3, name: "Track 3", src: "/music/track3.mp3" },
    { id: 4, name: "Track 4", src: "/music/track4.mp3" },
    { id: 5, name: "Track 5", src: "/music/track5.mp3" }
  ];

  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play next track when current track ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const newTrack = currentTrack < playlist.length - 1 ? currentTrack + 1 : 0;
      setCurrentTrack(newTrack);
      setIsPlaying(false);
    };
    
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, playlist.length]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const previousTrack = () => {
    const newTrack = currentTrack > 0 ? currentTrack - 1 : playlist.length - 1;
    setCurrentTrack(newTrack);
    setIsPlaying(false);
  };

  const nextTrack = () => {
    const newTrack = currentTrack < playlist.length - 1 ? currentTrack + 1 : 0;
    setCurrentTrack(newTrack);
    setIsPlaying(false);
  };

  return (
    <div className="music-player">
      <audio 
        ref={audioRef}
        src={playlist[currentTrack].src}
        preload="metadata"
      />
      
      {/* Control Buttons */}
      <div className="controls-row">
        {/* Previous Button */}
        <button 
          className="retro-btn prev-btn" 
          onClick={previousTrack}
          title="Previous"
        >
          ⏮
        </button>

        {/* Play/Pause Button */}
        <button 
          className="retro-btn play-pause-btn" 
          onClick={togglePlay}
          title={isPlaying ? "Pause" : "Play"}
        >
          <img 
            src="/play-pause.png" 
            alt={isPlaying ? "Pause" : "Play"}
            className="play-pause-icon"
          />
        </button>

        {/* Next Button */}
        <button 
          className="retro-btn next-btn" 
          onClick={nextTrack}
          title="Next"
        >
          ⏭
        </button>
      </div>
      
      {/* Song Title */}
      <div className="song-title">
        {playlist[currentTrack].name}
      </div>
    </div>
  );
};

export default MusicPlayer; 