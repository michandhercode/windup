import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
// next/image types (via next-env.d.ts) make this resolve to { src, width, height }.
// The "app/icon.*" file convention ignores .webp, so the icon is wired up through metadata instead.
import appIcon from "./icon.webp";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Windup | Sentimental Journaling Platform",
  description: "A sentimental, letter-based journaling platform for private thoughts and shared reflection.",
  // `src` is a hashed URL (/_next/static/media/icon.<hash>.webp), so a changed icon also busts the browser cache.
  icons: {
    icon: [{ url: appIcon.src, type: "image/webp" }],
    shortcut: [{ url: appIcon.src, type: "image/webp" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans transition-colors duration-300">
        <Providers>
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}