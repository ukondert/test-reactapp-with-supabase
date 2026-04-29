import React from 'react';
import { normalizeStatusMessageInput } from './statusMessage.shared';

const toneClassMap = {
  success: 'status-message success',
  error: 'status-message error',
  info: 'status-message info',
};

const StatusMessage = ({ text, tone = 'info' }) => {
  const { normalizedText, normalizedTone, isVisible } = normalizeStatusMessageInput({
    text,
    tone,
    isDev: typeof process !== 'undefined' && process.env.NODE_ENV !== 'production',
  });

  if (!isVisible) {
    return null;
  }

  const className = toneClassMap[normalizedTone] || toneClassMap.info;

  return <p className={className}>{normalizedText}</p>;
};

export default StatusMessage;
