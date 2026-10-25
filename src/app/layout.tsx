import type { Metadata } from "next";
import { Playfair_Display, Montserrat, Great_Vibes } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-greatvibes",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jacootinha Nails — Alongamentos & Curso Molde F1",
  description:
    "Especialista em alongamentos sofisticados. Realço a beleza natural das suas unhas. Agende seu horário online e conheça o Curso Pro Nails — Molde F1.",
  keywords: ["alongamento de unhas", "unhas em gel", "molde F1", "curso de unhas", "nail art", "Jacootinha Nails"],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Jacootinha Nails",
    description: "Especialista em alongamentos sofisticados. Realço a beleza natural das suas unhas.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${montserrat.variable} ${greatVibes.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
