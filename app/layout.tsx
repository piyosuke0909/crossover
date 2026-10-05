import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crossover",
  description: "企業交流会で、話したい企業と人を見つけるプロフィールアプリ",
};

export const viewport: Viewport = {
  themeColor: "#4db7e5",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
