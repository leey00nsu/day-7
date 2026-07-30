import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GameScene } from "./GameScene";

const meta = {
  title: "Pages/Story/Scene",
  component: GameScene,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof GameScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MondayChoice: Story = {};
