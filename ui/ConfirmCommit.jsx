import React from 'react';
import { Text, useInput, Box } from 'ink';

export default function ConfirmCommit({ message, onConfirm, onCancel }) {
  useInput((input, key) => {
    if (input.toLowerCase() === 'y') {
      onConfirm();
    } else if (input.toLowerCase() === 'n') {
      onCancel();
    }
  });

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box borderStyle="round" borderColor="cyan" paddingX={2}>
        <Text>{message}</Text>
      </Box>
      <Box marginTop={1}>
        <Text bold>Commit using this message? (y/n) </Text>
      </Box>
    </Box>
  );
}
