import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { reportStoryData } from "./report-story-fixture";
import { ReportDashboard } from "./ReportDashboard";

const meta = {
  title: "Features/Game Reporting/Dashboard",
  component: ReportDashboard,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-svh bg-[radial-gradient(circle_at_50%_20%,#323232,#000_68%)] px-5 text-white sm:px-10">
        <div className="mx-auto max-w-5xl">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    initialData: reportStoryData,
  },
} satisfies Meta<typeof ReportDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {};
