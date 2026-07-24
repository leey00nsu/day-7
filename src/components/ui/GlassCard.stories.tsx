import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GlassCard } from "./GlassCard";

const meta = {
  title: "UI/GlassCard",
  component: GlassCard,
  args: {
    className: "w-[360px] p-6",
    children: (
      <>
        <p className="text-xs font-semibold tracking-[0.14em] text-primary">
          MONDAY
        </p>
        <h2 className="mt-2 text-xl font-bold">아직 끝나지 않은 일</h2>
        <p className="mt-3 leading-6 text-muted-foreground">
          영상 위에서도 대사와 선택이 읽히도록 배경을 흐리고 대비를 유지합니다.
        </p>
      </>
    ),
  },
} satisfies Meta<typeof GlassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    className: "w-[320px] rounded-2xl p-4",
  },
};
