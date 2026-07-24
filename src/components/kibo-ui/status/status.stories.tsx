import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Status, StatusIndicator, StatusLabel } from "./index";

const meta = {
  title: "Kibo UI/Status",
  component: Status,
  args: {
    status: "online",
  },
} satisfies Meta<typeof Status>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlaybackStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Status status="online">
        <StatusIndicator />
        <StatusLabel>재생 중</StatusLabel>
      </Status>
      <Status status="maintenance">
        <StatusIndicator />
        <StatusLabel>선택 대기</StatusLabel>
      </Status>
      <Status status="degraded">
        <StatusIndicator />
        <StatusLabel>불러오는 중</StatusLabel>
      </Status>
      <Status status="offline">
        <StatusIndicator />
        <StatusLabel>연결 끊김</StatusLabel>
      </Status>
    </div>
  ),
};
