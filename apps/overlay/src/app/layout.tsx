import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beta Ads Overlay",
  description: "OBS overlay app for live ad rendering"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
