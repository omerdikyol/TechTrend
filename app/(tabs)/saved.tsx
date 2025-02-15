import React from 'react';
import { View, StyleSheet } from 'react-native';
import SavedArticles from '../../components/SavedArticles';
import Background from '../../components/Background';

export default function SavedScreen() {
  return (
    <Background>
      <View style={styles.container}>
        <SavedArticles />
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
