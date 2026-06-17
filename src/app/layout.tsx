import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guo Jiawen / Miao Portfolio",
  description: "A bilingual scroll-driven portfolio for AI product, AIGC direction, visual systems, and public creative work.",
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
