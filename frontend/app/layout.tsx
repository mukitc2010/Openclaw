import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "OpenClaw — AI Software Delivery Platform",
  description: "Enterprise AI-powered software delivery platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gray-950 text-white min-h-screen font-sans">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
