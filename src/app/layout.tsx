import type { Metadata } from "next";
import { Sora, Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bloom — Interactive Engineering Learning",
  description: "Learn engineering through personalized roadmaps, interactive labs, games, projects and an AI mentor.",
  keywords: ["engineering", "learning", "education", "interactive", "roadmaps", "AI mentor"],
  authors: [{ name: "Bloom" }],
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/bloom-logo.png",
  },
  openGraph: {
    title: "Bloom — Interactive Engineering Learning",
    description: "Learn engineering through personalized roadmaps, interactive labs, games, projects and an AI mentor.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bloom — Interactive Engineering Learning",
    description: "Learn engineering through personalized roadmaps, interactive labs, games, projects and an AI mentor.",
  },
};

import BloomIntroWrapper from "@/components/BloomIntroWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#FBFBFA] text-[#0F172A]">
        <AuthProvider>
          <BloomIntroWrapper theme="light">
            {children}
          </BloomIntroWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
