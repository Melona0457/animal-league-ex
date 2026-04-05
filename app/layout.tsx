import type { Metadata } from "next";
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
