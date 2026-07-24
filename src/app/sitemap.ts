import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

const routes = ["", "/story", "/endings", "/ranking", "/library"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: new URL(route || "/", siteConfig.url).toString(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}

