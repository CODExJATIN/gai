import React from 'react';
import { render } from 'ink';

export function prompt(Component, props) {
  return new Promise((resolve, reject) => {
    let unmount;
    try {
      const instance = render(
        React.createElement(Component, {
          ...props,
          onSubmit: (val) => {
            unmount();
            resolve(val);
          },
          onSelect: (val) => {
            unmount();
            resolve(val);
          },
          onConfirm: () => {
            unmount();
            resolve(true);
          },
          onCancel: () => {
            unmount();
            resolve(false);
          }
        })
      );
      unmount = instance.unmount;
    } catch (e) {
      reject(e);
    }
  });
}

export function show(Component, props) {
  return new Promise(resolve => {
    const { unmount } = render(React.createElement(Component, props));
    setTimeout(() => {
      unmount();
      resolve();
    }, 50);
  });
}
