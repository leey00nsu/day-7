import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import EndingsPage from "./endings/page";
import LibraryPage from "./library/page";
import Home from "./page";
import RankingPage from "./ranking/page";

const meta = {
  title: "Game/Screens",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const HomeScreen: Story = {
  render: () => <Home />,
};

export const EndingsScreen: Story = {
  render: () => <EndingsPage />,
};

export const LibraryScreen: Story = {
  render: () => <LibraryPage />,
};

export const RankingScreen: Story = {
  render: () => <RankingPage />,
};
