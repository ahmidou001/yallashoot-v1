import {
  GamesResponse,
  GameDetailsResponse,
  StatsResponse,
  H2HResponse,
  StandingsResponse,
  CurrentStageResponse,
} from "@/types/api";

const BASE_URL = "https://webws.365scores.com/web";

const COMMON_PARAMS = new URLSearchParams({
  appTypeId: "5",
  langId: "27", // Arabic
  timezoneName: "Africa/Casablanca",
  userCountryId: "127",
});

/**
 * Custom fetch wrapper with standard parameters
 */
async function fetchFrom365Scores<T>(endpoint: string, queryParams: Record<string, string | number | boolean> = {}, cacheOptions: RequestInit = {}): Promise<T> {
  const urlParams = new URLSearchParams(COMMON_PARAMS);
  Object.entries(queryParams).forEach(([key, val]) => {
    urlParams.set(key, String(val));
  });

  const url = `${BASE_URL}${endpoint}?${urlParams.toString()}`;

  try {
    const res = await fetch(url, {
      ...cacheOptions,
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ...cacheOptions.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from 365Scores upstream: ${res.statusText} (${res.status})`);
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error(`Error in 365Scores fetch to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * 1. Games List (/games/allscores/)
 * @param date formatted as DD/MM/YYYY
 */
export async function getGamesList(date: string): Promise<GamesResponse> {
  return fetchFrom365Scores<GamesResponse>(
    "/games/allscores/",
    {
      sports: "1", // Football
      startDate: date,
      endDate: date,
    },
    { next: { revalidate: 15 } } // Revalidate games list every 15 seconds
  );
}

/**
 * 2. Game Details & Lineups (/game/)
 * @param gameId unique match ID
 */
export async function getGameDetails(gameId: string | number): Promise<GameDetailsResponse> {
  return fetchFrom365Scores<GameDetailsResponse>(
    "/game/",
    { gameId },
    { next: { revalidate: 10 } } // Refresh lineup/timeline details quickly
  );
}

/**
 * 3. Match Statistics (/game/stats/)
 * @param gameId unique match ID (parameter key is "games")
 */
export async function getGameStats(gameId: string | number): Promise<StatsResponse> {
  return fetchFrom365Scores<StatsResponse>(
    "/game/stats/",
    { games: gameId },
    { next: { revalidate: 15 } }
  );
}

/**
 * 4. Head to Head (/games/h2h/)
 * @param gameId current match ID
 * @param matchupId formatted as homeTeamId-awayTeamId-competitionId
 */
export async function getHeadToHead(gameId: string | number, matchupId?: string | null): Promise<H2HResponse> {
  const params: Record<string, any> = { gameId };
  if (matchupId) {
    params.matchupId = matchupId;
  }
  return fetchFrom365Scores<H2HResponse>(
    "/games/h2h/",
    params,
    { next: { revalidate: 3600 } } // H2H historical listings can be cached for 1 hour
  );
}

/**
 * 6. Current Stage Utility (/games/current/)
 * Used to get current season and stage values dynamically before standings
 */
export async function getCurrentStage(competitionId: string | number): Promise<CurrentStageResponse> {
  return fetchFrom365Scores<CurrentStageResponse>(
    "/games/current/",
    {
      competitions: competitionId,
      showOdds: "false",
      includeTopBettingOpportunity: "0",
    },
    { next: { revalidate: 1800 } } // Stage status cached for 30 minutes
  );
}

/**
 * 5. Competition Standings (/standings/)
 * Fetches rankings for a league. Automatically queries the active stage/season numbers.
 */
export async function getCompetitionStandings(competitionId: string | number, live = false): Promise<StandingsResponse> {
  try {
    // 1. Fetch current stage/season variables
    const currentData = await getCurrentStage(competitionId);
    
    const params: Record<string, string> = {
      competitions: String(competitionId),
      live: live ? "true" : "false",
      isPreview: "true",
    };
    
    if (currentData?.games && currentData.games.length > 0) {
      const g = currentData.games.find((game: any) => game.competitionId === Number(competitionId));
      if (g) {
        if (g.stageNum) params.stageNum = String(g.stageNum);
        if (g.seasonNum) params.seasonNum = String(g.seasonNum);
      }
    }

    // 2. Fetch the standings tables
    return fetchFrom365Scores<StandingsResponse>(
      "/standings/",
      params,
      { next: { revalidate: 60 } } // Standings updated every minute
    );
  } catch (error) {
    console.error(`Error loading standings for competition ${competitionId}:`, error);
    // Return empty model fallback if failed
    return { standings: [] };
  }
}

/**
 * 7. Competition Games list (/games/current/)
 */
export async function getCompetitionGames(competitionId: string | number): Promise<any[]> {
  try {
    const res = await fetchFrom365Scores<any>(
      "/games/current/",
      {
        competitions: competitionId,
        showOdds: "false",
        includeTopBettingOpportunity: "0",
      },
      { next: { revalidate: 1800 } }
    );
    return res.games || [];
  } catch (error) {
    console.error(`Error loading games for competition ${competitionId}:`, error);
    return [];
  }
}

/**
 * 8. Competition top scorers (/stats/)
 */
export async function getCompetitionScorers(competitionId: string | number): Promise<any[]> {
  try {
    const json = await fetchFrom365Scores<any>(
      "/stats/",
      {
        competitions: competitionId,
        statsTypes: "1"
      },
      { next: { revalidate: 3600 } }
    );
    const goalsCategory = json.stats?.athletesStats?.find((s: any) => s.id === 1);
    const competitors = json.competitors || [];
    
    return (goalsCategory?.rows || []).map((row: any) => {
      const team = competitors.find((c: any) => c.id === row.entity.competitorId) || { name: "غير معروف", id: row.entity.competitorId, type: 1 };
      return {
        rank: row.position + 1,
        name: row.entity.name,
        athleteId: row.entity.id,
        teamId: team.id,
        teamName: team.name,
        isNational: team.type === 2,
        value: parseInt(row.stats?.[0]?.value || "0", 10),
        imageVersion: row.entity.imageVersion || 1
      };
    });
  } catch (error) {
    console.error(`Error loading scorers for competition ${competitionId}:`, error);
    return [];
  }
}

/**
 * 9. Competitor Profile (/competitors/)
 */
export async function getCompetitorProfile(teamId: string | number): Promise<any> {
  return fetchFrom365Scores<any>(
    "/competitors/",
    { competitors: String(teamId) },
    { next: { revalidate: 3600 } }
  );
}

/**
 * 10. Competitor Squad (/squads/)
 */
export async function getCompetitorSquad(teamId: string | number): Promise<any> {
  return fetchFrom365Scores<any>(
    "/squads/",
    { competitors: String(teamId) },
    { next: { revalidate: 3600 } }
  );
}

/**
 * 11. Competitor Transfers (/transfers/)
 */
export async function getCompetitorTransfers(teamId: string | number): Promise<any> {
  return fetchFrom365Scores<any>(
    "/transfers/",
    { competitors: String(teamId) },
    { next: { revalidate: 3600 } }
  );
}

/**
 * 12. Competitor Fixtures/Matches List (/games/fixtures/)
 */
export async function getCompetitorFixtures(teamId: string | number): Promise<any> {
  return fetchFrom365Scores<any>(
    "/games/fixtures/",
    {
      competitors: String(teamId),
      showOdds: "true",
      includeTopBettingOpportunity: "1",
    },
    { next: { revalidate: 300 } }
  );
}

/**
 * 12b. Competitor Past Results (/games/)
 */
export async function getCompetitorResults(teamId: string | number, afterGameId: string | number): Promise<any> {
  return fetchFrom365Scores<any>(
    "/games/",
    {
      competitors: String(teamId),
      games: "1",
      aftergame: String(afterGameId),
      direction: "-1",
      withmainodds: "true",
    },
    { next: { revalidate: 300 } }
  );
}

/**
 * 13. Competitor Standings Table (/standings/)
 */
export async function getCompetitorStandingsTable(teamId: string | number): Promise<any> {
  return fetchFrom365Scores<any>(
    "/standings/",
    {
      competitor: String(teamId),
      live: "false",
      competitions: "",
    },
    { next: { revalidate: 1800 } }
  );
}

/**
 * 14. Competitor Statistics (/stats/)
 */
export async function getCompetitorStats(teamId: string | number): Promise<any> {
  return fetchFrom365Scores<any>(
    "/stats/",
    {
      competitors: String(teamId),
      withSeasons: "true",
    },
    { next: { revalidate: 3600 } }
  );
}

/**
 * 15. Competitor Related Entities (/relatedEntities/)
 */
export async function getCompetitorRelatedEntities(teamId: string | number): Promise<any> {
  return fetchFrom365Scores<any>(
    "/relatedEntities/",
    { competitors: String(teamId) },
    { next: { revalidate: 86400 } }
  );
}

/**
 * 16. Competitor SEO Description & FAQs
 */
export async function getCompetitorSEO(teamId: string | number): Promise<any> {
  const url = `https://seo-management.365scores.com/sections/?appTypeId=5&langId=27&timezoneName=Africa%2FCasablanca&userCountryId=127&apiType=webws&sportType=1&entityType=2&entityId=${teamId}&sectionNames=ENTITY_DESCRIPTION,FAQ&activateLinks=true`;
  try {
    const res = await fetch(url, { 
      next: { revalidate: 86400 },
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Error in getCompetitorSEO:", err);
    return null;
  }
}

/**
 * 17. Competition Brackets (/brackets/)
 */
export async function getCompetitionBrackets(competitionId: string | number): Promise<any> {
  return fetchFrom365Scores<any>(
    "/brackets/",
    {
      competitions: String(competitionId),
      live: "false",
    },
    { next: { revalidate: 3600 } }
  );
}

