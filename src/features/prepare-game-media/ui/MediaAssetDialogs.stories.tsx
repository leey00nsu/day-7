import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  MediaDeletePrompt,
  MediaDownloadProgress,
  MediaDownloadPrompt,
} from "./MediaAssetDialogs";

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
    onDownload: () => undefined,
    onStream: () => undefined,
  },
};

export const MobileDownloadRequired: Story = {
  args: {
    ...Consent.args,
    downloadRequired: true,
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

export const MobileDownloadError: Story = {
  args: Consent.args,
  render: () => (
    <MediaDownloadProgress
      allowStreaming={false}
      downloadedBytes={8_000_000}
      error="영상 및 음성 데이터를 다운로드하지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해 주세요."
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

export const MobileDeleteConfirmation: Story = {
  args: Consent.args,
  render: () => (
    <MediaDeletePrompt
      downloadRequired
      onCancel={() => undefined}
      onDelete={() => undefined}
    />
  ),
};
