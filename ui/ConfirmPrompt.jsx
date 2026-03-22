import React, { useState, useEffect } from 'react';
import { Text, useInput, Box } from 'ink';

export default function ConfirmPrompt({ message, onConfirm, onCancel }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useInput((input, key) => {
    if (!ready) return;
    if (input.toLowerCase() === 'y' || key.return) {
      if (onConfirm) onConfirm();
    } else if (input.toLowerCase() === 'n') {
      if (onCancel) onCancel();
    }
  });

  return (
    <Box marginY={1}>
      <Text bold color="cyan">{message} (Y/n) </Text>
    </Box>
  );
}
