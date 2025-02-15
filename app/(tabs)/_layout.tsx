import React from 'react';
import { View, StyleSheet } from 'react-native';
import Background from '../../components/Background';
import MainScreen from './index';

export default function TabLayout() {
  return (
    <Background>
      <MainScreen />
    </Background>
  );
}