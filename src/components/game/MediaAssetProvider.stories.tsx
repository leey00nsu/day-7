import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  MediaDeletePrompt,
  MediaDownloadProgress,
  MediaDownloadPrompt,
} from "./MediaAssetProvider";

const meta = {
  title: "Game/Media Download",
  component: MediaDownloadPrompt,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof MediaDownloadPrompt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Consent: Story = {
  args: {
    supported: true,
    onDownload: () => undefined,
    onStream: () => undefined,
  },
};

export const Unsupported: Story = {
  args: {
    ...Consent.args,
    supported: false,
  },
};

export const Downloading: Story = {
  args: Consent.args,
  render: () => (
    <MediaDownloadProgress
      downloadedBytes={18_000_000}
      onRetry={() => undefined}
      onStream={() => undefined}
    />
  ),
};

export const DownloadError: Story = {
  args: Consent.args,
  render: () => (
    <MediaDownloadProgress
      downloadedBytes={8_000_000}
      error="미디어 서버에 연결하지 못했습니다. 네트워크 상태를 확인해 주세요."
      onRetry={() => undefined}
      onStream={() => undefined}
    />
  ),
};

export const DeleteConfirmation: Story = {
  args: Consent.args,
  render: () => (
    <MediaDeletePrompt
      onCancel={() => undefined}
      onDelete={() => undefined}
    />
  ),
};
