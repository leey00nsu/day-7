import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CogIcon, PauseIcon, PlayIcon } from "lucide-react";

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
          "shadcn 기반 버튼입니다. 게임의 주요 행동, 보조 행동, 위험 행동에 공통으로 사용하며 호버 시 Border Glow가 자동 재생됩니다.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const BorderGlowOnHover: Story = {
  args: {
    children: "호버해서 경계 효과 보기",
  },
};

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

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "옵션",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    children: "자세히 보기",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "선택 후 계속",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="xs">아주 작게</Button>
      <Button size="sm">작게</Button>
      <Button size="default">기본</Button>
      <Button size="lg">크게</Button>
    </div>
  ),
};

export const IconButtons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button aria-label="작은 옵션" size="icon-xs" variant="ghost">
        <CogIcon />
      </Button>
      <Button aria-label="옵션" size="icon" variant="ghost">
        <CogIcon />
      </Button>
      <Button aria-label="큰 옵션" size="icon-lg" variant="ghost">
        <CogIcon />
      </Button>
    </div>
  ),
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
