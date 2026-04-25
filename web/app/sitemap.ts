import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://bess-pi.vercel.app";
  const routes = [
    "",
    "/mission",
    "/herausforderungen",
    "/news",
    "/data",
    "/simulator",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
