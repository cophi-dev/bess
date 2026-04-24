import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://openautobidder.de";
  const routes = [
    "",
    "/simulator",
    "/revenue-stacking",
    "/german-market",
    "/resources",
    "/about",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
