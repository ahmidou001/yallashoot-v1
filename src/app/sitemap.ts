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

  // 3. Dynamic Team Profile Pages (Base popular + dynamically collected from all matches)
  const baseTeamIds = [
    8633, 8634, 8456, 8455, 8464, 8543, 8548, 8635, 8457, 8454,
    8650, 8649, 8648, 8871, 8852, 8853, 8873, 8874, 8872, 4950, 8638,
    1339, 7549, 227, 104, 106, 132, 139, 8593, 8223, 11113, 5426, 20504, 1180, 70839
  ];
  const teamIdSet = new Set<number>(baseTeamIds);

  // Dynamic news, matches, highlights URLs
  let newsUrls: MetadataRoute.Sitemap = [];
  let matchUrls: MetadataRoute.Sitemap = [];
  let highlightUrls: MetadataRoute.Sitemap = [];

  try {
    await dbConnect();

    // Query published articles
    const articles = await Article.find({ status: "published" })
      .sort({ published_at: -1 })
      .limit(500)
      .lean();

    newsUrls = articles.map((article: any) => ({
      url: `${baseUrl}/news/${article.slug || article._id}`,
      lastModified: article.published_at || article.created_at || new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    // Query published video highlights
    try {
      const highlights = await Highlight.find({ status: "published" })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      highlightUrls = highlights.map((h: any) => ({
        url: `${baseUrl}/highlights`,
        lastModified: h.updatedAt || h.createdAt || new Date(),
        changeFrequency: "daily",
        priority: 0.7,
      }));
    } catch (hErr) {
      console.warn("Highlight sitemap query skipped:", hErr);
    }

    // Query all match documents across all dates (no restrictive 10-doc limit)
    const liveMatchDocs = await LiveMatch.find({})
      .sort({ date: -1 })
      .lean();

    const matchSet = new Set<string>();

    liveMatchDocs.forEach((doc: any) => {
      if (Array.isArray(doc.matches)) {
        doc.matches.forEach((m: any) => {
          if (m && m.id) {
            const home = m.home || m.homeCompetitor || m.teamHome || { name: "team1" };
            const away = m.away || m.awayCompetitor || m.teamAway || { name: "team2" };

            // Dynamic team ID collection
            const hId = home.id || (m.homeCompetitor && m.homeCompetitor.id) || (m.teamHome && m.teamHome.id);
            const aId = away.id || (m.awayCompetitor && m.awayCompetitor.id) || (m.teamAway && m.teamAway.id);
            if (hId && Number(hId)) teamIdSet.add(Number(hId));
            if (aId && Number(aId)) teamIdSet.add(Number(aId));

            const generatedSlug = generateMatchSlug(home, away, m.id);
            const slugsToAdd = new Set<string>();

            if (m.slug) {
              slugsToAdd.add(m.slug);
              if (!m.slug.endsWith(`-${m.id}`)) {
                slugsToAdd.add(`${m.slug}-${m.id}`);
              }
            }
            slugsToAdd.add(generatedSlug);

            const matchDate = m.startTime ? new Date(m.startTime) : new Date();
            const isRecent = Date.now() - matchDate.getTime() < 7 * 24 * 60 * 60 * 1000;

            slugsToAdd.forEach((slug) => {
              const matchUrl = `${baseUrl}/match/${slug}`;
              if (!matchSet.has(matchUrl)) {
                matchSet.add(matchUrl);
                matchUrls.push({
                  url: matchUrl,
                  lastModified: matchDate,
                  changeFrequency: isRecent ? "hourly" : "weekly",
                  priority: isRecent ? 0.9 : 0.7,
                });
              }
            });
          }
        });
      }
    });

  } catch (error) {
    console.error("Error generating dynamic sitemap from MongoDB:", error);
  }

  // Build team URLs from all collected team IDs
  const teamUrls: MetadataRoute.Sitemap = Array.from(teamIdSet).map((id) => ({
    url: `${baseUrl}/team/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...standingsUrls,
    ...teamUrls,
    ...matchUrls,
    ...newsUrls,
    ...highlightUrls,
  ];
}

