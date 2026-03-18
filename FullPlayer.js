import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { JUICE_WRLD_SONGS } from '../data/songs';
import { fetchDriveSongs, GOOGLE_API_KEY } from '../services/GoogleDriveService';

const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  const [allSongs, setAllSongs] = useState(JUICE_WRLD_SONGS);
  const [driveLoaded, setDriveLoaded] = useState(false);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState(null);
  const [driveSongCount, setDriveSongCount] = useState(0);

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerExpanded, setPlayerExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const soundRef = useRef(null);

  useEffect(() => { loadDriveSongs(); }, []);

  const loadDriveSongs = async () => {
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_GOOGLE_DRIVE_API_KEY_HERE') return;
    setDriveLoading(true);
    setDriveError(null);
    try {
      const driveSongs = await fetchDriveSongs();
      if (driveSongs.length > 0) {
        const releasedHardcoded = JUICE_WRLD_SONGS.filter(s => s.type === 'released');
        setAllSongs([...releasedHardcoded, ...driveSongs]);
        setDriveSongCount(driveSongs.length);
        setDriveLoaded(true);
      }
    } catch (err) {
      setDriveError(err.message);
    } finally {
      setDriveLoading(false);
    }
  };

  const playSong = useCallback((song, songList = null) => {
    const list = songList || allSongs;
    const index = list.findIndex(s => s.id === song.id);
    setQueue(list);
    setQueueIndex(index >= 0 ? index : 0);
    setCurrentSong(song);
    setIsPlaying(true);
    setShowPlayer(true);
    setProgress(0);
    setRecentlyPlayed(prev => [song, ...prev.filter(s => s.id !== song.id)].slice(0, 20));
  }, [allSongs]);

  const playNext = useCallback(() => {
    if (!queue.length) return;
    const i = (queueIndex + 1) % queue.length;
    setQueueIndex(i); setCurrentSong(queue[i]); setIsPlaying(true); setProgress(0);
  }, [queue, queueIndex]);

  const playPrev = useCallback(() => {
    if (!queue.length) return;
    const i = queueIndex === 0 ? queue.length - 1 : queueIndex - 1;
    setQueueIndex(i); setCurrentSong(queue[i]); setIsPlaying(true); setProgress(0);
  }, [queue, queueIndex]);

  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);
  const toggleLike = useCallback((id) => setLiked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]), []);
  const isLiked = useCallback((id) => liked.includes(id), [liked]);

  return (
    <MusicContext.Provider value={{
      allSongs,
      releasedSongs: allSongs.filter(s => s.type === 'released'),
      unreleasedSongs: allSongs.filter(s => s.type === 'unreleased'),
      driveLoaded, driveLoading, driveError, driveSongCount,
      reloadDrive: loadDriveSongs,
      currentSong, isPlaying, queue, showPlayer, playerExpanded,
      progress, liked, recentlyPlayed, soundRef,
      playSong, playNext, playPrev, togglePlay, toggleLike, isLiked,
      setShowPlayer, setPlayerExpanded, setProgress, setIsPlaying,
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
};
