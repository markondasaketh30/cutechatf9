import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ExamplesUI from '@vercel/examples-ui';
import type { LayoutProps } from 'app/lib/types';
import '@vercel/examples-ui/globals.css';

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className="[color-scheme:dark]">
      <body>
        <ExamplesUI>
          {children}
          <Analytics />
          <SpeedInsights />
        </ExamplesUI>
      </body>
    </html>
  );
}