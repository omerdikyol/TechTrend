import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import { useTheme } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface BackgroundProps {
  children: React.ReactNode;
}

export default function Background({ children }: BackgroundProps) {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.content]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
