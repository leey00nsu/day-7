import type { Preview } from "@storybook/nextjs-vite";

import "../src/app/globals.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className="dark min-h-svh bg-background text-foreground">
        <Story />
      </div>
    ),
  ],
  parameters: {
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
