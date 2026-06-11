import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
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
    images: ["/icon-512.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P64FLPTT');`,
          }}
        />
        {/* End Google Tag Manager */}
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P64FLPTT"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
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

