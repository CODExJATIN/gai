import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

export default function TextPrompt({ message, onSubmit, isSecret = false, defaultValue = '' }) {
  const [value, setValue] = useState('');

  return (
    <Box marginY={1}>
      <Text bold color="cyan">{message} </Text>
      {isSecret ? (
        <TextInput
          focus={true}
          value={value}
          onChange={setValue}
          onSubmit={() => onSubmit(value || defaultValue)}
          placeholder={defaultValue}
          mask="*"
        />
      ) : (
        <TextInput
          focus={true}
          value={value}
          onChange={setValue}
          onSubmit={() => onSubmit(value || defaultValue)}
          placeholder={defaultValue}
        />
      )}
    </Box>
  );
}
