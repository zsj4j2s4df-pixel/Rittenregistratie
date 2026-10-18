import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'RitKompas — Rittenregistratie',
  description: 'Lokaal rittenregistratieprototype met uitsluitend voorbeeldgegevens.',
  openGraph: {
    title: 'RitKompas',
    description: 'Jouw ritten. Duidelijk geregistreerd.',
    images: [{ url: '/vehicle-placeholder.svg', width: 1200, height: 630, alt: 'RitKompas sociale preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RitKompas',
    description: 'Jouw ritten. Duidelijk geregistreerd.',
    images: ['/vehicle-placeholder.svg'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nl"><body>{children}</body></html>;
}
