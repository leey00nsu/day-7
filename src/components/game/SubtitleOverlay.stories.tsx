import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SubtitleOverlay } from "./SubtitleOverlay";

const meta = {
  title: "Game/Subtitle Overlay",
  component: SubtitleOverlay,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div
        className="relative aspect-video min-h-[420px] w-full bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/story/open-office-set.png')",
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    line: {
      speaker: "박 부장",
      text: "김 인턴, 주간보고 왜 아직 대기야? 일단 완료 띄워.",
    },
  },
} satisfies Meta<typeof SubtitleOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dialogue: Story = {};

export const Large: Story = {
  args: {
    scale: 1.5,
  },
};
