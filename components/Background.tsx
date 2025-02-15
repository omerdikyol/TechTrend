import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(360, {
          duration: 20000,
          easing: Easing.linear,
        })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const gradientColors = isDark
    ? [
        'rgba(0, 0, 0, 0.8)',
        'rgba(26, 26, 26, 0.9)',
        'rgba(40, 40, 40, 0.8)',
        'rgba(26, 26, 26, 0.9)',
        'rgba(0, 0, 0, 0.8)',
      ] as const
    : [
        'rgba(245, 245, 245, 0.8)',
        'rgba(255, 255, 255, 0.9)',
        'rgba(240, 240, 240, 0.8)',
        'rgba(255, 255, 255, 0.9)',
        'rgba(245, 245, 245, 0.8)',
      ] as const;

  return (
    <View style={styles.container}>
      <View style={[
        styles.background,
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]} />
      <Animated.View style={[styles.gradientContainer, animatedStyle]}>
        <LinearGradient
          colors={gradientColors}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientContainer: {
    position: 'absolute',
    width: width * 2,
    height: height * 2,
    top: -height / 2,
    left: -width / 2,
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
});
