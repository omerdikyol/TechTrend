import React from 'react';
import { Stack } from 'expo-router';
import { FeedManager } from '../components/FeedManager';
import Background from '../components/Background';

export default function FeedsScreen() {
  return (
    <Background>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <FeedManager />
    </Background>
  );
}
