import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FTP Monitor',
  description: 'Real-time FTP file system monitoring dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-base antialiased">
        {children}
      </body>
    </html>
  );
}
