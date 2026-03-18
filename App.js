import 'react-native-gesture-handler';
import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import { MusicProvider } from './src/context/MusicContext';
import MiniPlayer from './src/components/MiniPlayer';
import FullPlayer from './src/components/FullPlayer';
import AudioPlayer from './src/components/AudioPlayer';
import DriveStatusBanner from './src/components/DriveStatusBanner';
import OnboardingScreen from './src/screens/OnboardingScreen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const onLayout = useCallback(async () => {
    if (appReady) await SplashScreen.hideAsync();
  }, [appReady]);

  useEffect(() => {
    const t = setTimeout(() => setAppReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (!appReady) return null;

  if (showOnboarding) {
    return (
      <SafeAreaProvider>
        <View style={styles.container} onLayout={onLayout}>
          <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
          <OnboardingScreen onDone={() => setShowOnboarding(false)} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <MusicProvider>
          <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
          <View style={styles.container} onLayout={onLayout}>
            {/* Invisible audio engine */}
            <AudioPlayer />
            {/* App UI */}
            <AppNavigator />
            {/* Drive loading banner */}
            <DriveStatusBanner />
            {/* Persistent mini player */}
            <MiniPlayer />
            {/* Full screen player modal */}
            <FullPlayer />
          </View>
        </MusicProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, backgroundColor: '#0A0A0F' },
});
