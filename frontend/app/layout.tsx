import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "eHealth EMR - Electronic Medical Records",
    template: "%s | eHealth EMR",
  },
  description: "Comprehensive Electronic Medical Records (EMR) system for healthcare clinics. Manage patients, consultations, prescriptions, and billing in one secure platform.",
  keywords: ["EMR", "Electronic Medical Records", "Healthcare", "Patient Management", "Medical Clinic"],
  authors: [{ name: "eHealth EMR Team" }],
  creator: "eHealth EMR",
  publisher: "eHealth EMR",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "eHealth EMR - Electronic Medical Records",
    description: "Comprehensive EMR system for healthcare clinics",
    siteName: "eHealth EMR",
  },
  twitter: {
    card: "summary_large_image",
  title: "eHealth EMR - Electronic Medical Records",
  description: "Comprehensive EMR system for healthcare clinics",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
