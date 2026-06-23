import './globals.css';
import 'leaflet/dist/leaflet.css'; // Required for the map to render correctly
import { Inter } from 'next/font/google';
import Navbar from '../components/Navbar';
import { ThemeProvider } from '../components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CivicPulse | AI-Powered Hyperlocal Solver',
  description: 'Gamified civic reporting and infrastructure resolution.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased min-h-screen flex flex-col transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar />
          <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 pt-24">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}