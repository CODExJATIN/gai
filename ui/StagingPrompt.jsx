import React, { useState } from 'react';
import { Text, useInput, Box } from 'ink';

export default function StagingPrompt({ files, onConfirm }) {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState(new Set());

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor(c => Math.max(0, c - 1));
    } else if (key.downArrow) {
      setCursor(c => Math.min(files.length - 1, c + 1));
    } else if (input === ' ') {
      setSelected(s => {
        const next = new Set(s);
        if (next.has(files[cursor].name)) {
          next.delete(files[cursor].name);
        } else {
          next.add(files[cursor].name);
        }
        return next;
      });
    } else if (key.return) {
      onConfirm(Array.from(selected));
    }
  });

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold color="green">Select files to stage (Space to select, Enter to confirm, Up/Down to navigate):</Text>
      {files.map((f, i) => {
        const isCursor = cursor === i;
        const isSelected = selected.has(f.name);
        return (
          <Box key={f.name}>
            <Text color={isCursor ? 'cyan' : undefined}>
              {isCursor ? '> ' : '  '}
              {isSelected ? '[x] ' : '[ ] '}
              {f.message}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
