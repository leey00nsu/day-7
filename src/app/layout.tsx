import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable.css";

import { GameOptions } from "@/components/game/GameOptions";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "정규직 D-7",
    template: "%s · 정규직 D-7",
  },
  description:
    "7일간의 선택으로 정규직 전환과 거절의 결말을 만들어 가는 인터랙티브 오피스 드라마.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0b0f0d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark h-full antialiased">
      <body className="min-h-full bg-background font-sans text-foreground">
        <GameOptions />
        {children}
      </body>
    </html>
  );
}
