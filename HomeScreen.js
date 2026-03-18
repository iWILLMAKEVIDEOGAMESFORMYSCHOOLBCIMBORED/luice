/**
 * AudioPlayer.js
 *
 * Invisible component that handles actual audio playback using expo-av.
 * Supports both Google Drive MP3 streams and YouTube fallback.
 *
 * Mount this once inside MusicProvider — it watches currentSong & isPlaying
 * and controls the Audio.Sound object accordingly.
 */

import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { useMusic } from '../context/MusicContext';
import { getStreamUrl } from '../services/GoogleDriveService';

// Configure audio session for background playback
Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: true,
  interruptionModeIOS: 1, // DoNotMix
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  interruptionModeAndroid: 1,
  playThroughEarpieceAndroid: false,
}).catch(() => {});

export default function AudioPlayer() {
  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    setProgress,
    playNext,
    soundRef,
  } = useMusic();

  const loadedSongIdRef = useRef(null);
  const progressTimer = useRef(null);

  // ── Unload current sound ───────────────────────────────────
  const unloadSound = useCallback(async () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (_) {}
      soundRef.current = null;
    }
    loadedSongIdRef.current = null;
  }, [soundRef]);

  // ── Load and play a song ──────────────────────────────────
  const loadAndPlay = useCallback(async (song) => {
    await unloadSound();
    if (!song) return;

    // Determine the audio URI
    // Priority: Drive stream URL > YouTube (no direct audio from YT without yt-dlp)
    let uri = null;
    if (song.source === 'googledrive' && song.driveFileId) {
      uri = getStreamUrl(song.driveFileId);
    } else if (song.streamUrl) {
      uri = song.streamUrl;
    }

    if (!uri) {
      console.warn('[AudioPlayer] No stream URL for:', song.title);
      return;
    }

    try {
      console.log('[AudioPlayer] Loading:', song.title);
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      loadedSongIdRef.current = song.id;
    } catch (err) {
      console.error('[AudioPlayer] Load error:', err.message);
      setIsPlaying(false);
    }
  }, [unloadSound, soundRef, setIsPlaying]);

  // ── Playback status callback ──────────────────────────────
  const onPlaybackStatusUpdate = useCallback((status) => {
    if (!status.isLoaded) return;

    if (status.didJustFinish) {
      setIsPlaying(false);
      setProgress(0);
      playNext();
      return;
    }

    if (status.durationMillis && status.durationMillis > 0) {
      setProgress(status.positionMillis / status.durationMillis);
    }
  }, [setIsPlaying, setProgress, playNext]);

  // ── React to song changes ─────────────────────────────────
  useEffect(() => {
    if (!currentSong) return;
    if (currentSong.id === loadedSongIdRef.current) return; // already loaded
    loadAndPlay(currentSong);
  }, [currentSong]);

  // ── React to play/pause changes ──────────────────────────
  useEffect(() => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.playAsync().catch(() => {});
    } else {
      soundRef.current.pauseAsync().catch(() => {});
    }
  }, [isPlaying]);

  // ── Cleanup on unmount ────────────────────────────────────
  useEffect(() => {
    return () => { unloadSound(); };
  }, []);

  return null; // Invisible component
}
