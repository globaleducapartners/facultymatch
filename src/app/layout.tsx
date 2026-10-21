import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AcquisitionTracker } from "@/components/AcquisitionTracker";
import Script from "next/script";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.facultymatch.app'),
  title: "FacultyMatch | Directorio de talento para la educación superior",
  description: "El directorio de docentes, investigadores y expertos para instituciones educativas. Perfiles revisados. Contacto directo. Sin intermediarios.",
  keywords: "directorio de docentes, docentes verificados, expertos para educación, talento académico, educación superior, profesorado universitario",
  alternates: { canonical: "/" },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
  },
  openGraph: {
    title: "FacultyMatch | Directorio de talento para la educación superior",
    description: "El directorio de docentes, investigadores y expertos para instituciones educativas. Perfiles revisados. Contacto directo. Sin intermediarios.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FacultyMatch, directorio de docentes y expertos verificados para educación superior" }],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FacultyMatch | Directorio de talento para la educación superior",
    description: "El directorio de docentes, investigadores y expertos para instituciones educativas. Perfiles revisados. Contacto directo. Sin intermediarios.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
          <div className="flex-1">
            {children}
          </div>
          <ConditionalFooter />
          <CookieConsent />
          <GoogleAnalytics />
          <AcquisitionTracker />

      </body>
    </html>
  );
}

