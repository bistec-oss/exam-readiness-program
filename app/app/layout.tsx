import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import OfflineIndicator from "@/components/OfflineIndicator";

export const metadata: Metadata = {
  title: "Exam Ready! | Bistec Global",
  description: "Gamified exam readiness platform for professional certifications",
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full">
        {children}
        <OfflineIndicator />
      </body>
    </html>
  );
}
