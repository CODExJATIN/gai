import React from 'react';
import { Box, Text } from 'ink';

export default function Alert({ type = 'info', title, children }) {
  const colors = {
    info: 'blue',
    success: 'green',
    error: 'red',
    warning: 'yellow'
  };
  const color = colors[type] || 'white';
  
  return (
    <Box flexDirection="column" marginY={1}>
      {title && (
        <Box marginBottom={1}>
          <Text bold color={color}>{title}</Text>
        </Box>
      )}
      <Box borderStyle="round" borderColor={color} paddingX={1}>
        {typeof children === 'string' ? <Text>{children}</Text> : children}
      </Box>
    </Box>
  );
}
