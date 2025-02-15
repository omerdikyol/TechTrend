import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#1e1e1e' : '#f6f8fa' }
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
        { color: isDark ? '#d4d4d4' : '#24292e' }
      ]}>
        {code}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginVertical: 8,
    padding: 16,
    overflow: 'hidden',
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
