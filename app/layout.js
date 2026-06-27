import './globals.css';
import 'leaflet/dist/leaflet.css'; // Required for the map to render correctly
import { Inter } from 'next/font/google';
import Navbar from '../components/Navbar';
import { ThemeProvider } from '../components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CivicPulse | AI-Powered Hyperlocal Solver',
  description: 'Gamified civic reporting and infrastructure resolution.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased min-h-screen flex flex-col transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Navbar />
          <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 pt-28">
            {children}
          </main>
          <footer className="w-full border-t border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm py-5">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Developed by{' '}
                <a
                  href="https://abidts.work"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Abid TS
                </a>
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}