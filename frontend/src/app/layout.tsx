import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "IrisVision AI - Intelligent Flower Species Classification",
  description: "Transforming botanical analysis with production-grade Machine Learning. Predict species, explore dataset analytics, and analyze neural network confidence.",
  openGraph: {
    title: "IrisVision AI",
    description: "Intelligent Flower Species Classification Powered by Machine Learning",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#030303] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
