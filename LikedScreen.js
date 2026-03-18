import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMusic } from '../context/MusicContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, setPlayerExpanded, showPlayer } = useMusic();
  const insets = useSafeAreaInsets();

  if (!currentSong || !showPlayer) return null;

  return (
    <TouchableOpacity
      style={[styles.container, { bottom: 54 + insets.bottom }]}
      onPress={() => setPlayerExpanded(true)}
      activeOpacity={0.95}
    >
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={['rgba(155,89,182,0.15)', 'rgba(10,10,15,0.9)']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {/* Progress bar at top */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '35%' }]} />
          </View>

          <View style={styles.content}>
            <Image source={{ uri: currentSong.albumArt }} style={styles.art} />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
              <Text style={styles.meta}>Juice WRLD • {currentSong.year}</Text>
            </View>
            <View style={styles.controls}>
              <TouchableOpacity onPress={togglePlay} style={styles.btn}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={playNext} style={styles.btn}>
                <Ionicons name="play-skip-forward" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 10,
    right: 10,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 999,
  },
  blur: { overflow: 'hidden', borderRadius: 16 },
  gradient: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(155,89,182,0.3)' },
  progressBar: { height: 2, backgroundColor: 'rgba(255,255,255,0.1)' },
  progressFill: { height: '100%', backgroundColor: '#9B59B6' },
  content: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 10, gap: 10,
  },
  art: { width: 42, height: 42, borderRadius: 8 },
  info: { flex: 1 },
  title: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  meta: { color: '#aaa', fontSize: 11 },
  controls: { flexDirection: 'row', gap: 4 },
  btn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: 'rgba(155,89,182,0.3)' },
});
