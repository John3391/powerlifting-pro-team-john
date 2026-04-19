import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Powerlift Pro - Viking Strength',
  description: 'Controle, Evolução e Análise de Performance Épica para Powerlifting',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen relative">
        {/* Background Layer */}
        <div className="viking-bg" />
        <div className="viking-overlay" />
        
        {/* Rain and Sparkle Effects */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={`rain-${i}`}
              className="rain-drop" 
              style={{ 
                left: `${Math.random() * 100}%`, 
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.8 + Math.random() * 1}s`
              }} 
            />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={`sparkle-${i}`}
              className="sparkle" 
              style={{ 
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                animationDelay: `${Math.random() * 5}s`
              }} 
            />
          ))}
        </div>

        <main className="relative z-10">
          {children}
        </main>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}