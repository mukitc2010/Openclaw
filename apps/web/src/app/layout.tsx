import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { QuickActions } from "@/components/QuickActions";
import { ToastProvider } from "@/components/ToastProvider";
import { TopNav } from "@/components/TopNav";
import { UserBar } from "@/components/UserBar";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://robolog.us"),
  title: {
    default: "robolog.us | AI Software Delivery Platform",
    template: "%s | robolog.us",
  },
  description: "Multi-agent planning from idea to Agile and GitHub delivery.",
  keywords: [
    "AI software delivery",
    "project planning",
    "agile automation",
    "multi-agent platform",
    "developer workflow",
  ],
  openGraph: {
    title: "robolog.us | AI Software Delivery Platform",
    description: "Generate PM, Agile, architecture, and GitHub delivery plans in one control room.",
    type: "website",
    url: "https://robolog.us",
    siteName: "robolog.us",
  },
  twitter: {
    card: "summary_large_image",
    title: "robolog.us | AI Software Delivery Platform",
    description: "Generate PM, Agile, architecture, and GitHub delivery plans in one control room.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <AuthProvider>
          <ToastProvider>
            <div className="app-shell">
              <header className="app-topbar">
                <div className="topbar-inner">
                  <a href="/" className="topbar-brand">
                    <span className="brand-mark">RB</span>
                    <span className="brand-name">robolog.us</span>
                  </a>
                  <TopNav />
                  <div className="topbar-actions">
                    <QuickActions />
                    <UserBar />
                  </div>
                </div>
              </header>
              <main className="app-main">
                {children}
              </main>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
