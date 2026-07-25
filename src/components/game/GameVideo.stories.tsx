import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GameVideo } from "./GameVideo";

const meta = {
  title: "Game/Video",
  component: GameVideo,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "NEXT_PUBLIC_VIDEO_BASE_URL을 기준으로 게임 영상을 불러오는 공통 플레이어입니다. 주소 누락과 로딩 실패 상태는 Video Playback Error 스토리에서 확인할 수 있습니다.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="grid min-h-svh place-items-center bg-black">
        <Story />
      </div>
    ),
  ],
  args: {
    "aria-label": "정규직 D-7 타이틀 배경",
    autoPlay: true,
    className: "aspect-video w-full object-contain",
    filename: "t00_title_s01.mp4",
    loop: true,
    muted: true,
    playsInline: true,
    poster: "/assets/home/home-hero-poster-16x9.png",
  },
} satisfies Meta<typeof GameVideo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleLoop: Story = {};
