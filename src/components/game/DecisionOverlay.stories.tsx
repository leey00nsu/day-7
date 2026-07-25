import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DecisionOverlay } from "./DecisionOverlay";

const meta = {
  title: "Game/Decision Overlay",
  component: DecisionOverlay,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div
        className="relative aspect-video min-h-[420px] w-full bg-cover bg-center"
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
    choices: ["지시대로 완료 처리한다.", "대기 상태를 그대로 둔다."],
    prompt: "끝나지 않은 업무를 완료로 처리할 것인가?",
  },
} satisfies Meta<typeof DecisionOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftAndRight: Story = {};
