import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../constants/theme';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const { isDark } = useTheme();

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: isDark ? '#1a1a1a' : '#f6f8fa',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      }
    ]}>
      {language && (
        <Text style={[
          styles.language,
          { color: isDark ? '#888' : '#666' }
        ]}>
          {language}
        </Text>
      )}
      <Text style={[
        styles.code,
        { color: isDark ? '#e6e6e6' : '#24292e' }
      ]}>
        {code}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginVertical: 12,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  language: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
  },
});
