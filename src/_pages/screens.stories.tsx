import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EndingsPage } from "./endings";
import { HomePage } from "./home";
import { ReportPage } from "./report";

const meta = {
  title: "Pages/Screens",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const HomeScreen: Story = {
  render: () => <HomePage />,
};

export const EndingsScreen: Story = {
  render: () => <EndingsPage />,
};

export const ReportScreen: Story = {
  render: () => <ReportPage />,
};
