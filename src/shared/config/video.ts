export const videoBaseUrl: string =
  process.env.NEXT_PUBLIC_VIDEO_BASE_URL?.replace(/\/+$/, "") ?? "";

export function getVideoUrl(filename: string) {
  if (!videoBaseUrl) {
    return undefined;
  }

  return `${videoBaseUrl}/${encodeURIComponent(filename)}`;
}
