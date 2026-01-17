import type { Metadata } from "next";
import { Orbitron, Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";

/**
 * Font configuration with performance optimizations
 * - Preconnect to font domains
 * - Use font-display: swap to prevent FOIT
 * - Subset to Latin only to reduce file size
 * - Only load necessary weights
 */
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only load when needed (code display)
});

export const metadata: Metadata = {
  title: "Evolution of Todo",
  description: "A modern, full-stack todo application built with Next.js and FastAPI",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-dark-main text-primary">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
