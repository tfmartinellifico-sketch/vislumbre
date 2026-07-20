import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Serif_Display,
  Instrument_Serif,
  Plus_Jakarta_Sans,
  Fraunces,
} from "next/font/google";
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
  title: "Vislumbre — Clareza antes da decisão",
  description:
    "Ferramenta de consulta para estética facial: cenários de conversa, visualização ao vivo e registro responsável — sem prometer resultado.",
  openGraph: {
    title: "Vislumbre",
    description: "Clareza antes da decisão. Demonstração para conversa, nunca garantia.",
    locale: "pt_BR",
    type: "website",
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
