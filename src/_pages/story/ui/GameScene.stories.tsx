import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StoryPage } from "./StoryPage";

const meta = {
  title: "Pages/Story/Scene",
  component: StoryPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof StoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MondayChoice: Story = {};
