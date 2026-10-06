import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";
import CookieNotice from "./CookieNotice";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.generar.co"),
  title: {
    default: "GenerAR — Análisis de Riesgos (AR) y ATS con IA",
    template: "%s — GenerAR",
  },
  description: "Genera Análisis de Riesgos (AR) y Análisis de Trabajo Seguro (ATS) profesionales en menos de un minuto con IA. Metodología RAM y exportación a Excel y PDF.",
  openGraph: { type: "website", locale: "es_CO", siteName: "GenerAR" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" style={{ colorScheme: 'light'}}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <CookieNotice />
        <Analytics />
      </body>
    </html>
  );
}
