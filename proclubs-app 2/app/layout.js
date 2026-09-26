import { Space_Grotesk, Inter } from "next/font/google";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Clubs Lookup — Pro Clubs stats, free",
    template: "%s",
  },
  description:
    "A free fan-made Pro Clubs stats lookup. Search any club, see the full record, form, squad, and player-by-player breakdowns — live from EA's own data.",
  applicationName: "Clubs Lookup",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Clubs Lookup",
    title: "Clubs Lookup — Pro Clubs stats, free",
    description:
      "A free fan-made Pro Clubs stats lookup. Search any club, see the full record, form, squad, and player-by-player breakdowns.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clubs Lookup — Pro Clubs stats, free",
    description:
      "A free fan-made Pro Clubs stats lookup. Search any club, see the full record, form, squad, and player-by-player breakdowns.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#0b0e14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        {children}
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
