import type { Preview } from "@storybook/nextjs-vite";
import "pretendard/dist/web/variable/pretendardvariable.css";

import { GamePreferencesProvider } from "../src/features/manage-game-preferences";
import { WebAudioProvider } from "../src/widgets/game-shell";
import "../src/_app/styles/globals.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <GamePreferencesProvider>
        <WebAudioProvider>
          <div className="dark min-h-svh bg-background text-foreground">
            <Story />
          </div>
        </WebAudioProvider>
      </GamePreferencesProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    backgrounds: {
      default: "game",
      values: [
        { name: "game", value: "#0b0f0d" },
        { name: "paper", value: "#f2f3f2" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "error",
    },
    layout: "centered",
  },
};

export default preview;
