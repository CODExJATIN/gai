import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

export default function SelectPrompt({ message, items, onSelect }) {
  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold color="cyan">{message}</Text>
      <SelectInput items={items} onSelect={onSelect} />
    </Box>
  );
}
