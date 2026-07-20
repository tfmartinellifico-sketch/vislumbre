import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Serif_Display,
  Instrument_Serif,
  Plus_Jakarta_Sans,
  Fraunces,
} from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-logo-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const instrument = Instrument_Serif({
  variable: "--font-logo-instrument",
  subsets: ["latin"],
  weight: ["400"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-logo-dm",
  subsets: ["latin"],
  weight: ["400"],
});

const fraunces = Fraunces({
  variable: "--font-logo-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} — Plataforma para consulta de estética facial`,
  description:
    "Solução B2B para clínicas e profissionais: apoio visual à consulta de estética facial, cenários de intensidade, registro documentado e gestão de equipe — sem simular resultado.",
  openGraph: {
    title: `${SITE_NAME} — Para clínicas e profissionais`,
    description:
      "Clareza antes da decisão. Ferramenta ilustrativa para a consulta, não simulador de resultado.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${plusJakarta.variable} ${cormorant.variable} ${instrument.variable} ${dmSerif.variable} ${fraunces.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
