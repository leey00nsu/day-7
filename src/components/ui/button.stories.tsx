import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PauseIcon, PlayIcon } from "lucide-react";

import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "다음 장면",
  },
  parameters: {
    docs: {
      description: {
        component:
          "shadcn 기반 버튼입니다. 게임의 주요 행동, 보조 행동, 위험 행동에 공통으로 사용합니다.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "기록 보기",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "돌아가기",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "저장 삭제",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "선택 후 계속",
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-3">
      <Button>
        <PlayIcon data-icon="inline-start" />
        재생
      </Button>
      <Button variant="outline">
        <PauseIcon data-icon="inline-start" />
        일시정지
      </Button>
    </div>
  ),
};
