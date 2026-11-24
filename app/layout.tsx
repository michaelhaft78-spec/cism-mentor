import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CISM Mentor',
  description: 'Van 0 naar 100 voor het ISACA CISM-examen, met wekelijkse intel-briefing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
