import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { normalizeStatusMessageInput } from './statusMessage.shared';

const StatusMessage = ({ text, tone = 'info' }) => {
  const { normalizedText, normalizedTone, isVisible } = normalizeStatusMessageInput({
    text,
    tone,
    isDev: __DEV__,
  });

  if (!isVisible) {
    return null;
  }

  const toneStyleMap = {
    success: styles.success,
    error: styles.error,
    info: styles.info,
  };

  const toneStyle = toneStyleMap[normalizedTone] || toneStyleMap.info;

  return <Text style={[styles.base, toneStyle]}>{normalizedText}</Text>;
};

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
    marginTop: 8,
  },
  success: {
    color: '#116932',
  },
  error: {
    color: '#b00020',
  },
  info: {
    color: '#1f2937',
  },
});

export default StatusMessage;
