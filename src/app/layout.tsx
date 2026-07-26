import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable.css";

import { GameAudio } from "@/components/game/GameAudio";
import { GameOptions } from "@/components/game/GameOptions";
import { MediaAssetProvider } from "@/components/game/MediaAssetProvider";
import { SoundConsent } from "@/components/game/SoundConsent";
import { VideoPlaybackError } from "@/components/game/VideoPlaybackError";
import { WebAudioProvider } from "@/components/game/WebAudioProvider";
import { siteConfig } from "@/lib/site";
import { videoBaseUrl } from "@/lib/video";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | 인터랙티브 오피스 드라마`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "정규직까지 D-7",
    "인터랙티브 무비",
    "인터랙티브 게임",
    "비주얼 노벨",
    "오피스 드라마",
    "선택형 게임",
    "한국 인디 게임",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  category: "game",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | 인터랙티브 오피스 드라마`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} 게임 타이틀과 사무실 배경`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | 인터랙티브 오피스 드라마`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0b0f0d",
};

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  image: new URL(siteConfig.ogImage, siteConfig.url).toString(),
  inLanguage: "ko-KR",
  applicationCategory: "Game",
  gamePlatform: "Web browser",
  playMode: "SinglePlayer",
  genre: ["Interactive movie", "Visual novel", "Office drama"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark h-full antialiased">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(gameJsonLd).replace(/</g, "\\u003c"),
          }}
          type="application/ld+json"
        />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground">
        {videoBaseUrl ? (
          <MediaAssetProvider>
            <WebAudioProvider>
              <GameAudio />
              <SoundConsent>
                <GameOptions />
                {children}
              </SoundConsent>
            </WebAudioProvider>
          </MediaAssetProvider>
        ) : (
          <VideoPlaybackError />
        )}
      </body>
    </html>
  );
}
