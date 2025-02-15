import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  ViewStyle,
  Share,
  Alert,
  GestureResponderEvent,
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
import { cleanHtml } from '../utils/htmlParser';
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
  commentsUrl?: string;
  points?: number;
  commentCount?: number;
}

interface NewsCardProps {
  item: NewsItem;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: ViewStyle;
}

const handleShare = async (item: NewsItem, setIsPressed: (value: boolean) => void) => {
  setIsPressed(true);
  try {
    await Share.share({
      message: `${item.title}\n\nRead more at: ${item.url}`,
      url: item.url, // iOS only
      title: item.title, // Android only
    });
  } catch (error) {
    Alert.alert('Error', 'Could not share the article');
  }
};

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
  const isShareButtonPressed = useSharedValue(false);

  useEffect(() => {
    saveOpacity.value = 0;
    dismissOpacity.value = 0;
  }, [item]);

  const tap = Gesture.Tap()
    .onStart(() => {
      'worklet';
      if (!isSwipeGesture.value && !isShareButtonPressed.value) {
        runOnJS(router.push)({ pathname: '/article/[id]', params: { id: item.id } });
      }
    })
    .onFinalize(() => {
      'worklet';
      isShareButtonPressed.value = false;
      isSwipeGesture.value = false;
    });

  const pan = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      isSwipeGesture.value = false;
    })
    .onUpdate((event) => {
      'worklet';
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
  }), []); // Add empty dependency array

  const saveIndicatorStyle = useAnimatedStyle(() => ({
    opacity: saveOpacity.value,
    transform: [{ 
      scale: interpolate(
        saveOpacity.value,
        [0, 1],
        [0.8, 1.2]
      )
    }],
  }), []); // Add empty dependency array

  const dismissIndicatorStyle = useAnimatedStyle(() => ({
    opacity: dismissOpacity.value,
    transform: [{ 
      scale: interpolate(
        dismissOpacity.value,
        [0, 1],
        [0.8, 1.2]
      )
    }],
  }), []); // Add empty dependency array

  const handlePress = () => {
    if (!isSwipeGesture.value) {
      router.push(`/article/${item.id}`);
    }
  };

  return (
    <GestureDetector gesture={composed}>
      <Animated.View 
        style={[styles.card, style, animatedStyle]}
        collapsable={false} // Optimize native animation performance
      >
        {/* Save Indicator */}
        <Animated.View style={[styles.indicator, styles.saveIndicator, saveIndicatorStyle]}>
          <View style={styles.indicatorContent}>
            <Ionicons name="bookmark" size={40} color="white" />
            <Text style={styles.indicatorText}>SAVE</Text>
          </View>
        </Animated.View>

        {/* Skip Indicator */}
        <Animated.View style={[styles.indicator, styles.skipIndicator, dismissIndicatorStyle]}>
          <View style={styles.indicatorContent}>
            <Ionicons name="close-circle" size={40} color="white" />
            <Text style={styles.indicatorText}>SKIP</Text>
          </View>
        </Animated.View>

        <View style={styles.cardContent}>
          <Image 
            source={{ 
              uri: item.imageUrl,
              cache: 'force-cache' // Add image caching
            }} 
            style={styles.image}
            loading="lazy"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']} // Darker gradient for better readability
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
              {cleanHtml(item.summary)}
            </Text>
            <View style={styles.footer}>
              <View style={styles.sourceContainer}>
                <Text style={styles.source}>{item.source}</Text>
                <Text style={styles.time}>
                  {formatDistanceToNow(item.publishedAt, { addSuffix: true })}
                </Text>
              </View>
              <View style={styles.actions}>
                {item.source === 'Hacker News' ? (
                  <View style={styles.hnStats}>
                    {item.points !== undefined && (
                      <View style={styles.hnStat}>
                        <Ionicons name="arrow-up" size={16} color="white" />
                        <Text style={styles.hnStatText}>{item.points}</Text>
                      </View>
                    )}
                    {item.commentCount !== undefined && (
                      <View style={styles.hnStat}>
                        <Ionicons name="chatbubble-outline" size={16} color="white" />
                        <Text style={styles.hnStatText}>{item.commentCount}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <>
                    <Pressable onPress={() => handleShare(item, (value) => isShareButtonPressed.value = value)}>
                      <Ionicons name="share-outline" size={24} color="white" />
                    </Pressable>
                    <Ionicons
                      name="chatbubble-outline"
                      size={24}
                      color="white"
                      style={{ marginLeft: 16 }}
                    />
                  </>
                )}
              </View>
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
    position: 'relative',
    borderRadius: 20,
    backgroundColor: 'transparent', // Remove white background
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
    height: '75%', // Increase gradient height for better readability
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Add text shadow for better readability
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  summary: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9, // Increased opacity for better visibility
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Add text shadow for better readability
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    opacity: 0.95, // Increased opacity
  },
  time: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9, // Increased opacity
  },
  hnStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hnStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hnStatText: {
    color: 'white',
    fontSize: 14,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Slightly more visible in dark mode
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
    opacity: 0.95, // Increased opacity for better visibility
  },
  indicator: {
    position: 'absolute',
    top: '45%',
    zIndex: 1000,
    width: 100,
    height: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveIndicator: {
    right: 20,
    backgroundColor: 'rgba(39, 174, 96, 0.8)',
  },
  skipIndicator: {
    left: 20,
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
  },
  indicatorContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorText: {
    color: 'white',
    marginTop: 5,
    fontWeight: 'bold',
    fontSize: 16,
  },
});