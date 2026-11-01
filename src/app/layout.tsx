import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Playfair_Display, Montserrat, Great_Vibes } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Analytics from "@/components/site/Analytics";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jacootinha-nails.vercel.app";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jacootinha Nails — Alongamentos & Curso Molde F1",
    template: "%s | Jacootinha Nails",
  },
  description:
    "Especialista em alongamentos sofisticados em Campinas e região. Realço a beleza natural das suas unhas. Agende seu horário online e conheça o Curso Pro Nails — Molde F1.",
  keywords: [
    "alongamento de unhas",
    "unhas em gel",
    "molde F1",
    "curso de unhas",
    "nail art",
    "manicure",
    "Jacootinha Nails",
    "nail designer",
  ],
  authors: [{ name: "Jacootinha Nails" }],
  creator: "Jacootinha Nails",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/images/logo-512.webp", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Jacootinha Nails",
    title: "Jacootinha Nails — Alongamentos & Curso Molde F1",
    description:
      "Especialista em alongamentos sofisticados. Agende seu horário online e conheça o Curso Pro Nails — Molde F1.",
    images: [
      {
        url: "/images/og.jpg",
        width: 1200,
        height: 630,
        alt: "Jacootinha Nails — Alongamentos sofisticados",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jacootinha Nails — Alongamentos & Curso Molde F1",
    description:
      "Especialista em alongamentos sofisticados. Agende seu horário online e conheça o Curso Pro Nails — Molde F1.",
    images: ["/images/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#f8e8e8",
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
        <Analytics />
        <Script
          id="jsonld-salon"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BeautySalon",
              name: "Jacootinha Nails",
              description:
                "Especialista em alongamentos sofisticados. Manicure, pedicure, alongamento em gel e Curso Pro Nails — Molde F1.",
              url: SITE_URL,
              image: `${SITE_URL}/images/og.jpg`,
              logo: `${SITE_URL}/images/logo-512.webp`,
              telephone: "+55 19 99850-4614",
              priceRange: "R$45 - R$2988",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Campinas",
                addressRegion: "SP",
                addressCountry: "BR",
              },
              sameAs: ["https://wa.me/5519998504614"],
              makesOffer: [
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Manicure Clássica" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Pedicure Spa" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Alongamento em Gel" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Nail Art Personalizada" } },
                { "@type": "Offer", itemOffered: { "@type": "Course", name: "Curso Pro Nails — Molde F1" } },
              ],
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  opens: "09:00",
                  closes: "18:00",
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
