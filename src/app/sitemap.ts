import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.yallahsoot.com";

  // Priority Leagues for Standings SEO
  const leagueIds = [5930, 572, 7, 11, 649, 557, 8935, 17, 25, 35, 624, 623];

  const standingsUrls = leagueIds.map((id) => ({
    url: `${baseUrl}/standings/${id}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Fetch recent news articles for dynamic news sitemap inclusion
  let newsUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${baseUrl}/api/news?limit=20`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        newsUrls = json.data.map((article: any) => ({
          url: `${baseUrl}/news/${article.slug || article._id}`,
          lastModified: article.published_at || article.updated_at || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
      }
    }
  } catch {
    // Graceful fallback if news fetch fails during build
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/live`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...standingsUrls,
    ...newsUrls,
  ];
}
