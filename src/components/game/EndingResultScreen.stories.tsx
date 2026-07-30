import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { endings } from "@/entities/game";

import { EndingResultScreen } from "./EndingResultScreen";
import {
  reportStoryData,
  reportStoryChoices,
} from "./report-story-fixture";

const meta = {
  title: "Game/Ending Result Screen",
  component: EndingResultScreen,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    currentChoices: reportStoryChoices,
    ending: endings[0],
    initialReportData: reportStoryData,
  },
} satisfies Meta<typeof EndingResultScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConversionEnding: Story = {};

export const DeclineEnding: Story = {
  args: {
    ending: endings[2],
  },
};
