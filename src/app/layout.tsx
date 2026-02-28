import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Talentia | Red Global de Talento Académico",
  description: "Conectamos universidades y docentes expertos de todo el mundo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
        <div className="flex-1">
          {children}
        </div>
        <Footer />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}

