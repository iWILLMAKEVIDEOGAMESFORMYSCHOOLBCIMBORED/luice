import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMusic } from '../context/MusicContext';

export default function DriveStatusBanner() {
  const { driveLoading, driveLoaded, driveError, driveSongCount, reloadDrive } = useMusic();
  const opacity = useRef(new Animated.Value(0)).current;
  const visible = driveLoading || driveError;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible && !driveLoaded) return null;

  return (
    <Animated.View style={[styles.banner, { opacity }]}>
      {driveLoading && (
        <View style={styles.row}>
          <Ionicons name="cloud-download-outline" size={14} color="#D7BDE2" />
          <Text style={styles.text}>Loading songs from your Drive...</Text>
        </View>
      )}
      {driveError && (
        <TouchableOpacity style={styles.row} onPress={reloadDrive}>
          <Ionicons name="warning-outline" size={14} color="#E74C3C" />
          <Text style={[styles.text, { color: '#E74C3C' }]}>Drive error — tap to retry</Text>
        </TouchableOpacity>
      )}
      {driveLoaded && !driveLoading && (
        <View style={styles.row}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#2ECC71" />
          <Text style={[styles.text, { color: '#2ECC71' }]}>
            {driveSongCount} songs loaded from your Drive 🍇
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(26,10,46,0.95)',
    paddingVertical: 8, paddingHorizontal: 16,
    zIndex: 9999,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155,89,182,0.3)',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { color: '#D7BDE2', fontSize: 12, fontWeight: '500' },
});
