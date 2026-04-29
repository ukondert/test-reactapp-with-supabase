export const VALID_TONES = ['success', 'error', 'info'];

export const normalizeStatusMessageInput = ({ text, tone = 'info', isDev = false }) => {
  const normalizedText = typeof text === 'string' ? text : String(text || '');
  if (!normalizedText.trim()) {
    return { normalizedText: '', normalizedTone: 'info', isVisible: false };
  }

  const normalizedTone = typeof tone === 'string' ? tone.toLowerCase() : 'info';
  if (isDev && tone && !VALID_TONES.includes(normalizedTone)) {
    console.warn('[StatusMessage] Unsupported tone "' + tone + '". Falling back to "info".');
  }

  return {
    normalizedText,
    normalizedTone,
    isVisible: true,
  };
};