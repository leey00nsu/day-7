import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Pill, PillIndicator, PillStatus } from "./index";

const meta = {
  title: "Kibo UI/Pill",
  component: Pill,
} satisfies Meta<typeof Pill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SaveState: Story = {
  render: () => (
    <Pill>
      <PillStatus>
        <PillIndicator pulse />
        자동 저장
      </PillStatus>
      SLOT 01
    </Pill>
  ),
};

export const EndingId: Story = {
  args: {
    variant: "outline",
    children: "E03",
  },
};
