import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ChoiceFeedback } from "./ChoiceFeedback";

const meta = {
  title: "Game/Choice Feedback",
  component: ChoiceFeedback,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div
        className="relative min-h-[420px] bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/story/open-office-set.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/25" />
        <Story />
      </div>
    ),
  ],
  args: {
    message: "이대리는 김인턴이 선을 그은 것을 기억할 것입니다.",
  },
} satisfies Meta<typeof ChoiceFeedback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Exiting: Story = {
  args: {
    exiting: true,
  },
};
