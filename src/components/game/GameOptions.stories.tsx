import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GameOptions } from "./GameOptions";
import { MediaAssetStoragePreview } from "./MediaAssetProvider";

const meta = {
  title: "Game/Options",
  component: GameOptions,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="relative min-h-[520px] bg-[radial-gradient(circle_at_center,#38413d,#090b0a_70%)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GameOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    defaultOpen: true,
  },
};

export const Closed: Story = {};

export const DownloadedMedia: Story = {
  args: {
    defaultOpen: true,
  },
  render: (args) => (
    <MediaAssetStoragePreview
      cachedDataAvailable
      storageMode="download"
    >
      <GameOptions {...args} />
    </MediaAssetStoragePreview>
  ),
};

export const StreamingWithDownloadedData: Story = {
  args: {
    defaultOpen: true,
  },
  render: (args) => (
    <MediaAssetStoragePreview cachedDataAvailable storageMode="stream">
      <GameOptions {...args} />
    </MediaAssetStoragePreview>
  ),
};
