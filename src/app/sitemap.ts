import type { MetadataRoute } from "next";

import { siteConfig } from "@/shared/config";

const routes = ["", "/story", "/endings", "/report"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: new URL(route || "/", siteConfig.url).toString(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
