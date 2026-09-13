import { NextRequest, NextResponse } from "next/server";
import { getGamesList } from "@/services/api";
import { smartCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

// Major Leagues & Competitions (كبار البطولات)
const MAJOR_COMPETITION_IDS = [
  572,  // دوري أبطال أوروبا (UEFA Champions League)
  7,    // الدوري الإنجليزي الممتاز (Premier League)
  11,   // الدوري الإسباني (La Liga)
  17,   // الدوري الإيطالي (Serie A)
  25,   // الدوري الألماني (Bundesliga)
  35,   // الدوري الفرنسي (Ligue 1)
  573,  // الدوري الأوروبي (UEFA Europa League)
  7685, // دوري المؤتمر الأوروبي (UEFA Conference League)
  5930, 5931, 5932, 5933, 5934, 5935, 5936, // كأس العالم وتصفياته (World Cup & Qualifiers)
  329, 330,   // كأس أمم أوروبا وتصفياتها (Euro & Qualifiers)
  167, 168,   // كأس أمم إفريقيا وتصفياتها (AFCON & Qualifiers)
  624,  // دوري أبطال إفريقيا (CAF Champions League)
  623,  // دوري أبطال آسيا (AFC Champions League)
  649,  // الدوري السعودي للمحترفين (Saudi Pro League)
  557,  // الدوري المغربي للمحترفين (Botola Pro Morocco)
  8935, // الدوري المصري الممتاز (Egyptian Premier League)
  6820, // دوري الأمم الأوروبية (UEFA Nations League)
  621,  // كأس العالم للأندية (FIFA Club World Cup)
  5940, // كوبا أمريكا (Copa America)
];

// Top Major Clubs & National Teams (كبار الأندية وكبار المنتخبات)
const TOP_TEAMS_IDS = [
  // European Giants (كبار أندية أوروبا)
  131, // Real Madrid
  132, // Barcelona
  134, // Atletico Madrid
  110, // Manchester City
  108, // Liverpool
  104, // Arsenal
  105, // Manchester United
  106, // Chelsea
  114, // Tottenham
  331, // Bayern Munich
  341, // Borussia Dortmund
  333, // Bayer Leverkusen
  480, // Paris Saint-Germain
  224, // Inter Milan
  227, // AC Milan
  226, // Juventus
  234, // Napoli
  231, // AS Roma

  // Arab & Regional Giants (كبار الأندية العربية والأفريقية)
  5457, // Al Hilal
  7549, // Al Nassr
  5459, // Al Ittihad
  5458, // Al Ahli Saudi
  5012, // Al Ahly SC (Egypt)
  5016, // Zamalek
  12028, // Pyramids FC
  5431, // Wydad AC
  5432, // Raja CA
  5434, // AS FAR Rabat
  8892, // RS Berkane
  5030, // Esperance de Tunis
  8948, // Inter Miami (Messi)

  // Top National Teams (كبار المنتخبات العربية والعالمية)
  6031, // المغرب (Morocco)
  6023, // مصر (Egypt)
  6042, // السعودية (Saudi Arabia)
  6018, // الجزائر (Algeria)
  6048, // تونس (Tunisia)
  6037, // قطر (Qatar)
  6050, // الإمارات (UAE)
  6027, // العراق (Iraq National Team)
  6028, // الأردن (Jordan)
  5965, // فرنسا (France)
  5949, // الأرجنتين (Argentina)
  5953, // البرازيل (Brazil)
  6001, // إسبانيا (Spain)
  5961, // إنجلترا (England)
  5967, // ألمانيا (Germany)
  5993, // البرتغال (Portugal)
  5985, // هولندا (Netherlands)
  5975, // إيطاليا (Italy)
  5951, // بلجيكا (Belgium)
  5957, // كرواتيا (Croatia)
  6007, // أوروجواي (Uruguay)
  5955, // كولومبيا (Colombia)
];

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const dateStr = `${dd}/${mm}/${yyyy}`;

    // 1. Fetch both upstream featured games and today's full match feed using smartCache
    const [featRes, allScoresRes] = await Promise.all([
      smartCache.getOrFetch<any>(
        "games:featured:upstream",
        async () => {
          const res = await fetch(
            "https://webws.365scores.com/web/games/featured/?appTypeId=5&langId=27&timezoneName=Africa/Casablanca&userCountryId=127&sports=1&showOdds=true&numberOfGames=15&context=1",
            {
              headers: {
                Accept: "application/json",
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              },
            }
          );
          if (!res.ok) return {};
          const text = await res.text();
          if (!text || text.trim().startsWith("<")) return {};
          return JSON.parse(text);
        },
        60 * 1000 // 60 seconds cache for featured
      ).catch(() => ({})),
      getGamesList(dateStr).catch(() => ({ games: [], competitions: [] })),
    ]);

    const allCompetitions: any[] = [
      ...((featRes as any).competitions || []),
      ...((allScoresRes as any).competitions || []),
    ];

    const combinedGames: any[] = [
      ...((featRes as any).games || []),
      ...((allScoresRes as any).games || []),
    ];

    // Deduplicate matches by ID
    const seenIds = new Set<number>();
    const uniqueGames: any[] = [];
    for (const g of combinedGames) {
      if (g && g.id && !seenIds.has(g.id)) {
        seenIds.add(g.id);
        uniqueGames.push(g);
      }
    }

    // 2. Strict Filter: Only matches belonging to major competitions OR featuring major clubs/national teams
    const eligibleGames = uniqueGames.filter((g) => {
      const isMajorComp = MAJOR_COMPETITION_IDS.includes(g.competitionId);
      const hasTopTeam =
        TOP_TEAMS_IDS.includes(g.homeCompetitor?.id) ||
        TOP_TEAMS_IDS.includes(g.awayCompetitor?.id);

      // Exclude obscure local leagues unless they feature a recognized top club/national team
      return isMajorComp || hasTopTeam;
    });

    // 3. Priority Scoring to order the top matches
    const scoredMatches = eligibleGames.map((g) => {
      let score = 0;
      const isLive = g.statusGroup === 3;
      const isUpcoming = g.statusGroup === 2 || g.statusGroup === 1;
      const isFinished = g.statusGroup === 4;

      const hasTopTeam =
        TOP_TEAMS_IDS.includes(g.homeCompetitor?.id) ||
        TOP_TEAMS_IDS.includes(g.awayCompetitor?.id);

      const isTopTierTournament =
        g.competitionId === 572 || // دوري أبطال أوروبا
        g.competitionId === 7 ||   // الدوري الإنجليزي
        g.competitionId === 11 ||  // الدوري الإسباني
        g.competitionId === 5930;  // كأس العالم

      if (isLive) score += 100;
      if (hasTopTeam) score += 60;
      if (isTopTierTournament) score += 40;
      if (isUpcoming) score += 30;
      if (isFinished) score += 10;

      // Ensure competitionDisplayName exists
      if (!g.competitionDisplayName && !g.competitionName) {
        const comp = allCompetitions.find((c) => c.id === g.competitionId);
        if (comp) {
          g.competitionDisplayName = comp.name;
        }
      }

      return { game: g, score };
    });

    // Sort descending by importance score
    scoredMatches.sort((a, b) => b.score - a.score);

    // Pick the top 5 featured matches
    const finalFeaturedGames = scoredMatches.slice(0, 5).map((s) => s.game);

    return NextResponse.json(
      {
        success: true,
        data: finalFeaturedGames,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    console.error("Featured game API error:", err);
    return NextResponse.json({ success: false, error: err.message, data: [] });
  }
}

