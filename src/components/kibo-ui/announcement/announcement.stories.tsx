import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "./index";

const meta = {
  title: "Kibo UI/Announcement",
  component: Announcement,
} satisfies Meta<typeof Announcement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CurrentScene: Story = {
  render: () => (
    <Announcement themed>
      <AnnouncementTag>DAY 1</AnnouncementTag>
      <AnnouncementTitle>월요일 · 아직 끝나지 않은 일</AnnouncementTitle>
    </Announcement>
  ),
};
