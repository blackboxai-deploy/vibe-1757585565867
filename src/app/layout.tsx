import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Multiplayer Blackjack',
  description: 'Real-time multiplayer blackjack game with up to 6 players',
  keywords: ['blackjack', '21', 'multiplayer', 'casino', 'card game'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white antialiased`}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-black/20 border-b border-green-700/30 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                      21
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      Multiplayer Blackjack
                    </h1>
                  </div>
                </div>
                
                <nav className="hidden md:flex items-center space-x-6">
                  <a href="/" className="text-green-100 hover:text-white transition-colors duration-200">
                    Lobby
                  </a>
                  <a href="#rules" className="text-green-100 hover:text-white transition-colors duration-200">
                    Rules
                  </a>
                  <a href="#stats" className="text-green-100 hover:text-white transition-colors duration-200">
                    Stats
                  </a>
                </nav>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-black/20 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-100">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          
          <footer className="bg-black/20 border-t border-green-700/30 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between text-sm text-green-100">
                <div className="flex items-center space-x-4">
                  <span>© 2024 Multiplayer Blackjack</span>
                  <span className="text-green-300">•</span>
                  <span>Play Responsibly</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>Built with Next.js & TypeScript</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
        
        {/* Background pattern overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      </body>
    </html>
  );
}