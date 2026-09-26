import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AcquisitionTracker } from "@/components/AcquisitionTracker";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.facultymatch.app'),
  title: "FacultyMatch | Directorio de talento para la educación superior",
  description: "El directorio de docentes, investigadores y expertos para instituciones educativas. Perfiles revisados. Contacto directo. Sin intermediarios.",
  keywords: "directorio docentes, talento académico, educación superior, expertos universidad",
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
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FacultyMatch" }],
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
          <VisualEditsMessenger />
          <GoogleAnalytics />
          <AcquisitionTracker />

      </body>
    </html>
  );
}

