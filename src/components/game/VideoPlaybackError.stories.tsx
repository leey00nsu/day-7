import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { VideoPlaybackError } from "./VideoPlaybackError";

const meta = {
  title: "Game/VideoPlaybackError",
  component: VideoPlaybackError,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof VideoPlaybackError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
