'use client';

import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  fontFamily: 'var(--font-atkinson), Atkinson Hyperlegible Next, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif',
  primaryColor: 'blue',
});

export function MantineWrapper({ children }: { children: React.ReactNode }) {
  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
