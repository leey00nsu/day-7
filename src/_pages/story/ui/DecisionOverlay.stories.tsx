import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DecisionOverlay } from "./DecisionOverlay";

const meta = {
  title: "Pages/Story/Decision Overlay",
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

export const MobileWrapping: Story = {
  args: {
    choices: [
      "오늘 안에 할 수 있는 데까지 정리한 뒤 퇴근한다.",
      "선약을 취소하고 모든 수치를 다시 확인한다.",
    ],
    prompt:
      "퇴근 직전에 전달받은 추가 업무를 오늘 모두 처리할 것인가?",
  },
  decorators: [
    (Story) => (
      <div className="relative mx-auto h-[844px] w-[390px] max-w-full overflow-hidden bg-black">
        <Story />
      </div>
    ),
  ],
};
