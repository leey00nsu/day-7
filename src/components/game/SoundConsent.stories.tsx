import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SoundConsentPrompt } from "./SoundConsent";

const meta = {
  title: "Game/Sound Consent",
  component: SoundConsentPrompt,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SoundConsentPrompt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onDisable: () => undefined,
    onEnable: () => undefined,
  },
};
