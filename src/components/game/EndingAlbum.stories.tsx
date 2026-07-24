import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EndingAlbum } from "./EndingAlbum";

const meta = {
  title: "Game/Ending Album",
  component: EndingAlbum,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof EndingAlbum>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllLocked: Story = {
  args: {
    initialUnlockedIds: [],
  },
};

export const OneUnlocked: Story = {
  args: {
    initialUnlockedIds: ["E01"],
  },
};

export const AllUnlocked: Story = {
  args: {
    initialUnlockedIds: ["E01", "E02", "E03"],
  },
};
