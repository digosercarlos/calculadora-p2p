import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calculadora P2P",
  description: "PWA Calculator for VES/USD/USDT Arbitrage",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Calculadora P2P",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Calculadora P2P",
    title: "Calculadora P2P - Arbitrage Calculator",
    description: "PWA Calculator for VES/USD/USDT Arbitrage",
  },
  twitter: {
    card: "summary",
    title: "Calculadora P2P - Arbitrage Calculator",
    description: "PWA Calculator for VES/USD/USDT Arbitrage",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Calculadora P2P" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
