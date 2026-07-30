import mediaManifestJson from "@/data/media-manifest.json";
import { getVideoUrl } from "@/lib/video";

export type MediaAsset = {
  key: string;
  source: string;
  size: number;
};

export type MediaManifest = {
  totalBytes: number;
  assets: MediaAsset[];
};

export const mediaManifest = mediaManifestJson as MediaManifest;

export function formatMegabytes(bytes: number) {
  return `${Math.ceil(bytes / 1_000_000)}MB`;
}

export function getMediaAssetKey(source: string) {
  if (source.startsWith("/audio/")) return source.slice(1);
  if (source.endsWith(".mp4")) return `video/${source}`;
  return source;
}

export function getMediaNetworkUrl(source?: string) {
  if (!source) return undefined;
  if (source.startsWith("/")) return source;
  return getVideoUrl(source);
}

export function requiresDownloadedPlayback(navigatorValue = navigator) {
  const navigatorWithUserAgentData = navigatorValue as Navigator & {
    userAgentData?: { mobile?: boolean };
  };
  if (navigatorWithUserAgentData.userAgentData?.mobile) return true;

  const isMobileUserAgent =
    /Android|iPhone|iPad|iPod|IEMobile|Mobile/i.test(
      navigatorValue.userAgent,
    );
  const isTouchIPad =
    /Macintosh/i.test(navigatorValue.userAgent) &&
    navigatorValue.maxTouchPoints > 1;

  return isMobileUserAgent || isTouchIPad;
}
