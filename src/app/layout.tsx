import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppBootstrap } from "@/components/AppBootstrap";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { SpaceSwitcherMount } from "@/components/SpaceSwitcherMount";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Soldi_Lab",
    template: "%s · Soldi_Lab",
  },
  description:
    "Infrastruttura di certezze finanziarie personali per famiglie italiane.",
  applicationName: "Soldi_Lab",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Soldi_Lab",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0a09",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-stone-50 font-sans text-stone-900">
        <div className="mx-auto flex min-h-screen max-w-md flex-col bg-stone-50">
          <AppHeader />
          <main className="flex flex-1 flex-col pb-24">
            <AppBootstrap>{children}</AppBootstrap>
          </main>
          <BottomNav />
          <SpaceSwitcherMount />
        </div>
      </body>
    </html>
  );
}
