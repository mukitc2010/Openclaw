import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenClaw — AI Engineering Organization",
  description:
    "Enterprise-grade autonomous AI Software Engineering Organization. Transform your project idea into a professionally planned, architected, and delivered software system.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen font-sans antialiased">
        <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🦞</span>
              <span className="text-xl font-bold text-white tracking-tight">OpenClaw</span>
              <span className="text-xs text-gray-400 ml-1 hidden sm:inline">AI Engineering Org</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-gray-400">
              <a href="/" className="hover:text-white transition-colors">Projects</a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
