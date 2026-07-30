export const VIDEO_PLAYBACK_ERROR_MESSAGE =
  "동영상 재생에 문제가 생겼습니다";

export function VideoPlaybackError() {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-0 z-[210] grid place-items-center bg-black px-6 text-center text-white"
    >
      <p className="text-lg font-semibold tracking-[-0.01em] sm:text-xl">
        {VIDEO_PLAYBACK_ERROR_MESSAGE}
      </p>
    </div>
  );
}
