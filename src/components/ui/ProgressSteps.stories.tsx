import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ProgressSteps } from "./ProgressSteps";

const meta = {
  title: "UI/ProgressSteps",
  component: ProgressSteps,
  args: {
    current: 1,
    total: 7,
    className: "w-72",
  },
  argTypes: {
    current: { control: { type: "range", min: 1, max: 7, step: 1 } },
  },
} satisfies Meta<typeof ProgressSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Monday: Story = {};

export const Friday: Story = {
  args: {
    current: 5,
  },
};
