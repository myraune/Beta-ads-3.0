import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Beta Live Ads Platform",
  description: "Agency, streamer, and admin dashboards for live ad delivery."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${heading.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-fog via-white to-[#e9f7f2]">{children}</body>
    </html>
  );
}
