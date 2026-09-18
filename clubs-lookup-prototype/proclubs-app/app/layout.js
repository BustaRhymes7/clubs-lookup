import { Oswald, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

// Vercel sets VERCEL_URL automatically on every deploy, so Open Graph /
// canonical URLs resolve correctly with zero manual configuration.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Clubs Lookup — Live EA Pro Clubs Stats",
    template: "%s · Clubs Lookup",
  },
  description:
    "Search any EA Sports FC Pro Clubs team and see live club stats, match history, and full player breakdowns, pulled straight from EA's servers.",
  openGraph: {
    title: "Clubs Lookup — Live EA Pro Clubs Stats",
    description:
      "Search any EA Sports FC Pro Clubs team and see live club stats, match history, and full player breakdowns.",
    type: "website",
    siteName: "Clubs Lookup",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clubs Lookup — Live EA Pro Clubs Stats",
    description: "Live EA Pro Clubs stats — club record, match history, full roster breakdowns.",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#0f3d2e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${oswald.variable} ${inter.variable}`}>
        {children}
        <Footer />
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
