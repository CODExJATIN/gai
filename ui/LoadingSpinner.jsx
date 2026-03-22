import React from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';

export default function LoadingSpinner({ message }) {
  return (
    <Text>
      <Text color="green">
        <Spinner type="dots" />
      </Text>
      {' '}{message}
    </Text>
  );
}
