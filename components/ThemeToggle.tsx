import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/theme';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
} from 'react-native-reanimated';

export default function ThemeToggle() {
  const { isDark, colorScheme, setColorScheme } = useTheme();
  
  const handlePress = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withSpring(isDark ? '180deg' : '0deg') }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Animated.View style={iconStyle}>
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={24}
          color={isDark ? '#fff' : '#000'}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});