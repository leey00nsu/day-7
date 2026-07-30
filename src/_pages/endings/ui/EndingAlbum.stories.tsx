import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EndingAlbum } from "./EndingAlbum";
import { reportStoryData } from "@/features/game-reporting/testing";

const meta = {
  title: "Pages/Endings/Album",
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
    initialReportData: reportStoryData,
  },
};

export const OneUnlocked: Story = {
  args: {
    initialUnlockedIds: ["E01"],
    initialReportData: reportStoryData,
  },
};

export const AllUnlocked: Story = {
  args: {
    initialUnlockedIds: ["E01", "E02", "E03"],
    initialReportData: reportStoryData,
  },
};
