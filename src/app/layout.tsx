import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiaoMeowMew / Miao喵渺淼妙",
  description: "A bilingual scroll-driven portfolio for AI images, film, music, products, and interactive creative work.",
  icons: {
    icon: [
      { url: "/miao-paw.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/miao-paw.svg",
    apple: "/miao-paw.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
