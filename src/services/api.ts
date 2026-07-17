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

