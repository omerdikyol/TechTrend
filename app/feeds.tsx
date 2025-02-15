import React from 'react';
import { Stack } from 'expo-router';
import { FeedManager } from '../components/FeedManager';

export default function FeedsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Manage Feeds',
        }}
      />
      <FeedManager />
    </>
  );
}
