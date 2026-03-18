import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
  Modal, Image, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import YoutubeIframe from 'react-native-youtube-iframe';
import { useMusic } from '../context/MusicContext';
import { formatDuration } from '../data/songs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function FullPlayer() {
  const {
    currentSong, isPlaying, togglePlay, playNext, playPrev,
    playerExpanded, setPlayerExpanded, queue, playSong,
    toggleLike, isLiked, progress,
  } = useMusic();
  const [showQueue, setShowQueue] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const insets = useSafeAreaInsets();

  const onYTStateChange = useCallback((state) => {
    if (state === 'ended') playNext();
  }, [playNext]);

  if (!currentSong || !playerExpanded) return null;

  const likedSong = isLiked(currentSong.id);
  const isDriveSource = currentSong.source === 'googledrive';
  const progressPct = `${Math.round((progress || 0) * 100)}%`;
  const elapsed = currentSong.duration ? Math.round(progress * currentSong.duration) : 0;

  return (
    <Modal visible={playerExpanded} animationType="slide" presentationStyle="fullScreen" statusBarTranslucent>
      <LinearGradient
        colors={['#1A0A2E', '#0D0D1A', '#0A0A0F']}
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setPlayerExpanded(false)} style={styles.iconBtn}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.nowPlaying}>NOW PLAYING</Text>
            <View style={styles.sourceRow}>
              {isDriveSource ? (
                <View style={styles.sourceBadge}>
                  <Ionicons name="cloud" size={10} color="#D7BDE2" />
                  <Text style={styles.sourceBadgeText}> DRIVE</Text>
                </View>
              ) : (
                <View style={[styles.sourceBadge, { backgroundColor: 'rgba(255,0,0,0.2)' }]}>
                  <Ionicons name="logo-youtube" size={10} color="#FF6B6B" />
                  <Text style={[styles.sourceBadgeText, { color: '#FF6B6B' }]}> YOUTUBE</Text>
                </View>
              )}
              {currentSong.type === 'unreleased' && (
                <View style={[styles.sourceBadge, { backgroundColor: 'rgba(155,89,182,0.3)' }]}>
                  <Text style={styles.sourceBadgeText}>🔒 VAULT</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowQueue(!showQueue)} style={styles.iconBtn}>
            <Ionicons name="list" size={22} color={showQueue ? '#9B59B6' : '#888'} />
          </TouchableOpacity>
        </View>

        {!showQueue ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

            {/* Album Art */}
            <View style={styles.artWrap}>
              <Image source={{ uri: currentSong.albumArt }} style={styles.art} />
              <View style={styles.artShadow} />
            </View>

            {/* YouTube Player (hidden) — only for non-Drive songs */}
            {!isDriveSource && currentSong.videoId && (
              <View style={styles.ytHidden}>
                <YoutubeIframe
                  height={160}
                  width={width - 32}
                  videoId={currentSong.videoId}
                  play={isPlaying}
                  onChangeState={onYTStateChange}
                  webViewStyle={{ opacity: 0.01 }}
                  initialPlayerParams={{ controls: false, modestbranding: true, rel: false }}
                />
              </View>
            )}

            {/* Drive source: AudioPlayer handles it invisibly */}
            {isDriveSource && (
              <View style={styles.driveBadgeRow}>
                <Ionicons name="cloud-done-outline" size={14} color="#9B59B6" />
                <Text style={styles.driveText}>Streaming from your Google Drive</Text>
              </View>
            )}

            {/* Song Info */}
            <View style={styles.songInfo}>
              <View style={styles.songInfoLeft}>
                <Text style={styles.songTitle} numberOfLines={1}>{currentSong.title}</Text>
                <Text style={styles.songArtist}>Juice WRLD</Text>
                <Text style={styles.songAlbum}>{currentSong.album} • {currentSong.year}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleLike(currentSong.id)} style={styles.iconBtn}>
                <Ionicons name={likedSong ? 'heart' : 'heart-outline'} size={26} color={likedSong ? '#9B59B6' : '#555'} />
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: progressPct }]} />
                <View style={[styles.progressThumb, { left: progressPct }]} />
              </View>
              <View style={styles.progressTimes}>
                <Text style={styles.timeText}>
                  {elapsed > 0 ? formatDuration(elapsed) : '0:00'}
                </Text>
                <Text style={styles.timeText}>
                  {currentSong.duration > 0 ? `-${formatDuration(currentSong.duration - elapsed)}` : '--:--'}
                </Text>
              </View>
            </View>

            {/* Main Controls */}
            <View style={styles.controls}>
              <TouchableOpacity onPress={playPrev} style={styles.iconBtn}>
                <Ionicons name="play-skip-back" size={26} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
                <LinearGradient colors={['#9B59B6', '#6C3483']} style={styles.playBtnGrad}>
                  {isPlaying
                    ? <Ionicons name="pause" size={32} color="#fff" />
                    : <Ionicons name="play" size={32} color="#fff" style={{ marginLeft: 4 }} />
                  }
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={playNext} style={styles.iconBtn}>
                <Ionicons name="play-skip-forward" size={26} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Secondary Controls */}
            <View style={styles.secondaryControls}>
              <TouchableOpacity
                style={[styles.secondaryBtn, shuffle && styles.secondaryBtnActive]}
                onPress={() => setShuffle(p => !p)}
              >
                <Ionicons name="shuffle" size={20} color={shuffle ? '#9B59B6' : '#555'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryBtn, repeat && styles.secondaryBtnActive]}
                onPress={() => setRepeat(p => !p)}
              >
                <Ionicons name="repeat" size={20} color={repeat ? '#9B59B6' : '#555'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn}>
                <Ionicons name="share-outline" size={20} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#555" />
              </TouchableOpacity>
            </View>

          </ScrollView>
        ) : (
          /* Queue View */
          <View style={styles.queueWrap}>
            <View style={styles.queueHeaderRow}>
              <Text style={styles.queueTitle}>Up Next</Text>
              <Text style={styles.queueCount}>{queue.length} songs</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {queue.map((song) => (
                <TouchableOpacity
                  key={song.id}
                  style={[styles.queueRow, currentSong.id === song.id && styles.queueRowActive]}
                  onPress={() => playSong(song, queue)}
                >
                  <Image source={{ uri: song.albumArt }} style={styles.queueArt} />
                  <View style={styles.queueInfo}>
                    <Text
                      style={[styles.queueSongTitle, currentSong.id === song.id && styles.queueSongActive]}
                      numberOfLines={1}
                    >
                      {song.title}
                    </Text>
                    <View style={styles.queueMetaRow}>
                      {song.source === 'googledrive' && (
                        <Ionicons name="cloud" size={10} color="#9B59B6" style={{ marginRight: 3 }} />
                      )}
                      <Text style={styles.queueMeta}>{song.year}</Text>
                      {song.duration > 0 && <Text style={styles.queueMeta}> • {formatDuration(song.duration)}</Text>}
                    </View>
                  </View>
                  {currentSong.id === song.id && (
                    <Ionicons name="musical-notes" size={16} color="#9B59B6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 20 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center', flex: 1 },
  nowPlaying: { color: '#666', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  sourceRow: { flexDirection: 'row', gap: 6 },
  sourceBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(155,89,182,0.2)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  sourceBadgeText: { color: '#D7BDE2', fontSize: 9, fontWeight: '700' },

  artWrap: { alignItems: 'center', marginVertical: 24, position: 'relative' },
  art: {
    width: width - 72, height: width - 72, borderRadius: 20,
    shadowColor: '#9B59B6', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4, shadowRadius: 24,
  },
  artShadow: {
    position: 'absolute', bottom: -16,
    width: width - 120, height: 30, borderRadius: 40,
    backgroundColor: 'rgba(155,89,182,0.3)',
    shadowColor: '#9B59B6', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 20,
  },

  ytHidden: { height: 1, overflow: 'hidden', marginBottom: 4 },

  driveBadgeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, marginBottom: 8,
  },
  driveText: { color: '#9B59B6', fontSize: 11, fontWeight: '500' },

  songInfo: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 24, marginBottom: 20 },
  songInfoLeft: { flex: 1 },
  songTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  songArtist: { fontSize: 15, color: '#9B59B6', fontWeight: '600', marginBottom: 2 },
  songAlbum: { fontSize: 12, color: '#555' },

  progressWrap: { paddingHorizontal: 24, marginBottom: 32 },
  progressTrack: { height: 4, backgroundColor: '#2A2A35', borderRadius: 2, marginBottom: 8, position: 'relative' },
  progressFill: { height: '100%', backgroundColor: '#9B59B6', borderRadius: 2 },
  progressThumb: {
    position: 'absolute', top: -5, marginLeft: -7,
    width: 14, height: 14, borderRadius: 7, backgroundColor: '#fff',
  },
  progressTimes: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { color: '#555', fontSize: 11 },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, marginBottom: 28 },
  playBtn: {
    shadowColor: '#9B59B6', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 14,
  },
  playBtnGrad: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },

  secondaryControls: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingBottom: 12 },
  secondaryBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111118', borderRadius: 12 },
  secondaryBtnActive: { backgroundColor: 'rgba(155,89,182,0.15)' },

  queueWrap: { flex: 1, paddingHorizontal: 16 },
  queueHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  queueTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  queueCount: { color: '#555', fontSize: 13 },
  queueRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderRadius: 10, marginBottom: 2 },
  queueRowActive: { backgroundColor: 'rgba(155,89,182,0.12)' },
  queueArt: { width: 44, height: 44, borderRadius: 8, marginRight: 12 },
  queueInfo: { flex: 1 },
  queueSongTitle: { color: '#999', fontSize: 14, fontWeight: '500', marginBottom: 2 },
  queueSongActive: { color: '#D7BDE2', fontWeight: '700' },
  queueMetaRow: { flexDirection: 'row', alignItems: 'center' },
  queueMeta: { color: '#444', fontSize: 11 },
});
