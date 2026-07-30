const deploymentHost: string | undefined =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const coolifyUrl = process.env.COOLIFY_URL?.split(",")[0]?.trim();

export const siteConfig = {
  name: "정규직까지 D-7",
  shortName: "정규직 D-7",
  description:
    "7일간의 선택으로 정규직 전환과 거절의 결말을 만들어 가는 인터랙티브 오피스 드라마.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    coolifyUrl ??
    (deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000"),
  ogImage: "/og-image.png",
} as const;
