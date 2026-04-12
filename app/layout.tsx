import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "벚꽃살리기",
  description: "시험기간 대학생들을 위한 학교 대항 벚꽃 시즌 웹 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        <div className="app-global-background" aria-hidden="true" />
        <div className="app-global-background-overlay" aria-hidden="true" />
        <div className="relative z-10 flex min-h-full flex-col">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
