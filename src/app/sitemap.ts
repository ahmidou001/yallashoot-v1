import { MetadataRoute } from "next";
import { dbConnect } from "@/lib/db";
import Article from "@/models/Article";
import Highlight from "@/models/Highlight";
import LiveMatch from "@/models/LiveMatch";
import { generateMatchSlug } from "@/lib/matchSlug";

export const revalidate = 3600; // Revalidate sitemap every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.yallahsoot.com";

  // 1. Static Core Site Pages
  const staticPages: MetadataRoute.Sitemap = [
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
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/highlights`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/standings`,
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
      url: `${baseUrl}/contact`,
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
  ];

  // 2. Standings League Pages
  const leagueIds = [5930, 572, 7, 11, 649, 557, 8935, 17, 25, 35, 624, 623];
  const standingsUrls: MetadataRoute.Sitemap = leagueIds.map((id) => ({
    url: `${baseUrl}/standings/${id}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // 3. Popular Team Profile Pages
  const teamIds = [
    8633, 8634, 8456, 8455, 8464, 8543, 8548, 8635, 8457, 8454,
    8650, 8649, 8648, 8871, 8852, 8853, 8873, 8874, 8872, 4950, 8638,
  ];
  const teamUrls: MetadataRoute.Sitemap = teamIds.map((id) => ({
    url: `${baseUrl}/team/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 4. Dynamic News Article URLs
  let newsUrls: MetadataRoute.Sitemap = [];

  // 5. Dynamic Match URLs
  let matchUrls: MetadataRoute.Sitemap = [];

  try {
    await dbConnect();

    // Query Articles directly from MongoDB
    const articles = await Article.find({ status: "published" })
      .sort({ published_at: -1 })
      .limit(200)
      .lean();

    newsUrls = articles.map((article: any) => ({
      url: `${baseUrl}/news/${article.slug || article._id}`,
      lastModified: article.published_at || article.created_at || new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    // Query Recent Matches directly from MongoDB
    const liveMatchDocs = await LiveMatch.find({})
      .sort({ date: -1 })
      .limit(10)
      .lean();

    const matchSet = new Set<string>();
    liveMatchDocs.forEach((doc: any) => {
      if (Array.isArray(doc.matches)) {
        doc.matches.forEach((m: any) => {
          if (m && m.id) {
            const home = m.homeCompetitor || m.teamHome || { name: "team1" };
            const away = m.awayCompetitor || m.teamAway || { name: "team2" };
            const slug = m.slug || generateMatchSlug(home, away, m.id);
            const matchUrl = `${baseUrl}/match/${slug}`;
            if (!matchSet.has(matchUrl)) {
              matchSet.add(matchUrl);
              matchUrls.push({
                url: matchUrl,
                lastModified: m.startTime ? new Date(m.startTime) : new Date(),
                changeFrequency: "hourly",
                priority: 0.9,
              });
            }
          }
        });
      }
    });

  } catch (error) {
    console.error("Error generating dynamic sitemap from MongoDB:", error);
  }

  return [
    ...staticPages,
    ...standingsUrls,
    ...teamUrls,
    ...matchUrls,
    ...newsUrls,
  ];
}
