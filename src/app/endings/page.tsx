import type { Metadata } from "next";

import { EndingAlbum } from "@/components/game/EndingAlbum";

export const metadata: Metadata = {
  title: "엔딩 앨범",
  alternates: {
    canonical: "/endings",
  },
};

export default function EndingsPage() {
  return <EndingAlbum />;
}
