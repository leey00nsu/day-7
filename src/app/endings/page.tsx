import type { Metadata } from "next";

import { EndingAlbum } from "@/components/game/EndingAlbum";

export const metadata: Metadata = {
  title: "엔딩 앨범",
};

export default function EndingsPage() {
  return <EndingAlbum />;
}
