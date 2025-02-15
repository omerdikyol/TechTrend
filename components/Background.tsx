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
  interpolate,
  Easing
} from 'react-native-reanimated';
import { useTheme } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface BackgroundProps {
  children: React.ReactNode;
}

export default function Background({ children }: BackgroundProps) {
  const { isDark } = useTheme();
  const animation1 = useSharedValue(0);
  const animation2 = useSharedValue(0);
  const animation3 = useSharedValue(0);

  useEffect(() => {
    // Create three different animations with different timings for a more dynamic effect
    animation1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    animation2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    animation3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const lightStyle1 = useAnimatedStyle(() => {
    const translateX = interpolate(animation1.value, [0, 1], [-width * 0.5, width * 0.5]);
    const translateY = interpolate(animation1.value, [0, 1], [-height * 0.3, height * 0.3]);
    const scale = interpolate(animation1.value, [0, 0.5, 1], [0.8, 1.2, 0.8]);
    
    return {
      transform: [{ translateX }, { translateY }, { scale }],
      opacity: interpolate(animation1.value, [0, 0.5, 1], [0.3, 0.5, 0.3]),
    };
  });

  const lightStyle2 = useAnimatedStyle(() => {
    const translateX = interpolate(animation2.value, [0, 1], [width * 0.5, -width * 0.5]);
    const translateY = interpolate(animation2.value, [0, 1], [height * 0.3, -height * 0.3]);
    const scale = interpolate(animation2.value, [0, 0.5, 1], [0.7, 1.1, 0.7]);
    
    return {
      transform: [{ translateX }, { translateY }, { scale }],
      opacity: interpolate(animation2.value, [0, 0.5, 1], [0.2, 0.4, 0.2]),
    };
  });

  const lightStyle3 = useAnimatedStyle(() => {
    const translateX = interpolate(animation3.value, [0, 1], [-width * 0.3, width * 0.3]);
    const translateY = interpolate(animation3.value, [0, 1], [height * 0.5, -height * 0.5]);
    const scale = interpolate(animation3.value, [0, 0.5, 1], [0.9, 1.3, 0.9]);
    
    return {
      transform: [{ translateX }, { translateY }, { scale }],
      opacity: interpolate(animation3.value, [0, 0.5, 1], [0.25, 0.45, 0.25]),
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Animated light effects */}
      <Animated.View style={[styles.light, lightStyle1, { backgroundColor: isDark ? '#2563eb' : '#60a5fa' }]} />
      <Animated.View style={[styles.light, lightStyle2, { backgroundColor: isDark ? '#7c3aed' : '#a78bfa' }]} />
      <Animated.View style={[styles.light, lightStyle3, { backgroundColor: isDark ? '#2563eb' : '#60a5fa' }]} />
      
      {/* Content container with blur effect */}
      <View style={[styles.content, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)' }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    backdropFilter: 'blur(10px)',
  },
  light: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width / 2,
    opacity: 0.3,
    filter: 'blur(100px)',
  },
});
