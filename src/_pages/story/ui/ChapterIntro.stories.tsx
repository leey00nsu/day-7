import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ChapterIntro } from "./ChapterIntro";

const meta = {
  title: "Pages/Story/Chapter Intro",
  component: ChapterIntro,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    title: "프롤로그",
    description: "결과 발표 일주일 전",
  },
} satisfies Meta<typeof ChapterIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Prologue: Story = {};

export const Monday: Story = {
  args: {
    title: "월요일",
    description: "아직 끝나지 않은 일",
  },
};

export const WithoutSubtitle: Story = {
  args: {
    title: "금요일",
    description: undefined,
  },
};
