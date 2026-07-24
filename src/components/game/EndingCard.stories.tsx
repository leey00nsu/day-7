import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { endings } from "@/data/game";

import { EndingCard } from "./EndingCard";

const meta = {
  title: "Game/Ending Card",
  component: EndingCard,
  decorators: [
    (Story) => (
      <div className="min-h-svh bg-black p-10 text-white">
        <div className="mx-auto max-w-md">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof EndingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unlocked: Story = {
  args: {
    ending: endings[0],
    unlocked: true,
  },
};

export const Locked: Story = {
  args: {
    ending: endings[1],
    unlocked: false,
    onSelect: () => undefined,
  },
};
