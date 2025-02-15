import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { formatDistanceToNow } from 'date-fns';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.6;
const SWIPE_THRESHOLD = CARD_WIDTH * 0.3;

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  source: string;
  publishedAt: Date;
  tags: string[];
  url: string;
}

interface NewsCardProps {
  item: NewsItem;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: ViewStyle;
}

export default function NewsCard({
  item,
  onSwipeLeft,
  onSwipeRight,
  style,
}: NewsCardProps) {
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const saveOpacity = useSharedValue(0);
  const dismissOpacity = useSharedValue(0);
  const isSwipeGesture = useSharedValue(false);

  useEffect(() => {
    saveOpacity.value = 0;
    dismissOpacity.value = 0;
  }, [item]);

  const tap = Gesture.Tap().onStart(() => {
    if (!isSwipeGesture.value) {
      runOnJS(router.push)(`/article/${item.id}`);
    }
  });

  const pan = Gesture.Pan()
    .onBegin(() => {
      isSwipeGesture.value = false;
    })
    .onUpdate((event) => {
      if (Math.abs(event.translationX) > 10) {
        isSwipeGesture.value = true;
      }
      translateX.value = event.translationX;
      rotation.value = event.translationX / CARD_WIDTH;

      // Update indicator opacity based on swipe direction
      if (event.translationX > 0) {
        saveOpacity.value = Math.min(event.translationX / SWIPE_THRESHOLD, 1);
        dismissOpacity.value = 0;
      } else {
        dismissOpacity.value = Math.min(
          Math.abs(event.translationX) / SWIPE_THRESHOLD,
          1,
        );
        saveOpacity.value = 0;
      }
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withSpring(direction * SCREEN_WIDTH, {
          velocity: event.velocityX,
          damping: 20,
        });
        if (direction === 1) {
          runOnJS(onSwipeRight)?.();
        } else {
          runOnJS(onSwipeLeft)?.();
        }
      } else {
        translateX.value = withSpring(0, {
          velocity: event.velocityX,
          damping: 20,
        });
        rotation.value = withSpring(0);
        saveOpacity.value = withTiming(0);
        dismissOpacity.value = withTiming(0);
      }
      isSwipeGesture.value = false;
    });

  const composed = Gesture.Simultaneous(tap, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotation.value * 15}deg` },
    ],
  }));

  const saveIndicatorStyle = useAnimatedStyle(() => ({
    opacity: saveOpacity.value,
    transform: [
      { 
        scale: interpolate(
          saveOpacity.value,
          [0, 1],
          [0.8, 1.2]
        )
      }
    ],
  }));

  const dismissIndicatorStyle = useAnimatedStyle(() => ({
    opacity: dismissOpacity.value,
    transform: [
      { 
        scale: interpolate(
          dismissOpacity.value,
          [0, 1],
          [0.8, 1.2]
        )
      }
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.card, style, animatedStyle]}>
        <View style={styles.cardContent}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}>
            <View style={styles.tagsContainer}>
              {item.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.summary} numberOfLines={2}>
              {item.summary}
            </Text>
            <View style={styles.footer}>
              <View style={styles.sourceContainer}>
                <Text style={styles.source}>{item.source}</Text>
                <Text style={styles.time}>
                  {formatDistanceToNow(item.publishedAt, { addSuffix: true })}
                </Text>
              </View>
              <View style={styles.actions}>
                <Ionicons name="share-outline" size={24} color="white" />
                <Ionicons
                  name="chatbubble-outline"
                  size={24}
                  color="white"
                  style={{ marginLeft: 16 }}
                />
              </View>
            </View>
            
            {/* Swipe Indicators */}
            <View style={styles.indicatorsContainer}>
              <Animated.View style={[styles.indicator, styles.dismissIndicator, dismissIndicatorStyle]}>
                <LinearGradient
                  colors={['transparent', '#F44336']}
                  style={styles.indicatorGradient}
                />
              </Animated.View>
              <Animated.View style={[styles.indicator, styles.saveIndicator, saveIndicatorStyle]}>
                <LinearGradient
                  colors={['transparent', '#4CAF50']}
                  style={styles.indicatorGradient}
                />
              </Animated.View>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  summary: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceContainer: {
    flex: 1,
  },
  source: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  indicatorsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  indicator: {
    flex: 1,
    height: '100%',
  },
  indicatorGradient: {
    flex: 1,
    borderRadius: 2,
  },
  dismissIndicator: {
    marginRight: 2,
  },
  saveIndicator: {
    marginLeft: 2,
  },
});