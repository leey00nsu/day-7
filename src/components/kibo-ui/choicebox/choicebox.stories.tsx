"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  Choicebox,
  ChoiceboxIndicator,
  ChoiceboxItem,
  ChoiceboxItemHeader,
  ChoiceboxItemSubtitle,
  ChoiceboxItemTitle,
} from "./index";

function ChoiceboxDemo() {
  const [value, setValue] = useState("reason");

  return (
    <Choicebox
      className="grid w-[440px] gap-2"
      value={value}
      onValueChange={setValue}
    >
      <ChoiceboxItem id="choice-complete" value="complete">
        <ChoiceboxIndicator id="choice-complete" />
        <ChoiceboxItemHeader>
          <ChoiceboxItemTitle>
            보고 마감에 맞춰 완료로 표시한다.
          </ChoiceboxItemTitle>
          <ChoiceboxItemSubtitle>선택 A</ChoiceboxItemSubtitle>
        </ChoiceboxItemHeader>
      </ChoiceboxItem>
      <ChoiceboxItem id="choice-reason" value="reason">
        <ChoiceboxIndicator id="choice-reason" />
        <ChoiceboxItemHeader>
          <ChoiceboxItemTitle>
            진행 상태와 미해결 사유를 남긴다.
          </ChoiceboxItemTitle>
          <ChoiceboxItemSubtitle>선택 B</ChoiceboxItemSubtitle>
        </ChoiceboxItemHeader>
      </ChoiceboxItem>
    </Choicebox>
  );
}

const meta = {
  title: "Kibo UI/Choicebox",
  component: ChoiceboxDemo,
  parameters: {
    docs: {
      description: {
        component:
          "Kibo UI Choicebox를 게임의 A/B 선택 인터페이스에 맞게 확장한 구성입니다.",
      },
    },
  },
} satisfies Meta<typeof ChoiceboxDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
