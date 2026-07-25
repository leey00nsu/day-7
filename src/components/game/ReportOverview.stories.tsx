import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  reportStoryData,
  reportStoryChoices,
} from "./report-story-fixture";
import { ReportOverview } from "./ReportOverview";

const meta = {
  title: "Game/Report Overview",
  component: ReportOverview,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-svh bg-black p-6 text-white sm:p-10">
        <div className="mx-auto max-w-4xl">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    data: reportStoryData,
    selectedChoices: reportStoryChoices,
  },
} satisfies Meta<typeof ReportOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithMyChoices: Story = {};

export const AllLocked: Story = {
  args: {
    selectedChoices: {},
  },
};

export const PartiallyUnlocked: Story = {
  args: {
    selectedChoices: {
      MONDAY_STATUS: 0,
      TUESDAY_OVERTIME: 1,
    },
  },
};

export const Compact: Story = {
  args: {
    compact: true,
  },
};
