import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crossover",
  description: "クロスオーバー企業交流会 参加企業プロフィール",
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
