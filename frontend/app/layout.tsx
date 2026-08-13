import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ticket Triage",
  description: "AI-powered support ticket triage with human-in-the-loop review.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-semibold text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white text-sm">
                🎫
              </span>
              <span className="text-sm tracking-tight">Ticket Triage</span>
            </Link>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono hidden sm:block">
              AI-powered · Human-in-the-loop
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
